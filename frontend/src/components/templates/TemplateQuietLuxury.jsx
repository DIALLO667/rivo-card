import React from 'react';
import { makeVCard, normalizeUrl } from '@/lib/urlUtils';
import { 
  FaArrowLeft, 
  FaLinkedin, 
  FaInstagram, 
  FaWhatsapp, 
  FaTwitter, 
  FaCalendarAlt, 
  FaPhone, 
  FaBuilding, 
  FaSave, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaFacebook, 
  FaGlobe 
} from 'react-icons/fa';
const TemplateQuietLuxury = ({ profile }) => {
  const data = profile || {
    name: "Salla Seck",
    job_title: "COORDINATRICE DES INCUBATEURS",
    company: "ISM",
    location: "Dakar, Senegal",
    photo_url: "https://via.placeholder.com/150",
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`;
  // Build safe hrefs
  const telHref = data.phone ? (String(data.phone).startsWith('tel:') ? data.phone : `tel:${String(data.phone).replace(/\s+/g, '')}`) : null;
  const mailHref = data.email ? (String(data.email).startsWith('mailto:') ? data.email : `mailto:${data.email}`) : null;
  const appointmentHref = data.email ? `mailto:${data.email}?subject=${encodeURIComponent('envoyez un mail')}` : null;
  const websiteHref = data.website ? normalizeUrl(data.website) : null;
  const whatsappHref = data.phone ? `https://wa.me/${String(data.phone).replace(/[^\d+]/g, '')}` : null;

  return (
    <div className="w-full flex flex-col items-center relative" 
         style={{ 
           background: '#000000', // Noir pur obligatoire pour le haut
           backgroundImage: `radial-gradient(circle at 50% 10%, #2c2c2c 0%, #000000 100%)`, // Dégradé ajusté
           minHeight: '100vh',
           minHeight: '-webkit-fill-available', 
         }}>
      
      {/* Texture de fond */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/brushed-alum.png')` }}></div>

      {/* BARRE DE STATUT : Uniquement pour l'espacement sur iPhone/Android */}
      <div className="h-6 w-full"></div>

      {/* BOUTON RETOUR ET LOGO : Plus de marge en haut */}
      <div className="w-full px-6 flex justify-between items-center z-50 mb-6 mt-4">
        <button 
          onClick={() => window.history.back()}
          className="text-white/40 hover:text-[#C4A77D] transition p-2 -ml-2"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        
        <div className="flex items-center gap-2 relative z-10">
            <div className="w-6 h-6 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-[10px] shadow-[0_0_10px_rgba(196,167,125,0.3)]">R</div>
            <div className="text-lg font-medium tracking-tight text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
        </div>
        
        <div className="w-8"></div>
      </div>

      {/* PHOTO */}
      <div className="relative mb-6 z-10">
        <div className="absolute inset-0 rounded-full blur-md bg-[#C4A77D]/20"></div>
        <img 
          src={data.photo_url} 
          alt={data.name} 
          className="w-32 h-32 rounded-full object-cover border-[2px] border-[#C4A77D] relative z-10 shadow-2xl"
        />
      </div>

      {/* TEXTE */}
      <div className="text-center mb-8 w-full max-w-sm px-6 relative z-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#f3e5ab' }}>
          {data.name}
        </h1>
        <p className="text-[11px] text-[#C4A77D] tracking-[0.2em] uppercase font-semibold mb-1">
          {data.job_title}
        </p>
        <p className="text-[11px] text-white/50 tracking-widest uppercase font-light mb-4">
          {data.company}
        </p>
        <div className="h-[1px] w-10 bg-[#C4A77D]/40 mx-auto"></div>
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="w-full max-w-[85%] space-y-3 mb-12 relative z-10">
        
        <button onClick={() => {
            const vcard = makeVCard({ name: data.name, phone: data.phone || '', email: data.email || '' });
            const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(data.name || 'contact').replace(/\s+/g,'_')}.vcf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }} className="w-full rounded-xl py-4 text-[11px] font-bold tracking-[0.2em] text-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_20px_rgba(196,167,125,0.2)]"
                style={{ background: 'linear-gradient(135deg, #e7cf9a 0%, #C4A77D 100%)' }}>
          <FaSave className='text-sm' /> ENREGISTRER
        </button>
        
    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
      <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
        <FaMapMarkerAlt className='text-[#C4A77D]' /> ADRESSE
      </button>
    </a>

        {[
          { icon: FaEnvelope, text: "email", href: appointmentHref },
          { icon: FaPhone, text: "APPELER", href: telHref },
          { icon: FaBuilding, text: "PORTFOLIO", href: websiteHref }
        ].map((btn, i) => (
          btn.href ? (
            <a key={i} href={btn.href} target={btn.href.startsWith('http') ? '_blank' : undefined} rel={btn.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="block w-full">
              <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
                <btn.icon className='text-[#C4A77D]' /> {btn.text}
              </button>
            </a>
          ) : (
            <button key={i} className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm">
              <btn.icon className='text-[#C4A77D]' /> {btn.text}
            </button>
          )
        ))}
      </div>

    {/* RESEAUX SOCIAUX DYNAMIQUES */}
<div className="mt-auto w-full max-w-sm flex flex-wrap justify-center gap-4 px-6 pb-8 relative z-10">
  {[
    { Icon: FaLinkedin, href: data.linkedin_url || data.linkedin },
    { Icon: FaInstagram, href: data.instagram_url || data.instagram },
    { Icon: FaWhatsapp, href: whatsappHref },
    { Icon: FaTwitter, href: data.twitter_url || data.twitter },
    { Icon: FaFacebook, href: data.facebook_url }, // Ajoute FaFacebook aux imports en haut
    { Icon: FaGlobe, href: data.website_url || data.website }
  ]
  .filter(social => social.href) // On ne garde que ceux qui ont un lien
  .map((s, index) => (
    <a 
      key={index} 
      href={s.href.startsWith('http') || s.href.startsWith('https') ? s.href : `https://${s.href}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center active:bg-[#C4A77D] group cursor-pointer transition-all bg-white/5"
    >
      <s.Icon className="text-lg text-[#C4A77D] group-active:text-black transition-colors" />
    </a>
  ))}
</div>

      <div className="text-[7px] text-white/20 tracking-[0.4em] uppercase pb-6">
        RIVO CARD • LUXE ÉDITION
      </div>
    </div>
  );
};

export default TemplateQuietLuxury;