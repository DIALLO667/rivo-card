import React from 'react';
import { FaSnapchatGhost, FaTiktok, FaInstagram, FaLinkedinIn, FaEllipsisV } from 'react-icons/fa';
import { normalizeUrl } from '@/lib/urlUtils';

const TemplateCleanLinks = ({ profile }) => {
  const data = profile || {};
  const name = data.name || 'Amadou Diallo';
  const photo = data.photo_url || 'https://via.placeholder.com/150';
  const bio = data.bio || 'ALL MY LINKS 👋';

  // Configuration des liens dynamiques
  const defaultLinks = [
    { platform: 'Snapchat', url: data.snapchat || '#', icon: <FaSnapchatGhost size={20} /> },
    { platform: 'TikTok', url: data.tiktok || '#', icon: <FaTiktok size={20} /> },
    { platform: 'Instagram', url: data.instagram || '#', icon: <FaInstagram size={20} /> },
    { platform: 'LinkedIn', url: data.linkedin || '#', icon: <FaLinkedinIn size={20} /> }
  ];

  const linksToDisplay = Array.isArray(data.links) && data.links.length > 0 ? data.links : defaultLinks;

  const makeHref = (raw) => {
    if (!raw || typeof raw !== 'string') return '#';
    const trimmed = raw.trim();
    if (trimmed === '#' || trimmed === '') return '#';
    return normalizeUrl(trimmed);
  };

  return (
    <div
      className="w-full flex flex-col items-center relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(180deg, #E8F2FB 0%, #FFFFFF 100%)', // Fond dégradé bleu très clair vers blanc
        minHeight: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center pt-16 mb-8 text-center w-full px-6">
        {/* Photo avec Glow Bleu comme sur la capture */}
        <div className="w-28 h-28 rounded-full mb-6 relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-blue-400/40 animate-pulse"></div>
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white relative z-10 shadow-lg">
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-[#2D3A54]">
          {name}
        </h1>

        <p className="text-[10px] tracking-[0.1em] font-bold opacity-60 uppercase text-[#2D3A54] mb-4">
          {bio}
        </p>

        {/* Barre d'icônes rapides */}
        <div className="flex gap-4 opacity-80 text-[#2D3A54]">
           <FaSnapchatGhost size={16} />
           <FaTiktok size={16} />
           <FaInstagram size={16} />
           <FaLinkedinIn size={16} />
        </div>
      </div>

      {/* LINKS SECTION */}
      <div className="w-full max-w-[90%] sm:max-w-[400px] space-y-4 mb-16 px-2">
        {linksToDisplay.map((link, index) => {
          const href = makeHref(link.url || link.href || '#');
          return (
            <a 
              key={index} 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full transition-transform active:scale-[0.97]"
            >
              <div className="w-full bg-[#5279A8] text-white h-[64px] rounded-[32px] flex items-center px-7 relative shadow-md border border-white/20">
                <div className="text-white absolute left-7">
                  {link.icon ? link.icon : <FaInstagram size={20}/>}
                </div>
                <span className="flex-1 text-center text-[13px] font-semibold tracking-wide">
                  {link.platform || link.title || link.label}
                </span>
                <FaEllipsisV size={12} className="text-white/30 absolute right-7" />
              </div>
            </a>
          );
        })}

        {/* BOUTON REDIRECTION SITE */}
        <div className="pt-6">
          <a 
            href="https://rivostudiotech.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full"
          >
            <button className="w-full bg-white text-[#2D3A54] h-[55px] rounded-[28px] text-[11px] font-bold tracking-tight flex items-center justify-center shadow-lg border border-blue-50 active:bg-blue-50 transition-all">
              Rejoignez {name.split(' ')[0]} sur Rivo Card
            </button>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pb-8 opacity-20 text-[8px] font-bold tracking-[0.4em] flex gap-4 text-[#2D3A54]">
        <span>RIVO STUDIO</span>
        <span>•</span>
        <span>CLEAN EDITION</span>
      </div>
    </div>
  );
};

export default TemplateCleanLinks;