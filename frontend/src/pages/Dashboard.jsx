import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, LogOut, Eye, Edit, Archive, MessageCircle, Search, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const API = "https://jamaney-backend.onrender.com/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    let result = [...profiles];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Filtrage par onglet
    if (filterType === 'all') {
      result = result.filter(p => !p.is_archived);
    } else if (filterType === 'expiring') {
      result = result.filter(p => !p.is_archived && getDaysUntilRenewal(p.created_at) <= 30);
    } else if (filterType === 'archived') {
      result = result.filter(p => p.is_archived);
    } else if (filterType === 'monthly') {
      // Filtrer pour le mois en cours uniquement
      result = result.filter(p => {
        const date = new Date(p.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    }

    // 2. Filtrage par recherche
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.job.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProfiles(result);
  }, [searchQuery, profiles, filterType]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/profiles`, { 
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true 
      });
      setProfiles(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (profileId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/profiles/${profileId}/archive`, {}, { 
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true 
      });
      toast.success(currentStatus ? 'Profil réactivé' : 'Profil archivé');
      fetchProfiles();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const getDaysUntilRenewal = (createdAt) => {
    const start = new Date(createdAt);
    const nextRenewal = new Date(start);
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    const today = new Date();
    return Math.ceil((nextRenewal - today) / (1000 * 60 * 60 * 24));
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Bonjour ${name}, votre abonnement Jamaney Card arrive à expiration. Souhaitez-vous le renouveler ?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  // Calculs pour les badges des onglets
  const countNewThisMonth = profiles.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

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
            <Input 
              placeholder="Rechercher un membre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1c1e] border-white/10 h-12 rounded-xl"
            />
          </div>
          <Button onClick={() => navigate('/profiles/new')} className="bg-[#D4AF37] text-black font-black w-full md:w-auto h-12 px-8 rounded-xl">
            <Plus className="mr-2 h-5 w-5" /> NOUVEAU PROFIL
          </Button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'default' : 'outline'} className={filterType === 'all' ? 'bg-white text-black' : 'border-white/10 text-gray-400'}>
            Tous ({profiles.filter(p => !p.is_archived).length})
          </Button>
          
          <Button onClick={() => setFilterType('monthly')} variant={filterType === 'monthly' ? 'default' : 'outline'} className={filterType === 'monthly' ? 'bg-blue-600 text-white' : 'border-white/10 text-gray-400'}>
            Inscrits ce mois ({countNewThisMonth})
          </Button>

          <Button onClick={() => setFilterType('expiring')} variant={filterType === 'expiring' ? 'default' : 'outline'} className={filterType === 'expiring' ? 'bg-orange-500 text-white' : 'border-white/10 text-gray-400'}>
            À renouveler ({profiles.filter(p => !p.is_archived && getDaysUntilRenewal(p.created_at) <= 30).length})
          </Button>
          
          <Button onClick={() => setFilterType('archived')} variant={filterType === 'archived' ? 'default' : 'outline'} className={filterType === 'archived' ? 'bg-gray-700 text-white' : 'border-white/10 text-gray-400'}>
            Archives ({profiles.filter(p => p.is_archived).length})
          </Button>
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
                      <Button onClick={() => handleArchive(profile.profile_id, profile.is_archived)} className={`px-3 ${profile.is_archived ? 'text-green-500' : 'text-gray-500 hover:text-red-500'}`}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>

                    {!profile.is_archived && days <= 30 && (
                      <Button onClick={() => openWhatsApp(profile.phone, profile.name)} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-xs font-bold">
                        <MessageCircle className="h-4 w-4 mr-2" /> RELANCER WHATSAPP
                      </Button>
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
      </div>
    </div>
  );
}