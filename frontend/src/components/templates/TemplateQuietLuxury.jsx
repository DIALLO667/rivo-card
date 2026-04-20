import React from 'react';
import { makeVCard, normalizeUrl } from '@/lib/urlUtils';
import { 
  FaArrowLeft, FaLinkedin, FaInstagram, FaWhatsapp, FaTwitter, 
  FaPhone, FaBuilding, FaSave, FaMapMarkerAlt, FaEnvelope, 
  FaFacebook, FaGlobe, FaTiktok, FaSnapchatGhost, FaTelegramPlane, FaYoutube 
} from 'react-icons/fa';

const TemplateQuietLuxury = ({ profile }) => {
  // Synchronisation avec les clés du formulaire
  const data = profile || {};
  const name = data.name || "Utilisateur";
  const job = data.job || ""; // Formulaire utilise 'job'
  const company = data.company || "";
  const photo = data.photo_url || "https://via.placeholder.com/150";

  // Préparation des liens avec conditions
  const telHref = data.phone ? `tel:${String(data.phone).replace(/\s+/g, '')}` : null;
  const mailHref = data.email ? `mailto:${data.email}` : null;
  const websiteHref = data.website ? normalizeUrl(data.website) : null;
  const whatsappHref = data.phone ? `https://wa.me/${String(data.phone).replace(/[^\d+]/g, '')}` : null;
  
  // Correction Facebook et autres réseaux
  const socialLinks = [
    { Icon: FaLinkedin, href: data.linkedin },
    { Icon: FaInstagram, href: data.instagram },
    { Icon: FaFacebook, href: data.facebook }, // Formulaire utilise 'facebook'
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
           minHeight: '100vh' 
         }}>
      
      <div className="h-6 w-full"></div>

      {/* HEADER */}
      <div className="w-full px-6 flex justify-between items-center z-50 mb-6 mt-4">
        <button onClick={() => window.history.back()} className="text-white/40 p-2"><FaArrowLeft /></button>
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-[10px]">R</div>
            <div className="text-lg font-medium text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* PHOTO */}
      <div className="relative mb-6 z-10">
        <img src={photo} alt={name} className="w-32 h-32 rounded-full object-cover border-[2px] border-[#C4A77D] shadow-2xl" />
      </div>

      {/* INFOS : Correction du JOB */}
      <div className="text-center mb-8 w-full max-w-sm px-6 relative z-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#f3e5ab]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h1>
        {job && (
          <p className="text-[11px] text-[#C4A77D] tracking-[0.2em] uppercase font-semibold mb-1">
            {job}
          </p>
        )}
        {company && (
          <p className="text-[11px] text-white/50 tracking-widest uppercase font-light mb-4">
            {company}
          </p>
        )}
      </div>

      {/* BOUTONS D'ACTION : Masqués si vides */}
      <div className="w-full max-w-[85%] space-y-3 mb-12 relative z-10">
        
        <button onClick={() => {
            const vcard = makeVCard({ name, phone: data.phone || '', email: data.email || '' });
            const blob = new Blob([vcard], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.vcf`;
            a.click();
          }} className="w-full rounded-xl py-4 text-[11px] font-bold tracking-[0.2em] text-black flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #e7cf9a 0%, #C4A77D 100%)' }}>
          <FaSave /> ENREGISTRER CONTACT
        </button>
        
        {data.location && (
          <a href={data.location} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
              <FaMapMarkerAlt className='text-[#C4A77D]' /> ADRESSE
            </button>
          </a>
        )}

        {data.email && (
          <a href={mailHref} className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
              <FaEnvelope className='text-[#C4A77D]' /> EMAIL
            </button>
          </a>
        )}

        {data.phone && (
          <a href={telHref} className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
              <FaPhone className='text-[#C4A77D]' /> APPELER
            </button>
          </a>
        )}

        {websiteHref && (
          <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
              <FaBuilding className='text-[#C4A77D]' /> PORTFOLIO
            </button>
          </a>
        )}
      </div>

      {/* RÉSEAUX SOCIAUX : Correction Facebook et Filtrage */}
      <div className="mt-auto w-full max-w-sm flex flex-wrap justify-center gap-4 px-6 pb-8 relative z-10">
        {socialLinks.map((s, index) => (
          <a key={index} href={s.href} target="_blank" rel="noopener noreferrer" 
             className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
            <s.Icon className="text-lg text-[#C4A77D]" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default TemplateQuietLuxury;