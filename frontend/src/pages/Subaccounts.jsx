import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || '';

export default function Subaccounts() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subs, setSubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Connectez-vous d\'abord');
        navigate('/login');
        return;
      }
      // capture debug info
      if (typeof window !== 'undefined') {
        setLastRequest({ url: `${API}/users`, method: 'GET', headers: { Authorization: `Bearer ${token}` }, cookie: document.cookie });
      }
      // Removed client-side owner-only guard so the UI will attempt to call the endpoint
      const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      const list = res.data?.subaccounts || [];
      setSubs(list);
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 401) {
        toast.error('Non authentifié — veuillez vous connecter');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.error('Accès refusé — vous devez être propriétaire pour gérer les filiales');
        return;
      }
      if (status === 422) {
        toast.error('Requête invalide (422) — vérifiez votre session et réessayez');
        console.debug('422 response:', data);
        return;
      }
      toast.error('Impossible de charger les filiales');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const createSub = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Connectez-vous d\'abord');
        navigate('/login');
        return;
      }
      // Removed client-side create guard so creation attempts are sent to the backend (which enforces auth)
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      if (typeof window !== 'undefined') {
        setLastRequest({ url: `${API}/users`, method: 'POST', body: { name, email }, headers: { Authorization: `Bearer ${token}` }, cookie: document.cookie });
      }
      await axios.post(`${API}/users`, fd, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Filiale créée');
      setName(''); setEmail(''); setPassword('');
      fetchSubs();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 401) {
        toast.error('Non authentifié — connectez-vous');
        navigate('/login');
        return;
      }
      if (status === 403) {
        toast.error('Accès refusé — vous n\'êtes pas propriétaire');
        return;
      }
      if (status === 422) {
        toast.error('Requête invalide (422) — champs manquants ou mal formés');
        console.debug('422 response:', data);
        return;
      }
      toast.error('Échec création filiale');
    }
  };

  // helper: get count of profiles for a given user id (calls /api/profiles?scope=all once and counts matching user_id)
  const fetchProfileCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/profiles`, { headers: { Authorization: `Bearer ${token}` }, params: { scope: 'all' }, withCredentials: true });
      const all = res.data || [];
      const counts = {};
      all.forEach((p) => { counts[p.user_id] = (counts[p.user_id] || 0) + 1; });
      return counts;
    } catch (e) {
      console.error('fetchProfileCounts error', e?.response || e);
      const status = e?.response?.status;
      // Don't navigate from this helper; caller will handle authentication redirects.
      if (status === 403) {
        // Owner-only endpoint for scope=all
        toast.error('Accès refusé pour récupérer les comptes de profils');
        return {};
      }
      return {};
    }
  }, []);

  const [counts, setCounts] = useState({});
  // fetch current user info, then subaccounts and counts only if owner
  const fetchMe = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      return res.data;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await fetchMe();
      if (!mounted) return;
      setCurrentUser(me);
      if (!me) {
        toast.error('Non authentifié — connectez-vous');
        navigate('/login');
        return;
      }
      // Allow non-owner users to view/create subaccounts client-side; backend will enforce permissions.
      await fetchSubs();
      const c = await fetchProfileCounts();
      if (mounted) setCounts(c);
    })();
    return () => { mounted = false; };
  }, [fetchMe, fetchSubs, fetchProfileCounts, navigate]);

  return (
    <div className="flex min-h-screen">
  {/* Sidebar - near-black for a luxe look */}
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
                <span className="font-medium text-sm tracking-wide">Tableau de Bord</span>
              </li>
              <li className="px-3 py-3 rounded-lg flex items-center gap-3 bg-transparent">
                <span className={`w-3 h-3 rounded-full ${sidebarCollapsed ? 'mx-auto' : ''} ring-2 ring-blue-500`} />
                <span className="font-medium text-sm tracking-wide">Gestion des Membres</span>
              </li>
              <li className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">Gestion des Liens</span>
              </li>
              <li className="px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">Archivés</span>
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

  {/* Main content area */}
  <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-56'} bg-gray-50 min-h-screen p-6 md:p-10 transition-margin duration-200`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Gestion des Filiales</h2>
            <div className="flex items-center gap-3">
              <Input placeholder="Rechercher un membre..." className="bg-white border-gray-200" />
              <Button onClick={() => navigate('/profiles/new')} className="bg-[#D4AF37] text-black">+ Nouveau Profil</Button>
            </div>
          </div>

          {/* Debug panel - enable by adding ?debug=1 to the URL */}
          {new URL(window.location.href).searchParams.get('debug') === '1' && (
            <div className="mb-4 p-3 bg-white rounded shadow-sm">
              <div className="font-semibold">Debug</div>
              <pre className="text-xs mt-2 text-gray-700 whitespace-pre-wrap">{JSON.stringify({ currentUser, lastRequest }, null, 2)}</pre>
            </div>
          )}

          {(currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.email === 'amadou@rivostudio.com')) && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-3">Créer une filiale</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="mt-3 text-right">
                <Button onClick={createSub} className="bg-white border border-gray-200 text-gray-800">Créer</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div>Chargement...</div>
            ) : (
              subs.length === 0 ? <div className="text-sm text-gray-600">Aucune filiale trouvée</div> : subs.map((s) => (
                <div key={s.user_id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-2xl flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-100 flex items-center justify-center shadow-inner">
                      <div className="text-gray-700 font-semibold">{s.name?.charAt(0) || 'U'}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{s.name} {s.is_active === false && <span className="text-xs text-red-500 ml-2">(désactivé)</span>}</div>
                      <div className="text-sm text-gray-600">{s.email}</div>
                      <div className="text-xs text-gray-400">Créé le: {new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700">Profils: {counts[s.user_id] || 0}</div>
                    <Button onClick={() => navigate(`/dashboard?sub=${s.user_id}`)} className="text-sm bg-white border border-gray-200 text-gray-700">Voir profils</Button>
                    <Button onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const res = await axios.patch(`${API}/users/${s.user_id}/toggle_active`, null, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
                        toast.success(res.data?.is_active ? 'Filiale activée' : 'Filiale désactivée');
                        fetchSubs();
                      } catch (e) {
                        console.error('toggle error', e?.response || e);
                        toast.error('Impossible de changer l\'état');
                      }
                    }} className="text-sm bg-white border border-gray-200 text-gray-700">{s.is_active === false ? 'Activer' : 'Désactiver'}</Button>
                    <Button onClick={() => { setEditingId(s.user_id); setEditName(s.name); setEditEmail(s.email); }} className="text-sm bg-white border border-gray-200 text-gray-700">Modifier</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {editingId && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-white p-4 rounded max-w-md w-full shadow-lg">
                <h4 className="font-semibold mb-2 text-gray-800">Modifier filiale</h4>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nom" />
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="mt-2" />
                <div className="mt-3 flex justify-end space-x-2">
                  <Button onClick={() => setEditingId(null)} variant="ghost">Annuler</Button>
                  <Button onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const fd = new FormData();
                      fd.append('name', editName);
                      fd.append('email', editEmail);
                      await axios.put(`${API}/users/${editingId}`, fd, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
                      toast.success('Filiale modifiée');
                      setEditingId(null);
                      fetchSubs();
                    } catch (e) {
                      console.error('update error', e?.response || e);
                      toast.error('Impossible de modifier');
                    }
                  }} className="bg-[#04172a] text-white">Enregistrer</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
