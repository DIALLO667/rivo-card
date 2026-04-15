import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';

const CVView = ({ profile, downloadUrl }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const data = profile || { 
    name: 'Amadou Diallo', 
    photo_url: 'https://via.placeholder.com/600x800' 
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setIsDownloading(true);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Erreur réseau');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `CV_${data.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Le téléchargement a échoué:', error);
      alert('Désolé, le téléchargement a échoué. Veuillez réessayer.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-[#0D0D0D] flex flex-col relative overflow-hidden"
         style={{ 
           height: '100vh',
           height: '-webkit-fill-available' // Support mobile dynamique
         }}>
      
      {/* HEADER / LOGO - Plus discret en haut */}
      <div className="w-full pt-8 pb-4 flex justify-center items-center z-50">
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 border border-[#C4A77D] rounded flex items-center justify-center font-bold text-[#C4A77D] text-[8px]">R</div>
            <div className="text-sm font-medium tracking-widest text-white/80 uppercase">Rivo <span className='font-light opacity-50'>Resume</span></div>
        </div>
      </div>

      {/* ZONE CENTRALE : IMAGE + BOUTON FLOTTANT */}
      <div className="flex-1 w-full relative flex flex-col justify-center items-center bg-[#141414] overflow-hidden">
        
        {/* L'IMAGE DU CV */}
        <div className="relative h-full w-full flex items-center justify-center p-2">
           <img 
            src={data.photo_url} 
            alt={`CV de ${data.name}`} 
            className="max-h-full max-w-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm" 
          />

          {/* BOUTON TÉLÉCHARGER : petit, en haut à droite */}
          <button 
            onClick={handleDownload}
            className={`absolute top-6 right-6 px-3 py-2 rounded-full text-[11px] font-semibold tracking-[0.05em] uppercase flex items-center justify-center gap-2 transition-all shadow-md z-50 ${
              isDownloading 
                ? 'bg-gray-700 text-gray-400 animate-pulse' 
                : 'bg-[#C4A77D] text-black active:scale-95 border border-white/10'
            }`}
            aria-label="Télécharger le PDF"
          >
            <FaDownload size={12} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
        
        {/* Dégradés pour l'immersion */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#141414] to-transparent pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none"></div>
      </div>

      {/* FOOTER FIXE - Adapté au mobile */}
      <div className="w-full bg-[#0D0D0D] px-6 py-8 text-center border-t border-white/5 relative z-10">
        <h2 className="text-[#f3e5ab] text-lg font-bold tracking-[0.15em] uppercase mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          {data.name}
        </h2>
        <div className="flex justify-center items-center gap-4 opacity-30">
          <div className="h-[1px] w-8 bg-white"></div>
          <p className="text-white text-[7px] tracking-[0.4em] uppercase">
            Dakar Edition
          </p>
          <div className="h-[1px] w-8 bg-white"></div>
        </div>
      </div>

    </div>
  );
};

export default CVView;