import React from 'react';
import { makeVCard, normalizeUrl } from '@/lib/urlUtils';
import { 
  FaArrowLeft, FaLinkedin, FaInstagram, FaWhatsapp, FaTwitter, 
  FaPhone, FaSave, FaMapMarkerAlt, FaEnvelope, 
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
  const websiteHref = data.website && data.website !== "https://" ? normalizeUrl(data.website) : null;
  const whatsappHref = data.phone ? `https://wa.me/${String(data.phone).replace(/[^\d+]/g, '')}` : null;
  
  const hasPortfolio = !!websiteHref;

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
    <div className="w-full flex flex-col items-center relative overflow-x-hidden" 
         style={{ 
           background: '#000000',
           backgroundImage: `radial-gradient(circle at 50% 10%, #2c2c2c 0%, #000000 100%)`,
           minHeight: '100vh',
         }}>
      
      {/* Texture de fond discrète */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }}></div>

      {/* HEADER : Marges responsives */}
      <div className="w-full px-6 flex justify-between items-center z-50 pt-8 pb-4 md:pt-10">
        <button onClick={() => window.history.back()} className="text-white/40 hover:text-[#C4A77D] transition p-2">
          <FaArrowLeft className="text-lg" />
        </button>
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-[10px]">R</div>
            <div className="text-lg font-medium tracking-tight text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* PHOTO : Taille adaptative et centrage */}
      <div className={`relative z-10 flex flex-col items-center transition-all ${hasPortfolio ? 'mt-4 mb-6' : 'mt-8 mb-10'}`}>
        <div className="absolute inset-0 rounded-full blur-2xl bg-[#C4A77D]/15"></div>
        <img 
          src={photo} 
          alt={name} 
          fetchpriority="high"
          className={`${hasPortfolio ? 'w-32 h-32' : 'w-36 h-36'} rounded-full object-cover border-[2px] border-[#C4A77D] relative z-10 shadow-2xl transition-all duration-500`}
        />
      </div>

      {/* TEXTE : Optimisé pour la lecture */}
      <div className={`text-center w-full max-w-sm px-8 relative z-10 ${hasPortfolio ? 'mb-8' : 'mb-12'}`}>
        <h1 className={`${hasPortfolio ? 'text-3xl' : 'text-4xl'} font-bold mb-2 tracking-tight text-[#f3e5ab] break-words`} style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h1>
        {job && (
          <p className="text-[11px] text-[#C4A77D] tracking-[0.2em] uppercase font-bold mb-1 opacity-90">
            {job}
          </p>
        )}
        {company && (
          <p className="text-[10px] text-white/40 tracking-widest uppercase font-light">
            {company}
          </p>
        )}
      </div>

      {/* BOUTONS D'ACTION : Largeur max responsive (85% mobile, max 400px desktop) */}
      <div className="w-full max-w-[85%] sm:max-w-sm space-y-3.5 relative z-10">
        <button onClick={() => {
            const vcard = makeVCard({ name, phone: data.phone || '', email: data.email || '' });
            const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/\s+/g,'_')}.vcf`;
            document.body.appendChild(a); a.click(); a.remove();
          }} className={`w-full rounded-xl ${hasPortfolio ? 'py-4' : 'py-5'} text-[11px] font-black tracking-[0.15em] text-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-black/40`}
                style={{ background: 'linear-gradient(135deg, #e7cf9a 0%, #C4A77D 100%)' }}>
          <FaSave className='text-base' /> ENREGISTRER CONTACT
        </button>
        
        {data.location && (
          <a href={data.location} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className={`w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl ${hasPortfolio ? 'py-4' : 'py-5'} text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase`}>
              <FaMapMarkerAlt className='text-[#C4A77D] text-base' /> Adresse
            </button>
          </a>
        )}

        {data.email && (
          <a href={mailHref} className="block w-full">
            <button className={`w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl ${hasPortfolio ? 'py-4' : 'py-5'} text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase`}>
              <FaEnvelope className='text-[#C4A77D] text-base' /> Envoyer un email
            </button>
          </a>
        )}

        {data.phone && (
          <a href={telHref} className="block w-full">
            <button className={`w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl ${hasPortfolio ? 'py-4' : 'py-5'} text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase`}>
              <FaPhone className='text-[#C4A77D] text-base' /> Appeler maintenant
            </button>
          </a>
        )}

        {websiteHref && (
          <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase font-bold">
              <FaGlobe className='text-[#C4A77D] text-base' /> Portfolio / Site Web
            </button>
          </a>
        )}
      </div>

      {/* RÉSEAUX SOCIAUX : Suppression de mt-auto et ajout d'une marge fixe */}
      <div className={`w-full max-w-sm flex flex-wrap justify-center gap-6 px-6 relative z-10 transition-all ${hasPortfolio ? 'mt-10 mb-10' : 'mt-16 mb-16'}`}>
        {socialLinks.map((s, index) => (
          <a key={index} href={s.href} target="_blank" rel="noopener noreferrer" 
             className={`${hasPortfolio ? 'w-11 h-11' : 'w-[52px] h-[52px]'} rounded-full border border-white/10 flex items-center justify-center active:bg-[#C4A77D] group transition-all bg-white/[0.05] hover:border-[#C4A77D]/30`}>
            <s.Icon className={`${hasPortfolio ? 'text-lg' : 'text-2xl'} text-[#C4A77D] group-active:text-black transition-colors`} />
          </a>
        ))}
      </div>

      {/* Footer permanent */}
      <div className="w-full text-center pb-8 mt-auto relative z-10">
        <div className="text-[7px] text-white/20 tracking-[0.4em] uppercase">
          RIVO CARD • LUXE ÉDITION
        </div>
      </div>
    </div>
  );
};

export default TemplateQuietLuxury;