// ...existing code...
import React from 'react';
import { normalizeUrl, makeVCard } from '@/lib/urlUtils';
import {
  FaSnapchatGhost,
  FaTiktok,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaGlobe,
  FaEllipsisV
} from 'react-icons/fa';

export default function TemplateCleanLinks({ profile }) {
  const data = profile || {};
  const name = data.name || 'Utilisateur';
  const job = data.job || ''; // optional
  const photo = data.photo_url || 'https://via.placeholder.com/150';
  const bio = data.bio || 'ALL MY LINKS 👋';

  // canonical candidates mapped to form field names
  const candidates = [
    { key: 'instagram', label: 'Instagram', value: data.instagram, Icon: FaInstagram },
    { key: 'linkedin', label: 'LinkedIn', value: data.linkedin, Icon: FaLinkedinIn },
    { key: 'tiktok', label: 'TikTok', value: data.tiktok, Icon: FaTiktok },
    { key: 'snapchat', label: 'Snapchat', value: data.snapchat, Icon: FaSnapchatGhost },
    { key: 'phone', label: 'Téléphone', value: data.phone, Icon: FaPhone },
    { key: 'email', label: 'Email', value: data.email, Icon: FaEnvelope },
    { key: 'website', label: 'Site', value: data.website, Icon: FaGlobe }
  ];

  // If backend provides data.links array, prefer it (but normalized to our keys if possible)
  const rawLinks =
    Array.isArray(data.links) && data.links.length > 0
      ? data.links.map(l => ({
          key: (l.key || l.platform || '').toLowerCase(),
          label: l.label || l.platform || l.key || 'Link',
          value: l.url || l.href || l.value
        }))
      : candidates.map(c => ({ key: c.key, label: c.label, value: c.value }));

  const makeHref = (raw, key) => {
    if (!raw && raw !== 0) return null;
    let v = String(raw).trim();
    if (!v || v === '#') return null;
    if (key === 'phone') return v.startsWith('tel:') ? v : `tel:${v.replace(/\s+/g, '')}`;
    if (key === 'email') return v.startsWith('mailto:') ? v : `mailto:${v}`;
    if (v.startsWith('tel:') || v.startsWith('mailto:')) return v;
    return normalizeUrl(v);
  };

  const normalized = rawLinks
    .map(item => {
      const key = (item.key || '').toLowerCase();
      const href = makeHref(item.value, key);
      if (!href) return null;
      const candidate = candidates.find(c => c.key === key);
      const Icon = candidate ? candidate.Icon : FaGlobe;
      return { key, label: item.label || candidate?.label || key, href, Icon };
    })
    .filter(Boolean)
    .slice(0, 4); // show up to 4 links chosen via form

  const downloadVCard = () => {
    const vcard = makeVCard({
      name,
      phone: data.phone || '',
      email: data.email || ''
    });
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-full flex flex-col items-center relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(180deg, #E8F2FB 0%, #FFFFFF 100%)',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* header */}
      <div className="flex flex-col items-center pt-16 mb-8 text-center w-full px-6">
        <div className="w-28 h-28 rounded-full mb-6 relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-blue-400/40 animate-pulse"></div>
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white relative z-10 shadow-lg">
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-[#2D3A54]">{name}</h1>
        {job && <p className="text-[10px] tracking-[0.1em] font-bold opacity-60 uppercase text-[#2D3A54] mb-2">{job}</p>}
        <p className="text-[10px] tracking-[0.1em] font-bold opacity-60 uppercase text-[#2D3A54] mb-4">{bio}</p>

        {/* visual icons placeholder */}
        <div className="flex gap-4 opacity-80 text-[#2D3A54]">
          <FaSnapchatGhost size={16} />
          <FaTiktok size={16} />
          <FaInstagram size={16} />
          <FaLinkedinIn size={16} />
        </div>
      </div>

      {/* links */}
      <div className="w-full max-w-[90%] sm:max-w-[400px] space-y-4 mb-16 px-2">
        {normalized.map((link, index) => {
          const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://');
          return (
            <a
              key={index}
              href={link.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="block w-full transition-transform active:scale-[0.97]"
            >
              <div className="w-full bg-[#5279A8] text-white h-[64px] rounded-[32px] flex items-center px-7 relative shadow-md border border-white/20">
                <div className="text-white absolute left-7">
                  <link.Icon size={20} />
                </div>
                <span className="flex-1 text-center text-[13px] font-semibold tracking-wide">
                  {link.label}
                </span>
                <FaEllipsisV size={12} className="text-white/30 absolute right-7" />
              </div>
            </a>
          );
        })}

        <div className="pt-6">
          <a href="https://rivo-card.netlify.app/" target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white text-[#2D3A54] h-[55px] rounded-[28px] text-[11px] font-bold tracking-tight flex items-center justify-center shadow-lg border border-blue-50 active:bg-blue-50 transition-all">
              Rejoignez {name.split(' ')[0]} sur Rivo Card
            </button>
          </a>
        </div>
      </div>

      {/* footer */}
      <div className="mt-auto pb-8 opacity-20 text-[8px] font-bold tracking-[0.4em] flex gap-4 text-[#2D3A54]">
        <span>RIVO STUDIO</span>
        <span>•</span>
        <span>CLEAN EDITION</span>
      </div>

      {/* floating save contact */}
      <button
        onClick={downloadVCard}
        title="Enregistrer contact"
        style={{ position: 'fixed', right: 18, bottom: 18 }}
        className="bg-[#C4A77D] text-white p-3 rounded-full shadow-lg"
      >
        <FaSave />
      </button>
    </div>
  );
}
// ...existing code...