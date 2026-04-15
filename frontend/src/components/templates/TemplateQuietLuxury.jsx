import React from 'react';
import { FaArrowLeft, FaLinkedin, FaInstagram, FaWhatsapp, FaTwitter, FaCalendarAlt, FaPhone, FaBuilding, FaSave, FaMapMarkerAlt } from 'react-icons/fa';

const TemplateQuietLuxury = ({ profile }) => {
  const data = profile || {
    name: "Salla Seck",
    job_title: "COORDINATRICE DES INCUBATEURS",
    company: "ISM",
    location: "Dakar, Senegal",
    photo_url: "https://via.placeholder.com/150",
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`;

  return (
    <div className="min-h-screen w-full text-white font-sans p-6 flex flex-col items-center relative overflow-y-auto" 
         style={{ 
           background: `radial-gradient(circle at 50% 0%, #2c2c2c 0%, #0f0f0f 100%)`,
         }}>
      
      {/* Texture de fond */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/brushed-alum.png')` }}></div>

      {/* BOUTON RETOUR */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-50 text-white/40 hover:text-[#C4A77D] transition"
      >
        <FaArrowLeft className="text-xl" />
      </button>

      {/* LOGO RIVO */}
      <div className="flex items-center gap-2 mt-4 mb-10 relative z-10">
          <div className="w-7 h-7 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-xs shadow-[0_0_10px_rgba(196,167,125,0.3)]">R</div>
          <div className="text-xl font-medium tracking-tight text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
      </div>

      {/* PHOTO */}
      <div className="relative mb-8 z-10">
        <div className="absolute inset-0 rounded-full blur-md bg-[#C4A77D]/20 animate-pulse"></div>
        <img 
          src={data.photo_url} 
          alt={data.name} 
          className="w-36 h-36 rounded-full object-cover border-[3px] border-[#C4A77D] relative z-10 shadow-2xl"
        />
      </div>

      {/* TEXTE */}
      <div className="text-center mb-10 w-full max-w-sm px-4 relative z-10">
        <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#f3e5ab' }}>
          {data.name}
        </h1>
        <p className="text-[12px] text-[#C4A77D] tracking-[0.2em] uppercase font-semibold mb-1">
          {data.job_title}
        </p>
        <p className="text-[12px] text-white/50 tracking-widest uppercase font-light mb-4">
          {data.company}
        </p>
        <div className="h-[1px] w-12 bg-[#C4A77D]/40 mx-auto"></div>
      </div>

      {/* BOUTONS D'ACTION : TOUS ALIGNÉS */}
      <div className="w-full max-w-xs space-y-4 mb-16 relative z-10">
        
        {/* Bouton Enregistrer */}
        <button className="w-full rounded-xl py-4 text-[11px] font-bold tracking-[0.2em] text-black flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(196,167,125,0.3)]"
                style={{ background: 'linear-gradient(135deg, #e7cf9a 0%, #C4A77D 100%)' }}>
          <FaSave className='text-sm' /> ENREGISTRER
        </button>
        
        {/* Bouton Adresse (Google Maps) - Nouveau format bouton */}
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 hover:border-[#C4A77D]/50 transition-all shadow-xl backdrop-blur-sm">
                <FaMapMarkerAlt className='text-[#C4A77D]' /> ADRESSE
            </button>
        </a>

        {/* Autres Boutons */}
        {[
          { icon: FaCalendarAlt, text: "PRENDRE RENDEZ-VOUS" },
          { icon: FaPhone, text: "APPELER LE BUREAU" },
          { icon: FaBuilding, text: "VOIR LE PORTFOLIO" }
        ].map((btn, i) => (
          <button key={i} className="w-full bg-white/5 border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 hover:border-[#C4A77D]/50 transition-all shadow-xl backdrop-blur-sm">
            <btn.icon className='text-[#C4A77D]' /> {btn.text}
          </button>
        ))}
      </div>

      {/* RESEAUX SOCIAUX */}
      <div className="w-full max-w-sm flex justify-center gap-5 mt-auto pb-10 relative z-10">
        {[FaLinkedin, FaInstagram, FaWhatsapp, FaTwitter].map((Icon, index) => (
            <div key={index} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#C4A77D] group cursor-pointer transition-all duration-300 bg-white/5 shadow-inner">
                <Icon className="text-xl text-[#C4A77D] group-hover:text-black transition-colors" />
            </div>
        ))}
      </div>

      <div className="text-[8px] text-white/20 tracking-[0.4em] uppercase pb-4">
        RIVO CARD • LUXE ÉDITION
      </div>
    </div>
  );
};

export default TemplateQuietLuxury;