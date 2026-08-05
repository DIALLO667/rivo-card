import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, LogOut, Archive, MessageCircle, Search, Calendar, Users, ShoppingCart, Check, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';
import { toWhatsAppHref } from '@/lib/urlUtils';

const API = process.env.REACT_APP_API_URL || '';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
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
  const [selectedSub, setSelectedSub] = useState('me');
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [generatedActivationUrl, setGeneratedActivationUrl] = useState('');
  const [activationError, setActivationError] = useState('');
  const [generatingActivation, setGeneratingActivation] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  // selectedSub default is 'all'; if a `sub` query param exists we'll read it on mount

  // load profiles; accepts explicit overrides so callers pass freshly-fetched
  // values instead of relying on React state updates (which are async).
  async function fetchProfiles({ ownerOv = false, sel = 'me' } = {}) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (sel && sel !== 'me' && sel !== 'all') {
        params.filter_user_id = sel;
      } else if (sel === 'all' || ownerOv) {
        params.scope = 'all';
      }
      const response = await axios.get(`${API}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        withCredentials: true,
      });
      setProfiles(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  }

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

  // This effect inlines several fetches and then triggers a single profile load.
  // We include `ownerOverview` and `selectedSub` here so the effect re-runs
  // when those UI options change (and ESLint won't warn).
  useEffect(() => {
    // mount loader: inline fetchMe and fetchSubaccounts so the effect only depends on fetchProfiles
    (async () => {
      try {
        // compute the initial sub from the current URL
        try {
          const qs = new URL(window.location.href).searchParams;
          const param = qs.get('sub');
          if (param && param !== 'all') setSelectedSub(param);
          else setSelectedSub('me');
        } catch (e) {
          // ignore if URL parsing fails
        }

        // inline fetchMe
        let me = null;
        try {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
              me = res.data;
            } catch (err) {
              me = null;
            }
          }
          setCurrentUser(me);
        } catch (err) {
          console.error('fetchMe inline error', err);
        }

        // inline fetchSubaccounts
        let fetchedSubs = [];
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
          fetchedSubs = res.data?.subaccounts || [];
          setSubaccounts(fetchedSubs);
        } catch (err) {
          fetchedSubs = [];
          setSubaccounts([]);
        }

        // call fetchProfiles with freshly-fetched values so we don't rely on
        // state updates that haven't been committed yet.
        const initialSub = (() => {
          try {
            const p = new URL(window.location.href).searchParams.get('sub');
            return p && p !== 'all' ? p : 'me';
          } catch (e) {
            return 'me';
          }
        })();
        await fetchProfiles({ ownerOv: ownerOverview, sel: initialSub });
      } catch (e) {
        console.error('initial load error', e);
      }
    })();
  }, [ownerOverview, selectedSub]);

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
      // refresh using the latest UI values
      await fetchProfiles({ ownerOv: ownerOverview, sel: selectedSub });
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  // delete profile
  const deleteProfile = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/profiles/${profileId}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Profil supprimé');
      await fetchProfiles({ ownerOv: ownerOverview, sel: selectedSub });
    } catch (err) {
      console.error('deleteProfile error', err);
      toast.error('Impossible de supprimer le profil');
    }
  };

  // Listen for activation-created events from the activation popup (localStorage key)
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === 'rivo_last_created_profile') {
        // refresh profiles silently
        fetchProfiles({ ownerOv: ownerOverview, sel: selectedSub });
        toast.success('Nouveau profil créé');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [ownerOverview, selectedSub, currentUser, subaccounts]);

  // Auto-refresh polling to keep dashboard in sync (every 20 seconds)
  useEffect(() => {
    const iv = setInterval(() => {
      fetchProfiles({ ownerOv: ownerOverview, sel: selectedSub, cur: currentUser, subs: subaccounts });
    }, 20000);
    return () => clearInterval(iv);
  }, [ownerOverview, selectedSub, currentUser, subaccounts]);

  const handleCopyLink = (profile) => {
    if (!profile.unique_link) return;
    navigator.clipboard.writeText(`${window.location.origin}/p/${profile.unique_link}`);
    setCopiedId(profile.profile_id);
    setTimeout(() => setCopiedId((c) => (c === profile.profile_id ? null : c)), 1000);
  };

  const downloadQrCode = async (profile) => {
    if (!profile.unique_link) return;
    try {
      const url = `${window.location.origin}/p/${profile.unique_link}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: '#0B1220', light: '#FFFFFF' },
      });
      const filename = `${(profile.name || 'profil').trim().toLowerCase().replace(/\s+/g, '-')}-qrcode.png`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('downloadQrCode error', err);
      toast.error('Impossible de générer le QR code');
    }
  };

  const generateActivationLink = async () => {
    setActivationError('');
    setGeneratingActivation(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActivationError("Non authentifié");
        setGeneratingActivation(false);
        return;
      }
      const res = await axios.post(`${API}/activation_tokens/generate`, {}, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      const url = res.data?.url || '';
      if (!url) throw new Error('Aucune URL reçue');
      setGeneratedActivationUrl(url);
      setShowActivationModal(true);
    } catch (err) {
      console.error('generateActivationLink error', err);
      setActivationError(err?.response?.data?.detail || err.message || 'Erreur lors de la génération du lien');
    } finally {
      setGeneratingActivation(false);
    }
  };

  const copyActivationLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedActivationUrl);
      toast.success('Lien copié dans le presse-papier');
    } catch (e) {
      toast.error('Impossible de copier le lien');
    }
  };

  // close modal on Escape key when shown
  useEffect(() => {
    if (!showActivationModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowActivationModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showActivationModal]);

  const getDaysUntilRenewal = (createdAt) => {
    const start = new Date(createdAt);
    const next = new Date(start); next.setFullYear(next.getFullYear() + 1);
    return Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Bonjour ${name}, votre abonnement Rivo-Card arrive à expiration. Souhaitez-vous le renouveler ?`);
    window.open(`${toWhatsAppHref(phone)}?text=${message}`, '_blank');
  };

  const countNewThisMonth = profiles.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length;

  return (
    <div className="flex min-h-screen">
  <Helmet><title>Tableau de bord | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>
  {/* Sidebar - collapsible, near-black for a luxe look */}
  {/* Desktop sidebar (hidden on small screens) */}
  <aside className={`${sidebarCollapsed ? 'md:w-20' : 'md:w-56'} hidden md:flex fixed left-0 top-0 bottom-0 bg-[#0B1220] text-white flex-col justify-between transition-width duration-200 shadow-xl`}>
  <div>
          <div className="px-4 py-4 flex items-center justify-between">
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="text-white font-extrabold text-sm">{sidebarCollapsed ? 'RC' : 'RIVO-CARD'}<span className={`${sidebarCollapsed ? 'hidden' : 'ml-1 text-blue-500'}`}> ADMIN</span></div>
            </div>
            <div>
              <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} className="p-2 rounded hover:bg-white/10">
                <svg className={`h-4 w-4 transform ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </div>

          <nav className="mt-6 px-2">
            <ul className="space-y-3">
              <li onClick={() => navigate('/dashboard')} className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5 bg-white/5">
                <span className={`w-3 h-3 rounded-full ${sidebarCollapsed ? 'mx-auto' : ''} ring-2 ring-blue-500`} />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Tableau de Bord'}</span>
              </li>
              <li onClick={() => navigate('/orders')} className="px-3 py-3 rounded-lg flex items-center gap-3 hover:bg-white/5 cursor-pointer">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Commandes'}</span>
              </li>
              <li onClick={() => navigate('/subaccounts')} className="px-3 py-3 rounded-lg flex items-center gap-3 hover:bg-white/5 cursor-pointer">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Filiales'}</span>
              </li>
              <li onClick={() => navigate('/links')} className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3 cursor-pointer">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Liens'}</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="px-4 py-6">
          <div className="border-t border-white/10 pt-4">
            <Button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} variant="ghost" className="w-full text-white hover:bg-white/10">Déconnexion</Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (overlay) */}
      {mobileSidebarVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarVisible(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0B1220] text-white flex flex-col justify-between shadow-xl p-4">
            <div>
              <div className="px-2 py-4 flex items-center justify-between">
                <div className="text-white font-extrabold">RIVO-CARD <span className="ml-1 text-blue-500">ADMIN</span></div>
                <button onClick={() => setMobileSidebarVisible(false)} className="p-2 rounded hover:bg-white/10">✕</button>
              </div>
              <nav className="mt-6 px-2">
                <ul className="space-y-3">
                  <li className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5" onClick={() => { setMobileSidebarVisible(false); navigate('/dashboard'); }}>Tableau de Bord</li>
                  <li className="px-3 py-3 rounded-lg flex items-center gap-3 hover:bg-white/5" onClick={() => { setMobileSidebarVisible(false); navigate('/orders'); }}>Commandes</li>
                  <li className="px-3 py-3 rounded-lg flex items-center gap-3" onClick={() => { setMobileSidebarVisible(false); navigate('/subaccounts'); }}>Gestion des Filiales</li>
                  <li className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3" onClick={() => { setMobileSidebarVisible(false); navigate('/links'); }}>Gestion des Liens</li>
                </ul>
              </nav>
            </div>
            <div className="px-4 py-6">
              <div className="border-t border-white/10 pt-4">
                <Button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} variant="ghost" className="w-full text-white hover:bg-white/10">Déconnexion</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`flex-1 ${sidebarCollapsed ? 'md:ml-20 ml-0' : 'md:ml-56 ml-0'} bg-gray-50 min-h-screen p-4 md:p-10 transition-margin duration-200`}>
        <div className="max-w-7xl mx-auto">
          {/* Header card */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6 space-y-4">
            {/* Row 1: recherche + action principale */}
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button className="md:hidden p-2 rounded hover:bg-gray-100 shrink-0" onClick={() => setMobileSidebarVisible(true)} aria-label="Ouvrir le menu">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white border border-gray-200 h-12 rounded-xl" />
              </div>
              <Button onClick={() => navigate('/profiles/new')} className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shrink-0 ml-auto">
                <Plus className="mr-2 h-5 w-5" /> <span className="hidden sm:inline">NOUVEAU PROFIL</span><span className="sm:hidden">Nouveau</span>
              </Button>
            </div>

            {/* Row 2: filtres de portée + actions secondaires */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
              {(currentUser?.role === 'owner' || currentUser?.role === 'admin' || subaccounts.length > 0) && (
                <div className="flex items-center gap-3">
                  <select value={selectedSub} onChange={(e) => { const v = e.target.value; setSelectedSub(v); fetchProfiles({ ownerOv: ownerOverview, sel: v }); }} className="bg-white border border-gray-200 h-10 px-3 rounded-lg text-sm text-gray-900 font-medium">
                    <option value="me">Mes profils</option>
                    <option value="all">Tous</option>
                    {subaccounts.map((s) => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={ownerOverview} onChange={(e) => { const v = e.target.checked; setOwnerOverview(v); fetchProfiles({ ownerOv: v, sel: selectedSub }); }} /> Vue d'ensemble
                  </label>
                  {selectedSub && selectedSub !== 'me' && selectedSub !== 'all' && (
                    <Button onClick={() => { setSelectedSub('me'); window.history.replaceState({}, '', '/dashboard'); fetchProfiles({ ownerOv: ownerOverview, sel: 'me' }); }} variant="outline" size="sm" className="h-9 bg-white border-gray-200 text-gray-700">Retour</Button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <Button onClick={generateActivationLink} variant="outline" className="h-10 px-4 rounded-lg border-gray-200 text-gray-700 font-semibold" disabled={generatingActivation}>
                  {generatingActivation ? 'Génération...' : "Lien d'activation"}
                </Button>
                <Button onClick={() => navigate('/subaccounts')} variant="ghost" className="h-10 bg-white border border-gray-200 text-gray-700">
                  <Users className="mr-2 h-4 w-4" /> Filiales
                </Button>
              </div>
            </div>

            {/* Activation modal */}
            {showActivationModal && (
              <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowActivationModal(false)} role="dialog" aria-modal="true">
                  <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">Lien d'activation généré</h3>
                      <button aria-label="Fermer" onClick={() => setShowActivationModal(false)} className="ml-2 p-2 rounded hover:bg-gray-100">✕</button>
                    </div>
                    <p className="text-sm text-gray-600 break-words mb-4">{generatedActivationUrl}</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <Button onClick={() => window.open(generatedActivationUrl, '_blank', 'noopener,noreferrer')} variant="outline" className="border-gray-200 text-gray-700">Ouvrir le lien</Button>
                      <Button onClick={copyActivationLink} className="bg-blue-600 text-white">Copier le lien</Button>
                      <Button onClick={() => setShowActivationModal(false)} variant="ghost">Fermer</Button>
                    </div>
                  </div>
                </div>
            )}
          </div>
          
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'default' : 'outline'} className={filterType === 'all' ? 'bg-white text-black' : 'border border-gray-200 text-gray-600'}>Tous ({profiles.filter((p) => !p.is_archived).length})</Button>
            <Button onClick={() => setFilterType('monthly')} variant={filterType === 'monthly' ? 'default' : 'outline'} className={filterType === 'monthly' ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}>Inscrits ce mois ({countNewThisMonth})</Button>
            <Button onClick={() => setFilterType('archived')} variant={filterType === 'archived' ? 'default' : 'outline'} className={filterType === 'archived' ? 'bg-gray-700 text-white' : 'border border-gray-200 text-gray-600'}>Archives ({profiles.filter((p) => p.is_archived).length})</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => {
                const days = getDaysUntilRenewal(profile.created_at);
                return (
                  <div key={profile.profile_id} className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-100 transition-all">
                    <div className="absolute top-4 right-4 z-10">
                      {profile.is_archived ? <Badge variant="destructive">Archivé</Badge> : days <= 30 ? <Badge className="px-3 py-1 rounded-full bg-blue-600 text-white font-semibold">{days}j restants</Badge> : <Badge className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold">Actif</Badge>}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        {profile.photo_url ? (
                          <img src={profile.photo_url} className="w-16 h-16 rounded-full border-4 border-blue-600 object-cover shadow-sm" alt={profile.name || 'Photo'} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-4 border-blue-600 bg-gray-100 flex items-center justify-center font-semibold text-gray-700">{(profile.name || 'U').charAt(0)}</div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{profile.name}</h3>
                          <div className="flex items-center text-gray-600 text-[12px] uppercase tracking-wider">
                            <Calendar className="h-3 w-3 mr-1" /> Créé le {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {profile.instagram && (<a href={`https://instagram.com/${profile.instagram.replace(/^@/,'')}`} target="_blank" rel="noreferrer" className="text-pink-500 text-sm">IG</a>)}
                            {profile.linkedin && (<a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">IN</a>)}
                            {profile.facebook && (<a href={profile.facebook} target="_blank" rel="noreferrer" className="text-blue-800 text-sm">FB</a>)}
                            {profile.snapchat && (<a href={`https://www.snapchat.com/add/${profile.snapchat}`} target="_blank" rel="noreferrer" className="text-yellow-500 text-sm">SC</a>)}
                            {profile.twitter && (<a href={profile.twitter.startsWith('http')?profile.twitter:`https://twitter.com/${profile.twitter.replace(/^@/,'')}`} target="_blank" rel="noreferrer" className="text-sky-500 text-sm">TW</a>)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-3 items-center">
                        <button title="Voir" onClick={() => profile.unique_link && window.open(`/p/${profile.unique_link}`, '_blank')} disabled={!profile.unique_link} className="p-2 bg-white border border-gray-100 rounded-md hover:shadow-sm">
                          <svg className="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button
                          title="Copier"
                          onClick={() => handleCopyLink(profile)}
                          disabled={!profile.unique_link}
                          className={`p-2 border rounded-md transition-colors duration-300 hover:shadow-sm ${
                            copiedId === profile.profile_id
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                              : 'bg-white border-gray-100 text-gray-700'
                          }`}
                        >
                          {copiedId === profile.profile_id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><rect x="3" y="3" width="13" height="13" rx="2" ry="2"/></svg>
                          )}
                        </button>
                        <button title="Télécharger le QR code (PNG)" onClick={() => downloadQrCode(profile)} disabled={!profile.unique_link} className="p-2 bg-white border border-gray-100 rounded-md hover:shadow-sm text-gray-700">
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button title="Éditer" onClick={() => navigate(`/profiles/edit/${profile.profile_id}`)} className="p-2 bg-white border border-gray-100 rounded-md hover:shadow-sm">
                          <svg className="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4h7a1 1 0 011 1v7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 3l-12 12H3v-6L15 3z"/></svg>
                        </button>
                        <button title="Supprimer" onClick={() => deleteProfile(profile.profile_id)} className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-md hover:shadow-sm">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
                        </button>
                        <button title={profile.is_archived ? 'Réactiver' : 'Archiver'} onClick={() => handleArchive(profile.profile_id, profile.is_archived)} className={`p-2 bg-white border border-gray-100 rounded-md hover:shadow-sm ${profile.is_archived ? 'text-emerald-600' : 'text-gray-500 hover:text-red-500'}`}><Archive className="h-4 w-4" /></button>
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
