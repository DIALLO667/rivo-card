import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, LogOut, Archive, MessageCircle, Search, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const API = process.env.REACT_APP_API_URL || '';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [subaccounts, setSubaccounts] = useState([]);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [ownerOverview, setOwnerOverview] = useState(false);
  const [selectedSub, setSelectedSub] = useState('all');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (ownerOverview) params.scope = 'all';
      const response = await axios.get(`${API}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        withCredentials: true,
      });
      let data = response.data || [];
      if (selectedSub && selectedSub !== 'all') data = data.filter((p) => p.user_id === selectedSub);
      setProfiles(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  }, [ownerOverview, selectedSub]);

  const fetchSubaccounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setSubaccounts(res.data?.subaccounts || []);
    } catch (e) {
      setSubaccounts([]);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    fetchSubaccounts();
  }, [fetchProfiles, fetchSubaccounts]);

  useEffect(() => {
    let result = [...profiles];
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    if (filterType === 'all') result = result.filter((p) => !p.is_archived);
    else if (filterType === 'expiring') result = result.filter((p) => !p.is_archived && getDaysUntilRenewal(p.created_at) <= 30);
    else if (filterType === 'archived') result = result.filter((p) => p.is_archived);
    else if (filterType === 'monthly') result = result.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === cm && d.getFullYear() === cy; });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.job || '').toLowerCase().includes(q));
    }

    setFilteredProfiles(result);
  }, [searchQuery, profiles, filterType]);

  const createSubaccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('email', newEmail);
      fd.append('password', newPassword);
      fd.append('name', newName);
      await axios.post(`${API}/users`, fd, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Filiale créée');
      setNewEmail(''); setNewName(''); setNewPassword(''); setShowCreateSub(false);
      fetchSubaccounts();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création de la filiale');
    }
  };

  const handleArchive = async (profileId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/profiles/${profileId}/archive`, {}, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success(currentStatus ? 'Profil réactivé' : 'Profil archivé');
      fetchProfiles();
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const getDaysUntilRenewal = (createdAt) => {
    const start = new Date(createdAt);
    const next = new Date(start); next.setFullYear(next.getFullYear() + 1);
    return Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Bonjour ${name}, votre abonnement Jamaney Card arrive à expiration. Souhaitez-vous le renouveler ?`);
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const countNewThisMonth = profiles.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length;

  return (
    <div className="min-h-screen bg-[#0f1113] text-white font-sans">
      <div className="bg-[#1a1c1e] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#D4AF37]">Rivostudio ADMIN</h1>
            <p className="text-gray-500 text-xs tracking-widest uppercase font-bold">Gestion des membres</p>
          </div>
          <Button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} variant="ghost" className="text-gray-400 hover:text-red-400">
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-[#1a1c1e] border-white/10 h-12 rounded-xl" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select value={selectedSub} onChange={(e) => { setSelectedSub(e.target.value); fetchProfiles(); }} className="bg-[#111214] border border-white/10 h-10 px-3 rounded">
                <option value="all">Tous mes profils</option>
                <option value="me">Mes profils</option>
                {subaccounts.map((s) => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" checked={ownerOverview} onChange={(e) => { setOwnerOverview(e.target.checked); fetchProfiles(); }} /> Vue d'ensemble
              </label>
            </div>

            <Button onClick={() => navigate('/profiles/new')} className="bg-[#D4AF37] text-black font-black w-full md:w-auto h-12 px-6 rounded-xl">
              <Plus className="mr-2 h-5 w-5" /> NOUVEAU PROFIL
            </Button>
            <Button onClick={() => setShowCreateSub((v) => !v)} variant="ghost" className="h-12">
              <Users className="mr-2 h-5 w-5" /> Filiales
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'default' : 'outline'} className={filterType === 'all' ? 'bg-white text-black' : 'border-white/10 text-gray-400'}>Tous ({profiles.filter((p) => !p.is_archived).length})</Button>
          <Button onClick={() => setFilterType('monthly')} variant={filterType === 'monthly' ? 'default' : 'outline'} className={filterType === 'monthly' ? 'bg-blue-600 text-white' : 'border-white/10 text-gray-400'}>Inscrits ce mois ({countNewThisMonth})</Button>
          <Button onClick={() => setFilterType('expiring')} variant={filterType === 'expiring' ? 'default' : 'outline'} className={filterType === 'expiring' ? 'bg-orange-500 text-white' : 'border-white/10 text-gray-400'}>À renouveler ({profiles.filter((p) => !p.is_archived && getDaysUntilRenewal(p.created_at) <= 30).length})</Button>
          <Button onClick={() => setFilterType('archived')} variant={filterType === 'archived' ? 'default' : 'outline'} className={filterType === 'archived' ? 'bg-gray-700 text-white' : 'border-white/10 text-gray-400'}>Archives ({profiles.filter((p) => p.is_archived).length})</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => {
              const days = getDaysUntilRenewal(profile.created_at);
              return (
                <div key={profile.profile_id} className="bg-[#1a1c1e] rounded-3xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/30 transition-all">
                  <div className="h-20 w-full bg-gray-900 relative">
                    <img src={profile.cover_url} className="w-full h-full object-cover opacity-30" alt="" />
                    <div className="absolute top-3 right-3">
                      {profile.is_archived ? <Badge variant="destructive">Archivé</Badge> : days <= 30 ? <Badge className="bg-orange-500">{days}j restants</Badge> : <Badge className="bg-green-600">Actif</Badge>}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={profile.photo_url} className="w-14 h-14 rounded-full border-2 border-[#D4AF37] object-cover" alt="" />
                      <div>
                        <h3 className="font-bold text-white text-lg">{profile.name}</h3>
                        <div className="flex items-center text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                          <Calendar className="h-3 w-3 mr-1" /> Créé le {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => window.open(`/p/${profile.unique_link}`, '_blank')} className="flex-1 bg-white/5 border-white/10 text-xs">Voir</Button>
                      <Button onClick={() => navigate(`/profiles/edit/${profile.profile_id}`)} className="flex-1 bg-white/5 border-white/10 text-xs">Éditer</Button>
                      <Button onClick={() => handleArchive(profile.profile_id, profile.is_archived)} className={`px-3 ${profile.is_archived ? 'text-green-500' : 'text-gray-500 hover:text-red-500'}`}><Archive className="h-4 w-4" /></Button>
                    </div>

                    {!profile.is_archived && days <= 30 && (
                      <Button onClick={() => openWhatsApp(profile.phone, profile.name)} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-xs font-bold"><MessageCircle className="h-4 w-4 mr-2" /> RELANCER WHATSAPP</Button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center text-gray-600">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucun membre trouvé pour ce filtre</p>
              </div>
            )}
          </div>
        )}

        {showCreateSub && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-[#161718] rounded-xl border border-white/5">
            <h3 className="text-lg font-bold mb-4">Créer une filiale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Input placeholder="Nom" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10" />
              <Input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-10" />
              <Input placeholder="Mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10" />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSubaccount} className="bg-[#D4AF37] text-black">Créer</Button>
              <Button variant="ghost" onClick={() => setShowCreateSub(false)}>Annuler</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
