import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link2, Copy, Plus } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || '';

export default function LinkManagement() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subaccounts, setSubaccounts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const fetchLinks = useCallback(async (scopeAll = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = scopeAll ? { scope: 'all' } : {};
      const res = await axios.get(`${API}/activation_tokens`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        withCredentials: true,
      });
      setLinks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les liens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const meRes = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCurrentUser(meRes.data);
        let subs = [];
        if (meRes.data?.role === 'owner' || meRes.data?.role === 'admin') {
          try {
            const subsRes = await axios.get(`${API}/users`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });
            subs = subsRes.data?.subaccounts || [];
            setSubaccounts(subs);
          } catch (e) {
            setSubaccounts([]);
          }
        }
        const isOwner = meRes.data?.role === 'owner' || meRes.data?.role === 'admin';
        await fetchLinks(isOwner);
        if (isOwner) setShowAll(true);
      } catch (e) {
        navigate('/login');
      }
    })();
  }, [fetchLinks, navigate]);

  const generateLink = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/activation_tokens/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const url = res.data?.url;
      if (!url) throw new Error('Aucune URL reçue');
      await navigator.clipboard.writeText(url);
      toast.success('Lien généré et copié dans le presse-papier');
      await fetchLinks(showAll);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié');
    } catch (e) {
      toast.error('Impossible de copier');
    }
  };

  const creatorName = (userId) => {
    if (currentUser?.user_id === userId) return 'Moi';
    const sub = subaccounts.find((s) => s.user_id === userId);
    return sub?.name || userId;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  return (
    <div className="flex min-h-screen">
      <aside className={`${sidebarCollapsed ? 'md:w-20' : 'md:w-56'} hidden md:flex fixed left-0 top-0 bottom-0 bg-[#050608] text-white flex-col justify-between transition-width duration-200 shadow-xl`}>
        <div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="text-white font-extrabold text-sm">
                {sidebarCollapsed ? 'RC' : 'RIVO-CARD'}
                <span className={`${sidebarCollapsed ? 'hidden' : 'ml-1 text-[#D4AF37]'}`}> ADMIN</span>
              </div>
            </div>
            <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} className="p-2 rounded hover:bg-white/10">
              <svg className={`h-4 w-4 transform ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
          <nav className="mt-6 px-2">
            <ul className="space-y-3">
              <li onClick={() => navigate('/dashboard')} className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Tableau de Bord'}</span>
              </li>
              <li onClick={() => navigate('/subaccounts')} className="px-3 py-3 rounded-lg flex items-center gap-3 hover:bg-white/5 cursor-pointer">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Filiales'}</span>
              </li>
              <li className="px-3 py-3 rounded-lg flex items-center gap-3 bg-white/5">
                <span className={`w-3 h-3 rounded-full ${sidebarCollapsed ? 'mx-auto' : ''} ring-2 ring-blue-500`} />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Gestion des Liens'}</span>
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

      <main className={`flex-1 ${sidebarCollapsed ? 'md:ml-20 ml-0' : 'md:ml-56 ml-0'} bg-gray-50 min-h-screen p-4 md:p-10`}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Link2 className="h-6 w-6 text-[#D4AF37]" /> Gestion des Liens
                </h1>
                <p className="text-sm text-gray-500 mt-1">Liens d'activation générés — usage unique pour créer un profil</p>
              </div>
              <div className="flex items-center gap-3">
                {isOwner && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showAll}
                      onChange={(e) => { setShowAll(e.target.checked); fetchLinks(e.target.checked); }}
                    />
                    Inclure les filiales
                  </label>
                )}
                <Button onClick={generateLink} disabled={generating} className="bg-[#D4AF37] text-black font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  {generating ? 'Génération...' : 'Générer un lien'}
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
            </div>
          ) : links.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucun lien généré pour le moment</p>
              <Button onClick={generateLink} className="mt-4 bg-[#D4AF37] text-black">Générer votre premier lien</Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Lien</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Créé le</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                      {isOwner && showAll && (
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Créé par</th>
                      )}
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.token} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 max-w-xs">
                          <span className="text-gray-700 truncate block" title={link.url}>
                            {link.url}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(link.created_at)}</td>
                        <td className="px-4 py-3">
                          {link.used ? (
                            <Badge className="bg-gray-200 text-gray-700">
                              Utilisé{link.used_at ? ` le ${formatDate(link.used_at)}` : ''}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700">Disponible</Badge>
                          )}
                        </td>
                        {isOwner && showAll && (
                          <td className="px-4 py-3 text-gray-600">{creatorName(link.creator_user_id)}</td>
                        )}
                        <td className="px-4 py-3 text-right">
                          {!link.used && (
                            <Button size="sm" variant="ghost" onClick={() => copyLink(link.url)} title="Copier">
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
