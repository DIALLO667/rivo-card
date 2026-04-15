import React from 'react';
import { 
  FaSnapchatGhost, 
  FaTiktok, 
  FaInstagram, 
  FaLinkedinIn, 
  FaUserPlus, 
  FaEllipsisV, 
  FaArrowLeft 
} from 'react-icons/fa';

const TemplateCleanLinks = ({ profile }) => {
  const data = profile || {};
  const name = data.name || "Salla Seck";
  const photo = data.photo_url || "https://via.placeholder.com/150";
  const bio = data.bio || "ALL MY LINKS 🙃";
  
  const defaultLinks = [
    { platform: "Snapchat", url: "#", icon: <FaSnapchatGhost size={22} /> },
    { platform: "TikTok", url: "#", icon: <FaTiktok size={22} /> },
    { platform: "Instagram", url: "#", icon: <FaInstagram size={22} /> },
    { platform: "LinkedIn", url: "#", icon: <FaLinkedinIn size={22} /> }
  ];

  const linksToDisplay = data.links && data.links.length > 0 ? data.links : defaultLinks;

  return (
    // FOND : Beige chaud identique à la maquette
    <div className="min-h-screen w-full bg-[#B8A78A] text-[#1F1F1F] font-sans flex flex-col items-center p-6 relative overflow-y-auto">
      
      {/* BOUTON RETOUR : Discret en haut à gauche */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-8 left-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-all"
      >
        <FaArrowLeft size={18} className="text-[#1F1F1F]" />
      </button>

      {/* HEADER : Photo plus grande et typographie Bold */}
      <div className="flex flex-col items-center mt-12 mb-10 text-center">
        <div className="w-32 h-32 rounded-full mb-6 shadow-2xl overflow-hidden border-2 border-white/10">
          <img 
            src={photo} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h1>
        
        <p className="text-[12px] tracking-[0.2em] font-bold opacity-80 uppercase">
          {bio}
        </p>

        {/* PETITES ICÔNES SOUS LA BIO (Comme sur jhnsn.oo) */}
        <div className="flex gap-6 mt-6 opacity-80">
            <FaSnapchatGhost size={20} />
            <FaTiktok size={20} />
            <FaInstagram size={20} />
            <FaLinkedinIn size={20} />
        </div>
      </div>

      {/* SECTION BOUTONS : Très larges et hauts */}
      <div className="w-full max-w-[450px] space-y-5 mb-20">
        
        {/* BOUTONS DES LIENS : Style Marron très foncé, Ultra arrondis */}
        {linksToDisplay.map((link, index) => (
          <a 
            key={index} 
            href={link.url || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full transition-transform active:scale-95"
          >
            <div className="w-full bg-[#261C13] text-white h-[75px] rounded-[40px] flex items-center px-8 relative shadow-xl">
              
              {/* Icône à gauche */}
              <div className="text-white text-2xl absolute left-8">
                {link.icon ? link.icon : <FaInstagram />}
              </div>
              
              {/* Texte au centre : Plus gros et bien gras */}
              <span className="flex-1 text-center text-[14px] font-bold tracking-[0.05em]">
                {link.platform}
              </span>
              
              {/* Trois points à droite */}
              <FaEllipsisV size={16} className="text-white/30 absolute right-8" />
            </div>
          </a>
        ))}

        {/* BOUTON ENREGISTRER : Mis en bas, en blanc comme le footer de la maquette */}
        <button className="w-full bg-white text-black h-[65px] rounded-[40px] text-[13px] font-extrabold tracking-[0.1em] flex items-center justify-center gap-3 shadow-lg mt-12 border border-black/5 hover:bg-gray-50 transition-all">
          Rejoignez {name.split(' ')[0]} sur Rivo Card
        </button>
      </div>

      {/* FOOTER BAS DE PAGE */}
      <div className="pb-8 opacity-40 text-[10px] font-bold tracking-[0.2em] flex gap-4">
        <span>Privacy</span>
        <span>•</span>
        <span>Explore</span>
      </div>
    </div>
  );
};

export default TemplateCleanLinks;