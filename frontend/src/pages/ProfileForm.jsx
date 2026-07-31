import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeUrl } from '@/lib/urlUtils';
import { toast } from 'sonner';

const BASE_URL = process.env.REACT_APP_API_URL || '';
const API = (BASE_URL.replace(/\/api$/, '') || 'http://127.0.0.1:5100') + '/api';

export default function ProfileForm() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', job: '', company: '', phone: '', email: '', location: '', address: '', lat:'', lng:'',
    website: '', instagram: '', facebook: '', linkedin: '', tiktok: '',
    snapchat: '', telegram: '', youtube: '', twitter: '', design_type: 'classic'
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [cardType, setCardType] = useState('profile');
  const [templateId, setTemplateId] = useState('template1');
  const [bgColor, setBgColor] = useState('');
  const [buttonColor, setButtonColor] = useState('');
  const [iconColor, setIconColor] = useState('');
  const [nameColor, setNameColor] = useState('');
  const [jobColor, setJobColor] = useState('');
  const [fontChoice, setFontChoice] = useState('sans');
  const [iconStyle, setIconStyle] = useState('default');

  useEffect(() => {
    if (profileId) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API}/profiles/${profileId}`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            withCredentials: true 
          });
          setFormData({
            name: res.data.name || '',
            job: res.data.job || '',
            company: res.data.company || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            location: res.data.location || '',
            website: res.data.website || '',
            instagram: res.data.instagram || '',
            facebook: res.data.facebook || '',
            linkedin: res.data.linkedin || '',
            tiktok: res.data.tiktok || '',
            snapchat: res.data.snapchat || '',
            telegram: res.data.telegram || '',
            youtube: res.data.youtube || '',
            twitter: res.data.twitter || '',
            design_type: res.data.design_type || 'classic'
          });
          if (res.data.card_type) setCardType(res.data.card_type);
          if (res.data.template_id) setTemplateId(res.data.template_id);
          // populate customizable prefs if present
          if (res.data.bg_color) setBgColor(res.data.bg_color);
          if (res.data.button_color) setButtonColor(res.data.button_color);
          if (res.data.icon_color) setIconColor(res.data.icon_color);
          if (res.data.name_color) setNameColor(res.data.name_color);
          if (res.data.job_color) setJobColor(res.data.job_color);
          if (res.data.font_choice) setFontChoice(res.data.font_choice);
          if (res.data.icon_style) setIconStyle(res.data.icon_style);
        } catch (err) {
          toast.error("Impossible de charger les données");
        }
      };
      fetchProfile();
    }
  }, [profileId]);

  // cropper state (client-side) - will use CDN Cropper if present
  const [cropper, setCropper] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // photo file change -> init cropper if cropper lib available
  const onPhotoChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setPhotoFile(f);
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = document.getElementById('adminCropImage');
    if (img) img.src = url;
    if (window.Cropper && img) {
      try { if (cropper) cropper.destroy(); } catch (e) {}
      const c = new window.Cropper(img, { aspectRatio: 1, viewMode: 1 });
      setCropper(c);
    }
  };

  const applyCrop = async () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
    const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.92));
    setCroppedBlob(blob);
    // preview assign
    const preview = document.getElementById('photoPreview');
    if (preview) preview.src = URL.createObjectURL(blob);
    try { cropper.destroy(); } catch (e) {}
    setCropper(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name?.trim()) {
      toast.error('Le nom est requis');
      setLoading(false);
      return;
    }

    // LOGIQUE CORRIGÉE : Photo obligatoire seulement à la création
    if (!profileId && !photoFile) {
      toast.error('Veuillez sélectionner une photo');
      setLoading(false);
      return;
    }

    if (cardType === 'profile' && !formData.phone?.trim()) {
      toast.error('Le téléphone est requis');
      setLoading(false);
      return;
    }

    const data = new FormData();
    const normalizedForm = { ...formData };
    ['instagram','linkedin','facebook','tiktok','telegram','youtube','twitter','snapchat','website'].forEach(k => {
      if (normalizedForm[k]) normalizedForm[k] = normalizeUrl(normalizedForm[k]);
    });

    Object.keys(normalizedForm).forEach(key => {
      const v = normalizedForm[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        data.append(key, v);
      }
    });

    // append customizable style prefs when using the customizable template
    if (templateId === 'template_customizable') {
      if (bgColor) data.append('bg_color', bgColor);
      if (buttonColor) data.append('button_color', buttonColor);
      if (iconColor) data.append('icon_color', iconColor);
      if (nameColor) data.append('name_color', nameColor);
      if (jobColor) data.append('job_color', jobColor);
      if (fontChoice) data.append('font_choice', fontChoice);
      if (iconStyle) data.append('icon_style', iconStyle);
    }

    data.append('card_type', cardType);
    data.append('template_id', templateId);
    
    // N'ajoute les fichiers QUE s'ils sont sélectionnés
    if (photoFile) data.append('photo', photoFile);
    if (cardType === 'profile' && coverFile) data.append('cover', coverFile);

    try {
      const config = {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        withCredentials: true
      };

      if (profileId) {
        await axios.put(`${API}/profiles/${profileId}`, data, config);
        toast.success("Profil mis à jour !");
      } else {
        await axios.post(`${API}/profiles`, data, config);
        toast.success("Profil créé !");
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error("Erreur d'enregistrement");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f1113] text-white p-4 md:p-8 flex justify-center items-center">
      <Helmet><title>Profil digital | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="w-full max-w-2xl bg-[#1a1c1e] p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-bold mb-8 text-[#D4AF37]">
          {profileId ? "MODIFIER LE PROFIL" : "NOUVEAU PROFIL Rivo-Card"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Type de carte</label>
              <select value={cardType} onChange={e => setCardType(e.target.value)} className="w-full bg-white/5 border border-white/10 h-12 px-4 rounded-md text-sm outline-none">
                <option value="profile">Profile (template + cover)</option>
                <option value="cv">CV (juste une photo)</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Template</label>
              <div className="flex gap-3 mt-2">
                <div onClick={() => setTemplateId('template1')} className={`w-20 h-28 rounded-lg p-2 flex items-end justify-center cursor-pointer ${templateId==='template1' ? 'ring-2 ring-[#C4A77D]' : 'ring-0'}`}>
                  <div className="w-full h-full bg-[#050505] rounded-md flex items-center justify-center text-xs text-white">Quiet</div>
                </div>
                <div onClick={() => setTemplateId('template2')} className={`w-20 h-28 rounded-lg p-2 flex items-end justify-center cursor-pointer ${templateId==='template2' ? 'ring-2 ring-[#C4A77D]' : 'ring-0'}`}>
                  <div className="w-full h-full bg-[#C5A87F] rounded-md flex items-center justify-center text-xs text-black">Links</div>
                </div>
                <div onClick={() => setTemplateId('template_customizable')} className={`w-20 h-28 rounded-lg p-2 flex items-end justify-center cursor-pointer ${templateId==='template_customizable' ? 'ring-2 ring-[#C4A77D]' : 'ring-0'}`}>
                  <div className="w-full h-full bg-gradient-to-br from-[#0a0a0b] to-[#7c3aed] rounded-md flex items-center justify-center text-xs text-white">Custom</div>
                </div>
              </div>
            </div>
            {/* Customizable template controls */}
            {templateId === 'template_customizable' && (
              <div className="mt-4 p-4 bg-white/5 rounded-md">
                <p className="text-xs text-white/80 font-bold mb-2">Personnalisation</p>
                <div className="grid grid-cols-1 gap-3">
                  {/** Color control helper */}
                  {[
                    ["Fond", bgColor, setBgColor, 'bg_color'],
                    ["Bouton", buttonColor, setButtonColor, 'button_color'],
                    ["Icônes", iconColor, setIconColor, 'icon_color'],
                    ["Nom", nameColor, setNameColor, 'name_color'],
                    ["Profession", jobColor, setJobColor, 'job_color']
                  ].map(([label, value, setter, keyName]) => (
                    <div key={keyName} className="flex items-center gap-2">
                      <label className="text-[11px] w-20">{label}</label>
                      <input type="color" value={value} onChange={e => setter(e.target.value)} className="w-12 h-8 p-0 border-0" />
                      <input type="text" value={value} onChange={e => setter(e.target.value)} className="bg-white/5 text-sm h-8 px-2 flex-1" />
                      <button type="button" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(value); }} className="ml-2 bg-white/10 px-3 py-1 rounded">Copier</button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] w-20">Police</label>
                    <select value={fontChoice} onChange={e => setFontChoice(e.target.value)} className="bg-white/5 h-8 px-2">
                      <option value="sans">Sans</option>
                      <option value="serif">Serif</option>
                    </select>
                    <label className="text-[11px] ml-4">Style icônes</label>
                    <select value={iconStyle} onChange={e => setIconStyle(e.target.value)} className="bg-white/5 h-8 px-2">
                      <option value="default">Carré</option>
                      <option value="rounded">Arrondi</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Nom Complet *</label>
            <Input name="name" value={formData.name} onChange={handleInputChange} required className="bg-white/5 border-white/10 h-12 rounded-lg" placeholder="Nom Prénom" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Profession </label>
            <Input name="job" value={formData.job} onChange={handleInputChange} className="bg-white/5 border-white/10 h-12 rounded-lg" placeholder="Ex: Développeur" />
          </div>

          {cardType === 'profile' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Entreprise</label>
                  <Input name="company" value={formData.company} onChange={handleInputChange} className="bg-white/5 border-white/10 h-12 rounded-lg" placeholder="Société" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Téléphone *</label>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} required className="bg-white/5 border-white/10 h-12 rounded-lg" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#D4AF37] ml-1 uppercase tracking-widest">Adresse / Localisation</label>
                <div className="flex gap-2">
                  <Input name="address" value={formData.address} onChange={handleInputChange} className="bg-white/5 h-12 border-[#D4AF37]/20 rounded-lg" placeholder="Entrez une adresse ou collez un lien Maps" />
                  <button type="button" onClick={async () => {
                    const q = formData.address || formData.location || '';
                    if (!q) return toast.error('Adresse vide');
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
                      const j = await res.json();
                      if (j && j[0]) {
                        setFormData(prev => ({ ...prev, address: j[0].display_name, lat: j[0].lat, lng: j[0].lon }));
                        toast.success('Localisation trouvée');
                      } else { toast.error('Adresse introuvable'); }
                    } catch (e) { toast.error('Erreur géocodage'); }
                  }} className="bg-[#D4AF37] px-4 rounded-lg text-black">Chercher</button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email Professionnel</label>
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="bg-white/5 border-white/10 h-12" placeholder="contact@exemple.com" />
              </div>

              <div className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] text-[#D4AF37] font-black tracking-widest uppercase">Réseaux Sociaux</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="linkedin" placeholder="LinkedIn" value={formData.linkedin} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="tiktok" placeholder="TikTok" value={formData.tiktok} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="snapchat" placeholder="Snapchat" value={formData.snapchat} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="telegram" placeholder="Telegram" value={formData.telegram} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="youtube" placeholder="Youtube" value={formData.youtube} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                  <Input name="twitter" placeholder="Twitter" value={formData.twitter} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
                </div>
                <Input name="website" placeholder="Site Web (https://...)" value={formData.website} onChange={handleInputChange} className="bg-white/5 border-white/10 text-xs h-10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#D4AF37]">Photo de Profil {profileId && "(Optionnel)"}</label>
                  <input id="photoInputAdmin" type="file" accept="image/*" onChange={onPhotoChange} className="text-[10px] text-gray-400" />
                  <img id="adminCropImage" alt="to crop" style={{ display: 'block', maxWidth: '220px', marginTop: '8px' }} />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={applyCrop} className="bg-[#D4AF37] px-3 rounded-lg text-black">Appliquer</button>
                    <button type="button" onClick={() => { try { if (cropper) cropper.destroy(); } catch(e){} setCropper(null); setPhotoFile(null); }} className="bg-white/5 px-3 rounded-lg">Annuler</button>
                  </div>
                  <img id="photoPreview" alt="preview" style={{ display: 'block', maxWidth: '100px', marginTop: '8px', borderRadius: '999px' }} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#D4AF37]">Couverture</label>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} className="text-[10px] text-gray-400" />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-extrabold h-14 rounded-2xl transition-all">
            {loading ? "EN COURS..." : profileId ? "METTRE À JOUR" : "CRÉER MA CARTE"}
          </Button>
        </form>
      </div>
    </div>
  );
}