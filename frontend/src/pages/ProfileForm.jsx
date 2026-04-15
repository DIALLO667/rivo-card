import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Robust API base: ensure there's exactly one trailing /api
const BASE_URL = process.env.REACT_APP_API_URL || '';
const API = (BASE_URL.replace(/\/api$/, '') || 'http://127.0.0.1:5100') + '/api';

export default function ProfileForm() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    job: '',
    company: '',
    phone: '',
    email: '',
    location: '',
    website: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    snapchat: '',
    telegram: '', // AJOUTÉ
    youtube: '', // AJOUTÉ
    twitter: '', // AJOUTÉ
    design_type: 'classic'
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [cardType, setCardType] = useState('profile');
  const [templateId, setTemplateId] = useState('template1');

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
            telegram: res.data.telegram || '', // AJOUTÉ
            youtube: res.data.youtube || '', // AJOUTÉ
            twitter: res.data.twitter || '', // AJOUTÉ
            design_type: res.data.design_type || 'classic'
          });
          // set cardType and templateId if available
          if (res.data.card_type) setCardType(res.data.card_type);
          if (res.data.template_id) setTemplateId(res.data.template_id);
        } catch (err) {
          toast.error("Impossible de charger les données");
        }
      };
      fetchProfile();
    }
  }, [profileId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  const data = new FormData();
  Object.keys(formData).forEach(key => data.append(key, formData[key] || ""));
  data.append('card_type', cardType);
  data.append('template_id', templateId);
  if (photoFile) data.append('photo', photoFile);
  // only append cover when profile mode
  if (cardType === 'profile' && coverFile) data.append('cover', coverFile);

  // Debug: log payload as plain object for easier reading in console
  try {
    const debugObj = {};
    data.forEach((value, key) => { debugObj[key] = value instanceof File ? value.name : value; });
    console.log('ProfileForm payload:', debugObj);
  } catch (e) { console.log('Failed to log FormData debug object', e); }

    // Debug: show token and target URL for easier troubleshooting
    const token = localStorage.getItem('token') || '';
    console.log('Token utilisé :', token);
    console.log('Requête vers :', API + '/profiles');

    try {
      const config = {
        headers: {
          'Authorization': 'Bearer ' + token,
          // Explicit Content-Type requested — note: axios will not add boundary when set manually.
          'Content-Type': 'multipart/form-data'
        },
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
      if (err.response?.status === 401) {
         toast.error("Session expirée. Reconnectez-vous.");
         navigate('/login');
      } else {
           // Log full server response for debugging 422 / validation errors
           console.error('Profile save error', err?.response || err);
           if (err.response?.data) console.error('Server response data:', err.response.data);
           toast.error("Erreur d'enregistrement");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f1113] text-white p-4 md:p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-[#1a1c1e] p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-bold mb-8 text-[#D4AF37]">
          {profileId ? "MODIFIER LE PROFIL" : "NOUVEAU PROFIL JPM"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Type de carte</label>
              <select value={cardType} onChange={e => setCardType(e.target.value)} className="w-full bg-white/5 border border-white/10 h-12 px-4 rounded-md text-sm outline-none">
                <option value="profile">Profile (template + cover)</option>
                <option value="cv">CV (juste une photo)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Template (aperçu)</label>
              <div className="flex gap-3 mt-2">
                <div onClick={() => setTemplateId('template1')} className={`w-20 h-28 rounded-lg p-2 flex items-end justify-center cursor-pointer ${templateId==='template1' ? 'ring-2 ring-[#C4A77D]' : 'ring-0'}`}>
                  <div className="w-full h-full bg-[#050505] rounded-md flex items-center justify-center text-xs text-white">Quiet</div>
                </div>
                <div onClick={() => setTemplateId('template2')} className={`w-20 h-28 rounded-lg p-2 flex items-end justify-center cursor-pointer ${templateId==='template2' ? 'ring-2 ring-[#C4A77D]' : 'ring-0'}`}>
                  <div className="w-full h-full bg-[#C5A87F] rounded-md flex items-center justify-center text-xs text-black">Links</div>
                </div>
              </div>
            </div>
          </div>

          {/* Name always visible */}
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Nom Complet *</label>
             <Input name="name" value={formData.name} onChange={handleInputChange} required className="bg-white/5 border-white/10 h-12" />
          </div>

          {/* If profile mode show full form, else show minimal CV fields */}
          {cardType === 'profile' ? (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#D4AF37] ml-1 uppercase">Style des Icônes</label>
                <select name="design_type" value={formData.design_type} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 h-12 px-4 rounded-md text-sm outline-none">
                  <option value="classic" className="bg-[#1a1c1e]">Premium Gold (Jaune Jamaney)</option>
                  <option value="modern" className="bg-[#1a1c1e]">Vibrant Color (Couleurs Réelles)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Entreprise</label>
                  <Input name="company" value={formData.company} onChange={handleInputChange} className="bg-white/5 border-white/10 h-12" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Téléphone *</label>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} required className="bg-white/5 border-white/10 h-12" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#D4AF37] ml-1 uppercase tracking-widest">Lien Localisation (Google Maps)</label>
                <Input name="location" value={formData.location} onChange={handleInputChange} className="bg-white/5 h-12 border-[#D4AF37]/20" placeholder="Collez le lien Maps ici" />
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
                  <label className="text-sm font-semibold text-[#D4AF37]">Photo de Profil</label>
                  <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="text-[10px] text-gray-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#D4AF37]">Couverture</label>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} className="text-[10px] text-gray-400" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#D4AF37]">Photo (CV)</label>
                  <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="text-[10px] text-gray-400" />
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