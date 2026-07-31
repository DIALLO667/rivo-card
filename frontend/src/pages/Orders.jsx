import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, CheckCircle2, Trash2, Phone, Mail, Building2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const API = process.env.REACT_APP_API_URL || '';

const OFFER_LABELS = {
  medium: 'Carte Medium',
  premium: 'Carte Premium',
  'pme-starter': 'PME Pack Starter',
  'pme-business': 'PME Pack Business',
  'pme-premium': 'PME Pack Premium',
  autre: 'Autre',
};

const COUNTRY_LABELS = {
  senegal: 'Sénégal',
  'burkina-faso': 'Burkina Faso',
  autre: 'Autre pays',
};

export default function Orders() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('en_attente');
  const [validatingId, setValidatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const iv = setInterval(fetchOrders, 15000);
    return () => clearInterval(iv);
  }, []);

  const validateOrder = async (orderId) => {
    setValidatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/orders/${orderId}/validate`, {}, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Commande validée, le profil a été créé');
      await fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la validation');
    } finally {
      setValidatingId(null);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      toast.success('Commande supprimée');
      await fetchOrders();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filtered = orders.filter((o) => filterStatus === 'all' || o.status === filterStatus);
  const pendingCount = orders.filter((o) => o.status === 'en_attente').length;
  const validatedCount = orders.filter((o) => o.status === 'valide').length;

  return (
    <div className="flex min-h-screen">
      <Helmet><title>Commandes | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <aside className={`${sidebarCollapsed ? 'md:w-20' : 'md:w-56'} hidden md:flex fixed left-0 top-0 bottom-0 bg-[#0B1220] text-white flex-col justify-between transition-width duration-200 shadow-xl`}>
        <div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="text-white font-extrabold text-sm">{sidebarCollapsed ? 'RC' : 'RIVO-CARD'}<span className={`${sidebarCollapsed ? 'hidden' : 'ml-1 text-blue-600'}`}> ADMIN</span></div>
            </div>
            <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} className="p-2 rounded hover:bg-white/10">
              <svg className={`h-4 w-4 transform ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <nav className="mt-6 px-2">
            <ul className="space-y-3">
              <li onClick={() => navigate('/dashboard')} className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5">
                <span className="w-3 h-3 rounded-full bg-transparent" />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Tableau de Bord'}</span>
              </li>
              <li onClick={() => navigate('/orders')} className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5 bg-white/5">
                <span className={`w-3 h-3 rounded-full ${sidebarCollapsed ? 'mx-auto' : ''} ring-2 ring-blue-600`} />
                <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && 'Commandes'}</span>
                {!sidebarCollapsed && pendingCount > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">{pendingCount}</span>
                )}
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

      {mobileSidebarVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarVisible(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0B1220] text-white flex flex-col justify-between shadow-xl p-4">
            <div>
              <div className="px-2 py-4 flex items-center justify-between">
                <div className="text-white font-extrabold">RIVO-CARD <span className="ml-1 text-blue-600">ADMIN</span></div>
                <button onClick={() => setMobileSidebarVisible(false)} className="p-2 rounded hover:bg-white/10">✕</button>
              </div>
              <nav className="mt-6 px-2">
                <ul className="space-y-3">
                  <li className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5" onClick={() => { setMobileSidebarVisible(false); navigate('/dashboard'); }}>Tableau de Bord</li>
                  <li className="px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 bg-white/5" onClick={() => setMobileSidebarVisible(false)}>Commandes</li>
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setMobileSidebarVisible(true)} aria-label="Ouvrir le menu">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Commandes</h1>
                <p className="text-xs text-gray-500">Demandes reçues depuis le site</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button onClick={() => setFilterStatus('en_attente')} className={filterStatus === 'en_attente' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}>En attente ({pendingCount})</Button>
            <Button onClick={() => setFilterStatus('valide')} className={filterStatus === 'valide' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}>Validées ({validatedCount})</Button>
            <Button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'}>Toutes ({orders.length})</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucune commande pour ce filtre</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.order_id} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  {order.photo_url && (
                    <img
                      src={order.photo_url}
                      alt={order.name}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{order.name}</h3>
                      {order.status === 'valide' ? (
                        <Badge className="bg-emerald-600 text-white">Validée</Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white">En attente</Badge>
                      )}
                      {order.country && (
                        <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {COUNTRY_LABELS[order.country] || order.country}
                        </span>
                      )}
                      {order.offer && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {OFFER_LABELS[order.offer] || order.offer}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                      <a href={`https://wa.me/${(order.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                        <Phone className="h-3.5 w-3.5" /> {order.phone}
                      </a>
                      {order.email && (
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {order.email}</span>
                      )}
                      {order.company && (
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {order.company}</span>
                      )}
                    </div>
                    {order.message && <p className="text-sm text-gray-500 mt-2 italic">&laquo; {order.message} &raquo;</p>}
                    <p className="text-xs text-gray-400 mt-2">Reçue le {new Date(order.created_at).toLocaleDateString()} à {new Date(order.created_at).toLocaleTimeString().slice(0, 5)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.status !== 'valide' && (
                      <Button onClick={() => validateOrder(order.order_id)} disabled={validatingId === order.order_id} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> {validatingId === order.order_id ? 'Validation...' : 'Valider le paiement'}
                      </Button>
                    )}
                    <button title="Supprimer" onClick={() => removeOrder(order.order_id)} className="p-2.5 bg-red-50 text-red-600 border border-red-100 rounded-md hover:shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
