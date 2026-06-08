#!/usr/bin/env python3
"""
Script: transform_existing_photos.py

Purpose:
- Iterate over profiles in MongoDB and for each profile with a `photo_url` that hasn't
  been transformed yet (no `photo_transformed: True`), download the image and upload
  to Cloudinary applying the same transformations used at profile creation.
- Update the profile document's `photo_url` to the secure URL returned by Cloudinary
  and set `photo_transformed: True`.

Usage:
  - Ensure environment variables are set (MONGO_URL, DB_NAME, CLOUDINARY_*).
  - Run: python3 scripts/transform_existing_photos.py

Notes:
- This script will not run in this environment because it needs your private keys.
- It is idempotent: profiles already marked with `photo_transformed: True` are skipped.
"""

import os
import sys
import io
import time
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader

# Configuration
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, '.env'))

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
CLOUD_KEY = os.environ.get('CLOUDINARY_API_KEY')
CLOUD_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

if not MONGO_URL or not DB_NAME or not CLOUD_NAME or not CLOUD_KEY or not CLOUD_SECRET:
    print('Missing required environment variables. Please set MONGO_URL, DB_NAME and Cloudinary creds.')
    sys.exit(1)

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=CLOUD_KEY,
    api_secret=CLOUD_SECRET,
    secure=True,
)

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
profiles = db.profiles


def download_image(url):
    try:
        resp = requests.get(url, stream=True, timeout=15)
        resp.raise_for_status()
        buf = io.BytesIO()
        total = 0
        for chunk in resp.iter_content(chunk_size=8192):
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_IMAGE_SIZE:
                raise RuntimeError('Image size exceeds MAX_IMAGE_SIZE')
            buf.write(chunk)
        buf.seek(0)
        return buf
    except Exception as e:
        raise


def transform_and_upload(buf, public_id=None):
    # Upload with the same transformation used in server: 400x400 thumb gravity face, webp transparent
    try:
        res = cloudinary.uploader.upload(
            buf,
            folder='jpm_photos',
            resource_type='image',
            public_id=public_id,
            overwrite=True,
            transformation=[
                {"width": 400, "height": 400, "crop": "thumb", "gravity": "face"},
                {"format": "webp", "background": "transparent"}
            ]
        )
        return res.get('secure_url')
    except Exception:
        raise


def main(dry_run=False, limit=None):
    query = {"photo_url": {"$exists": True}, "photo_transformed": {"$ne": True}}
    cursor = profiles.find(query)
    if limit:
        cursor = cursor.limit(limit)

    total = profiles.count_documents(query)
    print(f'Found {total} profiles to process')

    i = 0
    for p in cursor:
        i += 1
        profile_id = p.get('profile_id') or p.get('_id')
        photo_url = p.get('photo_url')
        print(f'[{i}/{total}] Processing profile {profile_id}...')
        try:
            buf = download_image(photo_url)
        except Exception as e:
            print(f'  - Failed to download image: {e}')
            continue
        if dry_run:
            print('  - Dry run: would upload transformed image')
            continue
        try:
            secure_url = transform_and_upload(buf, public_id=(profile_id if profile_id else None))
            if secure_url:
                now = datetime.now(timezone.utc).isoformat()
                profiles.update_one({'_id': p['_id']}, {'$set': {'photo_url': secure_url, 'photo_transformed': True, 'updated_at': now}})
                print(f'  - Updated photo_url -> {secure_url}')
            else:
                print('  - Cloudinary did not return secure_url')
        except Exception as e:
            print(f'  - Failed upload/transform: {e}')
        # brief sleep to avoid flooding
        time.sleep(0.3)

    print('Done')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Do not upload, only report')
    parser.add_argument('--limit', type=int, help='Limit number of profiles to process')
    args = parser.parse_args()
    main(dry_run=args.dry_run, limit=args.limit)
