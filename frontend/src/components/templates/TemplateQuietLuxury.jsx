import React from 'react';
import { makeVCard, normalizeUrl } from '@/lib/urlUtils';
import { 
  FaArrowLeft, FaLinkedin, FaInstagram, FaWhatsapp, FaTwitter, 
  FaPhone, FaBuilding, FaSave, FaMapMarkerAlt, FaEnvelope, 
  FaFacebook, FaGlobe, FaTiktok, FaSnapchatGhost, FaTelegramPlane, FaYoutube 
} from 'react-icons/fa';

const TemplateQuietLuxury = ({ profile }) => {
  const data = profile || {};
  const name = data.name || "Utilisateur";
  const job = data.job || ""; 
  const company = data.company || "";
  const photo = data.photo_url || "https://via.placeholder.com/150";

  const telHref = data.phone ? `tel:${String(data.phone).replace(/\s+/g, '')}` : null;
  const mailHref = data.email ? `mailto:${data.email}` : null;
  const websiteHref = data.website ? normalizeUrl(data.website) : null;
  const whatsappHref = data.phone ? `https://wa.me/${String(data.phone).replace(/[^\d+]/g, '')}` : null;
  
  const socialLinks = [
    { Icon: FaLinkedin, href: data.linkedin },
    { Icon: FaInstagram, href: data.instagram },
    { Icon: FaFacebook, href: data.facebook }, 
    { Icon: FaTiktok, href: data.tiktok },
    { Icon: FaSnapchatGhost, href: data.snapchat },
    { Icon: FaTelegramPlane, href: data.telegram },
    { Icon: FaYoutube, href: data.youtube },
    { Icon: FaTwitter, href: data.twitter },
    { Icon: FaWhatsapp, href: whatsappHref },
    { Icon: FaGlobe, href: websiteHref }
  ].filter(s => s.href && s.href !== "" && s.href !== "https://");

  return (
    <div className="w-full flex flex-col items-center relative" 
         style={{ 
           background: '#000000',
           backgroundImage: `radial-gradient(circle at 50% 10%, #2c2c2c 0%, #000000 100%)`,
           minHeight: '100vh',
           minHeight: '-webkit-fill-available', 
         }}>
      
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/brushed-alum.png')` }}></div>

      <div className="h-6 w-full"></div>

      {/* HEADER */}
      <div className="w-full px-6 flex justify-between items-center z-50 mb-8 mt-4">
        <button onClick={() => window.history.back()} className="text-white/40 hover:text-[#C4A77D] transition p-2"><FaArrowLeft className="text-xl" /></button>
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-[12px] shadow-[0_0_10px_rgba(196,167,125,0.3)]">R</div>
            <div className="text-xl font-medium tracking-tight text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* PHOTO AGRANDIE (w-40) */}
      <div className="relative mb-10 z-10">
        <div className="absolute inset-0 rounded-full blur-xl bg-[#C4A77D]/20 animate-pulse"></div>
        <img 
          src={photo} 
          alt={name} 
          fetchpriority="high"
          className="w-40 h-40 rounded-full object-cover border-[3px] border-[#C4A77D] relative z-10 shadow-2xl"
        />
      </div>

      {/* TEXTE AGRANDI */}
      <div className="text-center mb-10 w-full max-w-sm px-6 relative z-10">
        <h1 className="text-4xl font-bold mb-3 tracking-tight text-[#f3e5ab]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h1>
        {job && (
          <p className="text-[13px] text-[#C4A77D] tracking-[0.25em] uppercase font-bold mb-2">
            {job}
          </p>
        )}
        {company && (
          <p className="text-[12px] text-white/40 tracking-widest uppercase font-light mb-6">
            {company}
          </p>
        )}
        <div className="h-[1px] w-16 bg-[#C4A77D]/40 mx-auto"></div>
      </div>

      {/* BOUTONS D'ACTION PLUS ÉPAIS (py-5) */}
      <div className="w-full max-w-[88%] space-y-4 mb-14 relative z-10">
        <button onClick={() => {
            const vcard = makeVCard({ name, phone: data.phone || '', email: data.email || '' });
            const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/\s+/g,'_')}.vcf`;
            document.body.appendChild(a); a.click(); a.remove();
          }} className="w-full rounded-2xl py-5 text-[12px] font-black tracking-[0.2em] text-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_rgba(196,167,125,0.2)]"
                style={{ background: 'linear-gradient(135deg, #e7cf9a 0%, #C4A77D 100%)' }}>
          <FaSave className='text-lg' /> ENREGISTRER CONTACT
        </button>
        
        {data.location && (
          <a href={data.location} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-2xl py-5 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
              <FaMapMarkerAlt className='text-[#C4A77D] text-lg' /> ADRESSE
            </button>
          </a>
        )}

        {data.email && (
          <a href={mailHref} className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-2xl py-5 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
              <FaEnvelope className='text-[#C4A77D] text-lg' /> ENVOYER UN EMAIL
            </button>
          </a>
        )}

        {data.phone && (
          <a href={telHref} className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-2xl py-5 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
              <FaPhone className='text-[#C4A77D] text-lg' /> APPELER MAINTENANT
            </button>
          </a>
        )}

        {websiteHref && (
          <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-2xl py-5 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
              <FaGlobe className='text-[#C4A77D] text-lg' /> PORTFOLIO / SITE WEB
            </button>
          </a>
        )}
      </div>

      {/* RÉSEAUX SOCIAUX PLUS GRANDS (w-14) */}
      <div className="mt-auto w-full max-w-sm flex flex-wrap justify-center gap-6 px-6 pb-12 relative z-10">
        {socialLinks.map((s, index) => (
          <a 
            key={index} 
            href={s.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center active:bg-[#C4A77D] group transition-all bg-white/5 shadow-lg"
          >
            <s.Icon className="text-2xl text-[#C4A77D] group-active:text-black transition-colors" />
          </a>
        ))}
      </div>

      <div className="text-[8px] text-white/20 tracking-[0.5em] uppercase pb-8">
        RIVO CARD • LUXE ÉDITION
      </div>
    </div>
  );
};

export default TemplateQuietLuxury;