import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || '';

export default function Subaccounts() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      const list = res.data?.subaccounts || [];
      setSubs(list);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les filiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const createSub = async () => {
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      await axios.post(`${API}/users`, fd, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Filiale créée');
      setName(''); setEmail(''); setPassword('');
      fetchSubs();
    } catch (err) {
      console.error(err);
      toast.error('Échec création filiale');
    }
  };

  // helper: get count of profiles for a given user id (calls /api/profiles?scope=all once and counts matching user_id)
  const fetchProfileCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/profiles`, { headers: { Authorization: `Bearer ${token}` }, params: { scope: 'all' }, withCredentials: true });
      const all = res.data || [];
      const counts = {};
      all.forEach((p) => { counts[p.user_id] = (counts[p.user_id] || 0) + 1; });
      return counts;
    } catch (e) {
      return {};
    }
  };

  const [counts, setCounts] = useState({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await fetchProfileCounts();
      if (mounted) setCounts(c);
    })();
    return () => { mounted = false; };
  }, [subs]);

  return (
    <div className="min-h-screen bg-[#0f1113] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Filiales</h2>
          <Button onClick={() => navigate('/dashboard')} variant="ghost">Retour</Button>
        </div>

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
