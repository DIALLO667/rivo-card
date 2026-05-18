import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || '';

export default function Subaccounts() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      // ensure we are owner before calling owner-only endpoint
      if (currentUser && currentUser.role !== 'owner') {
        toast.error('Accès refusé — vous n\'êtes pas propriétaire');
        setLoading(false);
        return;
      }
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
  }, [navigate, currentUser]);

  const createSub = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Connectez-vous d\'abord');
        navigate('/login');
        return;
      }
      if (currentUser && currentUser.role !== 'owner') {
        toast.error('Accès refusé — vous n\'êtes pas propriétaire');
        return;
      }
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
      if (status === 401) {
        toast.error('Non authentifié — connectez-vous');
        navigate('/login');
        return {};
      }
      if (status === 403) {
        // Owner-only endpoint for scope=all
        toast.error('Accès refusé pour récupérer les comptes de profils');
        return {};
      }
      return {};
    }
  }, [navigate]);

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
  }, [navigate]);

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
      if (me.role !== 'owner') {
        toast.error('Vous n\'êtes pas propriétaire — accès restreint');
        // don't call fetchSubs or counts
        setLoading(false);
        return;
      }
      await fetchSubs();
      const c = await fetchProfileCounts();
      if (mounted) setCounts(c);
    })();
    return () => { mounted = false; };
  }, [fetchMe, fetchSubs, fetchProfileCounts, navigate]);

  return (
    <div className="min-h-screen bg-[#0f1113] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Filiales</h2>
          <Button onClick={() => navigate('/dashboard')} variant="ghost">Retour</Button>
        </div>

        {/* Debug panel - enable by adding ?debug=1 to the URL */}
        {new URL(window.location.href).searchParams.get('debug') === '1' && (
          <div className="mb-4 p-3 bg-[#111] rounded">
            <div className="font-semibold">Debug</div>
            <pre className="text-xs mt-2 text-gray-300 whitespace-pre-wrap">{JSON.stringify({ currentUser, lastRequest }, null, 2)}</pre>
          </div>
        )}

        <div className="mb-6 p-4 bg-[#131314] rounded-lg">
          <h3 className="font-semibold mb-2">Créer une filiale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mt-3">
            <Button onClick={createSub} className="bg-[#D4AF37] text-black">Créer</Button>
          </div>
        </div>

        <div className="bg-[#131314] rounded-lg p-4">
          <h3 className="font-semibold mb-3">Filiales existantes</h3>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="space-y-3">
              {subs.length === 0 ? <div className="text-sm text-gray-400">Aucune filiale trouvée</div> : subs.map((s) => (
                <div key={s.user_id} className="flex items-center justify-between p-3 bg-[#0f1113] rounded">
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.email}</div>
                  </div>
                  <div className="text-sm text-gray-300">Profils: {counts[s.user_id] || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
