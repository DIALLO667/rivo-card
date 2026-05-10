import React from 'react';
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Send, Globe } from 'lucide-react';
import { normalizeUrl } from '@/lib/urlUtils';

export default function Perso({ profile }) {
  if (!profile) return null;

  const socials = [
    { id: 'instagram', url: profile.instagram, icon: <Instagram size={18} /> },
    { id: 'linkedin', url: profile.linkedin, icon: <Linkedin size={18} /> },
    { id: 'facebook', url: profile.facebook, icon: <Facebook size={18} /> },
    { id: 'youtube', url: profile.youtube, icon: <Youtube size={18} /> },
    { id: 'twitter', url: profile.twitter, icon: <Twitter size={18} /> },
    { id: 'telegram', url: profile.telegram, icon: <Send size={18} /> },
    { id: 'website', url: profile.website, icon: <Globe size={18} /> },
  ].filter(s => s.url);

  return (
    <div className="w-full max-w-[420px] rounded-lg p-6 bg-[#0a0a0b] text-white font-sans shadow">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
          {profile.avatar || profile.photo ? (
            <img src={profile.avatar || profile.photo} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="uppercase font-bold">{(profile.name || 'R').charAt(0)}</div>
          )}
        </div>
        <div>
          <div className="text-lg font-black">{profile.name}</div>
          <div className="text-sm text-white/70">{profile.title}</div>
        </div>
      </div>

      {profile.bio && <p className="mt-4 text-sm text-white/70">{profile.bio}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {socials.map(s => (
          <a
            key={s.id}
            href={normalizeUrl(s.url)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-md"
          >
            <div className="text-white/90">{s.icon}</div>
            <div className="text-sm text-white/90 capitalize">{s.id}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
