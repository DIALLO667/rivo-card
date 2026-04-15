import React, { useState } from 'react';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';

const CVView = ({ profile, downloadUrl }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const data = profile || { 
    name: 'Amadou Diallo', 
    photo_url: 'https://via.placeholder.com/600x800' 
  };

  // FONCTION DE TÉLÉCHARGEMENT FORCÉ (Conserve la qualité)
  const handleDownload = async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    setIsDownloading(true);

    try {
      // 1. On récupère le fichier de l'URL
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Erreur réseau');

      // 2. On le transforme en Blob (Binaire)
      const blob = await response.blob();

      // 3. On crée une URL locale temporaire
      const blobUrl = window.URL.createObjectURL(blob);

      // 4. On crée un lien invisible et on simule un clic
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `CV_${data.name.replace(/\s+/g, '_')}.pdf`; // Nom du fichier
      document.body.appendChild(link);
      link.click();

      // 5. Nettoyage
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
    <div className="h-screen w-full bg-[#0D0D0D] flex flex-col relative overflow-hidden">
      
      {/* BARRE D'ACTION SUPÉRIEURE : Bouton Retour et Bouton Télécharger */}
      <div className="absolute top-8 inset-x-8 z-50 flex justify-between items-center">
        
        {/* BOUTON RETOUR : Plus discret */}
        <button 
          onClick={() => window.history.back()} 
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-[#C4A77D] hover:border-[#C4A77D]/20 transition-all"
        >
          <FaArrowLeft size={18} />
        </button>

        {/* LE BOUTON DE TÉLÉCHARGEMENT (POSITIONNÉ EN HAUT) */}
        <a 
          href={downloadUrl} 
          onClick={handleDownload} // Appel de la fonction JavaScript
          className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.4)] ${
            isDownloading 
              ? 'bg-gray-600 text-gray-300 animate-pulse cursor-not_allowed' 
              : 'bg-[#C4A77D] text-black hover:scale-[1.03] active:scale-95'
          }`}
        >
          <FaDownload size={12} />
          {isDownloading ? 'TÉLÉCHARGEMENT...' : 'TÉLÉCHARGER (PDF)'}
        </a>
      </div>

      {/* AFFICHAGE DU CV : Remplit tout l'écran */}
      <div className="flex-1 w-full relative flex justify-center items-center bg-[#1A1A1A]">
        <img 
          src={data.photo_url} 
          alt={`CV de ${data.name}`} 
          className="h-full w-full object-contain shadow-2xl" 
        />
        
        {/* Dégradé subtil en bas pour l'esthétique */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      </div>

      {/* FOOTER FIXE : Infos personnelles épurées */}
      <div className="w-full bg-[#0D0D0D] p-6 text-center border-t border-white/5 relative z-10">
        <h2 className="text-white text-base font-light tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          {data.name}
        </h2>
        <p className="text-[#C4A77D] text-[9px] tracking-[0.3em] uppercase opacity-80">
          Rivo Card • Dakar Edition
        </p>
      </div>

    </div>
  );
};

export default CVView;