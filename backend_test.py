#!/usr/bin/env python3
"""
Backend API Testing for JPM NFC Business Cards Platform
Tests all authentication, profile management, and file operations
"""

import requests
import sys
import json
from datetime import datetime
from typing import Optional, Dict, Any

class JPMAPITester:
    def __init__(self, base_url="https://nfc-profile-hub-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_data = None
        self.test_profile_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        print(f"{status} - {name}")
        if details:
            print(f"   {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    files: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make API request and validate response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.session_token and not files:
            headers['Authorization'] = f'Bearer {self.session_token}'
            
        if data and not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    if self.session_token:
                        headers['Authorization'] = f'Bearer {self.session_token}'
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json() if response.content else {}
            except:
                response_data = {"raw_content": response.text[:200]}

            if not success:
                response_data["status_code"] = response.status_code
                response_data["expected_status"] = expected_status

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_authentication(self):
        """Test JWT authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with provided credentials
        success, response = self.make_request(
            "POST", "auth/login",
            data={"email": "admin@jpm.com", "password": "test123"}
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            self.user_data = response.get('user', {})
            self.log_test("JWT Login", True, f"Token received, user: {self.user_data.get('email')}")
        else:
            self.log_test("JWT Login", False, f"Login failed: {response}")
            return False

        # Test /api/auth/me protected route
        success, response = self.make_request("GET", "auth/me")
        
        if success and 'user_id' in response:
            self.log_test("Protected Route /auth/me", True, f"User data retrieved: {response.get('email')}")
        else:
            self.log_test("Protected Route /auth/me", False, f"Auth check failed: {response}")
            return False

        return True

    def test_profile_creation(self):
        """Test profile creation with all fields"""
        print("\n👤 Testing Profile Creation...")
        
        test_profile_data = {
            "name": "Test Profile JPM",
            "job": "Test Engineer NFC", 
            "phone": "+33612345678",
            "whatsapp": "+33612345678",
            "website": "https://test.jpm.com",
            "address": "123 Rue de Test, 75001 Paris",
            "instagram": "@testjpm",
            "facebook": "facebook.com/testjpm",
            "linkedin": "linkedin.com/in/testjpm",
            "tiktok": "@testjpm", 
            "youtube": "youtube.com/@testjpm",
            "primary_color": "#FFD700",
            "secondary_color": "#8B4513"
        }
        
        success, response = self.make_request(
            "POST", "profiles",
            data=test_profile_data, 
            expected_status=200  # Backend returns 200, not 201
        )
        
        if success and 'profile_id' in response:
            self.test_profile_id = response['profile_id']
            unique_link = response.get('unique_link')
            self.log_test("Profile Creation", True, f"Profile created: {unique_link}")
            return True
        else:
            self.log_test("Profile Creation", False, f"Creation failed: {response}")
            return False

    def test_profile_listing_and_filters(self):
        """Test profile listing with different filters"""
        print("\n📋 Testing Profile Listing and Filters...")
        
        # Test listing all profiles
        success, response = self.make_request("GET", "profiles")
        
        if success and isinstance(response, list):
            profile_count = len(response)
            self.log_test("List All Profiles", True, f"Found {profile_count} profiles")
        else:
            self.log_test("List All Profiles", False, f"Listing failed: {response}")

        # Test expiring filter (< 30 days)
        success, response = self.make_request("GET", "profiles?filter=expiring")
        
        if success and isinstance(response, list):
            expiring_count = len(response)
            self.log_test("Filter Expiring Profiles", True, f"Found {expiring_count} expiring profiles")
        else:
            self.log_test("Filter Expiring Profiles", False, f"Filter failed: {response}")

        # Test archived filter
        success, response = self.make_request("GET", "profiles?filter=archived")
        
        if success and isinstance(response, list):
            archived_count = len(response)
            self.log_test("Filter Archived Profiles", True, f"Found {archived_count} archived profiles")
        else:
            self.log_test("Filter Archived Profiles", False, f"Filter failed: {response}")

    def test_profile_operations(self):
        """Test profile modification and archiving"""
        if not self.test_profile_id:
            self.log_test("Profile Operations", False, "No test profile available")
            return
            
        print("\n🔧 Testing Profile Operations...")
        
        # Test profile update
        update_data = {
            "name": "Updated Test Profile",
            "primary_color": "#FF6347"
        }
        
        success, response = self.make_request(
            "PUT", f"profiles/{self.test_profile_id}",
            data=update_data
        )
        
        if success and response.get('name') == "Updated Test Profile":
            self.log_test("Profile Update", True, "Profile updated successfully")
        else:
            self.log_test("Profile Update", False, f"Update failed: {response}")

        # Test profile archiving
        success, response = self.make_request(
            "PATCH", f"profiles/{self.test_profile_id}/archive"
        )
        
        if success and 'is_archived' in response:
            archived_status = response['is_archived']
            self.log_test("Profile Archive Toggle", True, f"Archive status: {archived_status}")
        else:
            self.log_test("Profile Archive Toggle", False, f"Archive failed: {response}")

    def test_public_profile_access(self):
        """Test public profile access"""
        print("\n🌐 Testing Public Profile Access...")
        
        # Test with known test profile link
        test_link = "jean-dupont-b384445e"
        success, response = self.make_request("GET", f"profiles/public/{test_link}")
        
        if success and 'name' in response:
            profile_name = response.get('name')
            is_archived = response.get('is_archived', False)
            self.log_test("Public Profile Access", True, 
                         f"Profile found: {profile_name}, Archived: {is_archived}")
        else:
            self.log_test("Public Profile Access", False, f"Public access failed: {response}")

    def test_vcard_generation(self):
        """Test vCard file generation"""
        print("\n📄 Testing vCard Generation...")
        
        if not self.test_profile_id:
            # Try with known test profile - we need to get its ID first
            test_link = "jean-dupont-b384445e" 
            success, profile_data = self.make_request("GET", f"profiles/public/{test_link}")
            if success and 'profile_id' in profile_data:
                test_profile_id = profile_data['profile_id']
            else:
                self.log_test("vCard Generation", False, "No profile available for vCard test")
                return
        else:
            test_profile_id = self.test_profile_id

        # Test vCard generation
        url = f"{self.api_url}/profiles/{test_profile_id}/vcard"
        headers = {}
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200 and 'text/vcard' in response.headers.get('content-type', ''):
                vcard_content = response.text
                has_vcard_structure = 'BEGIN:VCARD' in vcard_content and 'END:VCARD' in vcard_content
                self.log_test("vCard Generation", has_vcard_structure, 
                             f"vCard generated successfully" if has_vcard_structure else "Invalid vCard format")
            else:
                self.log_test("vCard Generation", False, f"vCard generation failed: {response.status_code}")
        except Exception as e:
            self.log_test("vCard Generation", False, f"vCard test error: {str(e)}")

    def test_file_upload(self):
        """Test file upload functionality"""
        print("\n📤 Testing File Upload...")
        
        # Create a small test image file
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test.png', test_image_content, 'image/png')}
        
        success, response = self.make_request(
            "POST", "upload",
            files=files
        )
        
        if success and 'url' in response:
            upload_url = response['url']
            self.log_test("File Upload", True, f"File uploaded: {upload_url}")
        else:
            self.log_test("File Upload", False, f"Upload failed: {response}")

    def run_all_tests(self):
        """Execute all test suites"""
        print("🚀 Starting JPM API Testing...")
        print(f"Backend URL: {self.base_url}")
        
        # Authentication is required for most operations
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return self.get_summary()

        # Run all test suites
        self.test_profile_creation()
        self.test_profile_listing_and_filters()
        self.test_profile_operations()
        self.test_public_profile_access()
        self.test_vcard_generation()
        self.test_file_upload()

        return self.get_summary()

    def get_summary(self):
        """Generate test summary"""
        print(f"\n📊 TEST SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['details']}")

        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = JPMAPITester()
    summary = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if summary["success_rate"] == 100.0 else 1)