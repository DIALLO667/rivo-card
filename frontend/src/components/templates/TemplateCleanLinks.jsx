import React from 'react';
import { FaSnapchatGhost, FaTiktok, FaInstagram, FaLinkedinIn, FaEllipsisV } from 'react-icons/fa';
import { normalizeUrl, makeVCard } from '@/lib/urlUtils';

const TemplateCleanLinks = ({ profile }) => {
  const data = profile || {};
  const name = data.name || 'Salla Seck';
  const photo = data.photo_url || 'https://via.placeholder.com/150';
  const bio = data.bio || 'ALL MY LINKS 🙃';

  // If the backend provides a `links` array, use it; otherwise build from known social fields
  const defaultLinks = [
    { platform: 'Snapchat', url: data.snapchat || '#', icon: <FaSnapchatGhost size={22} /> },
    { platform: 'TikTok', url: data.tiktok || '#', icon: <FaTiktok size={22} /> },
    { platform: 'Instagram', url: data.instagram || '#', icon: <FaInstagram size={22} /> },
    { platform: 'LinkedIn', url: data.linkedin || '#', icon: <FaLinkedinIn size={22} /> }
  ];

  const linksToDisplay = Array.isArray(data.links) && data.links.length > 0 ? data.links : defaultLinks;

  const handleVCardDownload = () => {
    const vcardText = makeVCard({ name: data.name || '', phone: data.phone || '', email: data.email || '' });
    const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.name || 'contact').replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const makeHref = (raw) => {
    if (!raw || typeof raw !== 'string') return '#';
    const trimmed = raw.trim();
    if (trimmed === '#') return '#';
    if (/^mailto:|^tel:/i.test(trimmed)) return trimmed;
    return normalizeUrl(trimmed);
  };

  return (
    <div
      className="w-full flex flex-col items-center relative overflow-x-hidden"
      style={{
        backgroundColor: '#B8A78A',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      <div className="flex flex-col items-center pt-16 mb-8 text-center w-full px-6">
        <div className="w-28 h-28 rounded-full mb-6 shadow-2xl overflow-hidden border-[3px] border-white/20">
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-[#1F1F1F]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h1>

        <p className="text-[11px] tracking-[0.2em] font-bold opacity-80 uppercase text-[#1F1F1F]">
          {bio}
        </p>

        <div className="flex gap-5 mt-5 opacity-70 text-[#1F1F1F]">
          {data.snapchat ? (
            <a href={makeHref(data.snapchat)} target="_blank" rel="noopener noreferrer"><FaSnapchatGhost size={18} /></a>
          ) : (
            <FaSnapchatGhost size={18} />
          )}
          {data.tiktok ? (
            <a href={makeHref(data.tiktok)} target="_blank" rel="noopener noreferrer"><FaTiktok size={18} /></a>
          ) : (
            <FaTiktok size={18} />
          )}
          {data.instagram ? (
            <a href={makeHref(data.instagram)} target="_blank" rel="noopener noreferrer"><FaInstagram size={18} /></a>
          ) : (
            <FaInstagram size={18} />
          )}
          {data.linkedin ? (
            <a href={makeHref(data.linkedin)} target="_blank" rel="noopener noreferrer"><FaLinkedinIn size={18} /></a>
          ) : (
            <FaLinkedinIn size={18} />
          )}
        </div>
      </div>

      <div className="w-full max-w-[90%] sm:max-w-[400px] space-y-4 mb-16">
        {linksToDisplay.map((link, index) => {
          const href = makeHref(link.url || link.href || '#');
          return (
            <a key={index} href={href} target={href && href !== '#' ? '_blank' : undefined} rel={href && href !== '#' ? 'noopener noreferrer' : undefined} className="block w-full transition-transform active:scale-[0.98]">
              <div className="w-full bg-[#261C13] text-white h-[68px] rounded-[35px] flex items-center px-7 relative shadow-lg">
                <div className="text-white text-xl absolute left-7">{link.icon ? link.icon : <FaInstagram />}</div>
                <span className="flex-1 text-center text-[13px] font-bold tracking-[0.05em]">{link.platform || link.title || link.label}</span>
                <FaEllipsisV size={14} className="text-white/20 absolute right-7" />
              </div>
            </a>
          );
        })}

        <div className="pt-4">
          <button onClick={handleVCardDownload} className="w-full bg-white text-black h-[60px] rounded-[30px] text-[12px] font-extrabold tracking-[0.05em] flex items-center justify-center gap-2 shadow-md border border-black/5 active:bg-gray-100 transition-all">
            Rejoignez {name.split(' ')[0]} sur Rivo Card
          </button>
        </div>
      </div>

      <div className="mt-auto pb-8 opacity-30 text-[9px] font-bold tracking-[0.3em] flex gap-4 text-[#1F1F1F]">
        <span>PRIVACY</span>
        <span>•</span>
        <span>EXPLORE</span>
      </div>
    </div>
  );
};

export default TemplateCleanLinks;