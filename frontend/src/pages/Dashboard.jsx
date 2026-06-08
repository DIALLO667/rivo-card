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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [subaccounts, setSubaccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // Removed inline 'create subaccount' panel; a dedicated Subaccounts page will handle that
  // const [showCreateSub, setShowCreateSub] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [ownerOverview, setOwnerOverview] = useState(false);
  const [selectedSub, setSelectedSub] = useState('all');
  // selectedSub default is 'all'; if a `sub` query param exists we'll read it on mount

  // load profiles; intentionally a plain function (not a stable callback) to avoid dependency cycles
  const fetchProfiles = async () => {
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
      if (selectedSub && selectedSub !== 'all') {
        if (selectedSub === 'me') {
          const allowed = new Set();
          if (currentUser && currentUser.user_id) allowed.add(currentUser.user_id);
          (subaccounts || []).forEach((s) => allowed.add(s.user_id));
          data = data.filter((p) => allowed.has(p.user_id));
        } else {
          data = data.filter((p) => p.user_id === selectedSub);
        }
      }
      setProfiles(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubaccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setSubaccounts(res.data?.subaccounts || []);
      return res.data?.subaccounts || [];
    } catch (e) {
      setSubaccounts([]);
      return [];
    }
  };

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      return res.data;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // mount loader: fetch current user, subaccounts, then profiles. Using local flow avoids dependency cycles.
    (async () => {
      try {
        // compute the initial sub from the current URL
        try {
          const qs = new URL(window.location.href).searchParams;
          const param = qs.get('sub') || 'all';
          if (param && param !== 'all') setSelectedSub(param);
        } catch (e) {
          // ignore if URL parsing fails
        }

        const me = await fetchMe();
        setCurrentUser(me);
        await fetchSubaccounts();
        await fetchProfiles();
      } catch (e) {
        console.error('initial load error', e);
      }
    })();
  }, []);

  useEffect(() => {
    let result = [...profiles];
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    if (filterType === 'all') {
      result = result.filter((p) => !p.is_archived);
    } else if (filterType === 'archived') {
      result = result.filter((p) => p.is_archived);
    } else if (filterType === 'monthly') {
      result = result.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === cm && d.getFullYear() === cy; });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.job || '').toLowerCase().includes(q));
    }

    setFilteredProfiles(result);
  }, [searchQuery, profiles, filterType]);

  // filteredProfiles is computed by the main effect above (depends on [searchQuery, profiles, filterType])

  // subaccounts are managed on the dedicated Subaccounts page

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
    const message = encodeURIComponent(`Bonjour ${name}, votre abonnement Rivo-Card arrive à expiration. Souhaitez-vous le renouveler ?`);
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const countNewThisMonth = profiles.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length;

  return (
    <div className="flex min-h-screen">
  {/* Sidebar - collapsible, near-black for a luxe look */}
  <aside className={`${sidebarCollapsed ? 'w-20' : 'w-56'} fixed left-0 top-0 bottom-0 bg-[#050608] text-white flex flex-col justify-between transition-width duration-200 shadow-xl`}>
        <div>
          <div className="px-4 py-4 flex items-center justify-between">
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="text-white font-extrabold text-sm">{sidebarCollapsed ? 'RC' : 'RIVO-CARD'}<span className={`${sidebarCollapsed ? 'hidden' : 'ml-1 text-[#D4AF37]'}`}> ADMIN</span></div>
            </div>
            <div>
              <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} className="p-2 rounded hover:bg-white/10">
                <svg className={`h-4 w-4 transform ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </div>

          <nav className="mt-6 px-2">
            <ul className="space-y-3">
              <li className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Tableau de Bord'}</span>
              </li>
              <li className="px-3 py-3 rounded-lg flex items-center gap-3 bg-transparent">
                <span className={`w-3 h-3 rounded-full ${sidebarCollapsed ? 'mx-auto' : ''} ring-2 ring-blue-500`} />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Membres'}</span>
              </li>
              <li className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Liens'}</span>
              </li>
              <li className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Archivés'}</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="px-4 py-6">
          <div className="border-t border-white/5 pt-4">
            <Button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} variant="ghost" className="w-full text-white">Déconnexion</Button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-56'} bg-gray-50 min-h-screen p-6 md:p-10 transition-margin duration-200`}>
        <div className="max-w-7xl mx-auto">
          {/* Header card */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white border border-gray-200 h-12 rounded-xl" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <select value={selectedSub} onChange={(e) => { setSelectedSub(e.target.value); fetchProfiles(); }} className="bg-white border border-gray-200 h-10 px-3 rounded">
                    <option value="me">Mes profils</option>
                    {subaccounts.map((s) => <option key={s.user_id} value={s.user_id}>{s.name} ({s.user_id})</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={ownerOverview} onChange={(e) => { setOwnerOverview(e.target.checked); fetchProfiles(); }} /> Vue d'ensemble
                  </label>
                </div>

                <Button onClick={() => navigate('/profiles/new')} className="bg-[#D4AF37] text-black font-black w-full md:w-auto h-12 px-6 rounded-xl">
                  <Plus className="mr-2 h-5 w-5" /> NOUVEAU PROFIL
                </Button>
                <Button onClick={() => navigate('/subaccounts')} variant="ghost" className="h-12 bg-white border border-gray-200 text-gray-700">
                  <Users className="mr-2 h-5 w-5" /> Filiales
                </Button>
                {selectedSub && selectedSub !== 'all' && (
                  <Button onClick={() => { setSelectedSub('all'); window.history.replaceState({}, '', '/dashboard'); fetchProfiles(); }} variant="outline" className="h-12 bg-white border border-gray-200 text-gray-700">Retour</Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'default' : 'outline'} className={filterType === 'all' ? 'bg-white text-black' : 'border border-gray-200 text-gray-600'}>Tous ({profiles.filter((p) => !p.is_archived).length})</Button>
            <Button onClick={() => setFilterType('monthly')} variant={filterType === 'monthly' ? 'default' : 'outline'} className={filterType === 'monthly' ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}>Inscrits ce mois ({countNewThisMonth})</Button>
            <Button onClick={() => setFilterType('archived')} variant={filterType === 'archived' ? 'default' : 'outline'} className={filterType === 'archived' ? 'bg-gray-700 text-white' : 'border border-gray-200 text-gray-600'}>Archives ({profiles.filter((p) => p.is_archived).length})</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => {
                const days = getDaysUntilRenewal(profile.created_at);
                return (
                  <div key={profile.profile_id} className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-100 transition-all">
                    <div className="absolute top-4 right-4 z-10">
                      {profile.is_archived ? <Badge variant="destructive">Archivé</Badge> : days <= 30 ? <Badge className="px-3 py-1 rounded-full bg-[#D4AF37] text-black font-semibold">{days}j restants</Badge> : <Badge className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold">Actif</Badge>}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <img src={profile.photo_url} className="w-16 h-16 rounded-full border-4 border-[#D4AF37] object-cover shadow-sm" alt="" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{profile.name}</h3>
                          <div className="flex items-center text-gray-600 text-[12px] uppercase tracking-wider">
                            <Calendar className="h-3 w-3 mr-1" /> Créé le {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mb-3">
                        <Button onClick={() => window.open(`/p/${profile.unique_link}`, '_blank')} className="flex-1 bg-white border border-gray-100 text-sm text-gray-700 hover:shadow-sm">Voir</Button>
                        <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${profile.unique_link}`)} className="bg-white border border-gray-100 p-2 text-sm text-gray-700 hover:shadow-sm">Copier</Button>
                        <Button onClick={() => navigate(`/profiles/edit/${profile.profile_id}`)} className="flex-1 bg-white border border-gray-100 text-sm text-gray-700 hover:shadow-sm">Éditer</Button>
                        <Button onClick={() => handleArchive(profile.profile_id, profile.is_archived)} className={`px-3 ${profile.is_archived ? 'text-emerald-600' : 'text-gray-500 hover:text-red-500'}`}><Archive className="h-4 w-4" /></Button>
                      </div>

                      {!profile.is_archived && days <= 30 && (
                        <Button onClick={() => openWhatsApp(profile.phone, profile.name)} className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white flex items-center justify-center"><MessageCircle className="h-4 w-4 mr-2" /> RELANCER</Button>
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
      </main>
    </div>
  );
}
