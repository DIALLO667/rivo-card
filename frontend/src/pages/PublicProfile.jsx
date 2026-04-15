import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Globe, Mail, Instagram, Facebook, Linkedin,Youtube,Twitter, ShieldAlert, MapPin, Send } from 'lucide-react';
import TemplateQuietLuxury from '@/components/templates/TemplateQuietLuxury';
import TemplateCleanLinks from '@/components/templates/TemplateCleanLinks';
import { normalizeUrl } from '@/lib/urlUtils';
import CVView from '@/components/templates/CVView';

const API = process.env.REACT_APP_API_URL;

const TikTokIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.73 8.73 0 01-1.89-1.42l-.01 7.41c.02 1.34-.17 2.72-.73 3.94-.62 1.39-1.68 2.62-3.04 3.36-1.39.78-3.04 1.12-4.63 1.01-1.61-.08-3.23-.62-4.54-1.6-1.37-1-2.4-2.47-2.85-4.08-.48-1.65-.36-3.48.35-5.06.63-1.45 1.73-2.73 3.12-3.49 1.43-.8 3.14-1.15 4.75-1.01.01 1.41.01 2.82.01 4.23-1.03-.22-2.16-.14-3.1.34-.84.41-1.52 1.17-1.81 2.06-.32.93-.24 2 .24 2.87.41.77 1.15 1.38 2.01 1.62.88.26 1.86.19 2.69-.21.78-.36 1.41-1.04 1.74-1.83.24-.59.32-1.23.31-1.87L12.52.02z"/>
  </svg>
);

export default function PublicProfile() {
  const { uniqueLink } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uniqueLink) {
      axios.get(`${API}/profiles/public/${uniqueLink}`)
        .then(res => {
          const p = res.data || {};
          // Normalize common social URLs so templates can safely use them
          const normalized = { ...p };
          ['instagram','linkedin','facebook','tiktok','telegram','youtube','twitter','snapchat','website'].forEach(k => {
            if (p[k]) normalized[k] = normalizeUrl(p[k]);
          });
          setProfile(normalized);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [uniqueLink]);

  if (loading) return <div className="h-screen bg-[#0a0a0b] flex items-center justify-center text-white italic tracking-widest uppercase text-xs">Rivo...</div>;
  if (!profile) return <div className="h-screen bg-[#0a0a0b] flex items-center justify-center text-white italic">Profil introuvable</div>;

  if (profile.is_archived) {
    return (
      <div className="h-screen w-full bg-[#0a0a0b] flex justify-center items-center p-6 font-sans">
        <div className="w-full max-w-[400px] bg-gradient-to-b from-[#1a1c1e] to-[#0a0a0b] border border-red-500/20 rounded-[3rem] p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-red-500/10 rounded-full">
              <ShieldAlert size={50} className="text-red-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Profil Suspendu</h1>
          <p className="text-gray-400 text-sm mb-10 px-4">
            Ce profil <span className="text-white font-bold">Rivo Card</span> est actuellement désactivé.
          </p>
          <p className="text-[10px] text-gray-600 font-black tracking-[0.5em] uppercase">Rivo Card Premium</p>
        </div>
      </div>
    );
  }

  const socialIcons = [
    { id: 'instagram', icon: <Instagram size={28} />, color: '#E4405F', url: profile.instagram },
    { id: 'linkedin', icon: <Linkedin size={28} />, color: '#0A66C2', url: profile.linkedin },
    { id: 'facebook', icon: <Facebook size={28} />, color: '#1877F2', url: profile.facebook },
    { id: 'tiktok', icon: <TikTokIcon size={28} />, color: '#FFFFFF', url: profile.tiktok },
    { id: 'telegram', icon: <Send size={28} />, color: '#0088cc', url: profile.telegram }, 
    { id: 'youtube', icon: <Youtube size={28} />, color: '#FF0000', url: profile.youtube },
    { id: 'twitter', icon: <Twitter size={28} />, color: '#1DA1F2', url: profile.twitter },
    { 
      id: 'snapchat', 
      icon: (
        <img 
          src="https://cdn.simpleicons.org/snapchat" 
          alt="Snapchat" 
          className="w-7 h-7"
          style={{ 
            filter: profile.design_type === 'modern' 
              ? 'none' 
              : 'sepia(1) saturate(5) hue-rotate(10deg) brightness(0.9)' 
          }} 
        />
      ), 
      color: '#FFFC00', 
      url: profile.snapchat 
    }
  ];

  // Render based on card_type and template_id
  const renderByType = () => {
    if (profile.card_type === 'cv') {
      const downloadUrl = `${API}/profiles/public/${profile.unique_link}/cv`;
      return <CVView profile={profile} downloadUrl={downloadUrl} />;
    }
    // profile card
    if (profile.template_id === 'template2') {
      return <TemplateCleanLinks profile={profile} />;
    }
    return <TemplateQuietLuxury profile={profile} />;
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0b] flex justify-center items-center overflow-hidden font-sans">
      {renderByType()}
    </div>
  );
}