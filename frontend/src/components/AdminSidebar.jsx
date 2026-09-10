import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';

const API = process.env.REACT_APP_API_URL || '';

// Menu unique partagé par toutes les pages de l'espace admin.
// Un seul endroit à modifier pour ajouter/retirer une entrée.
const NAV_ITEMS = [
  { label: 'Tableau de Bord', path: '/dashboard' },
  { label: 'Statistiques', path: '/stats' },
  { label: 'Commandes', path: '/orders', badge: 'orders' },
  { label: 'Gestion des Filiales', path: '/subaccounts' },
  { label: 'Gestion des Liens', path: '/links' },
];

// Compteur de commandes en attente, rafraîchi quand on change de page.
function usePendingOrders() {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (!cancelled) {
          setCount((res.data || []).filter((o) => o.status === 'en_attente').length);
        }
      } catch {
        /* silencieux : le badge disparaît simplement */
      }
    })();
    return () => { cancelled = true; };
  }, [pathname]);
  return count;
}

export default function AdminSidebar({ collapsed = false, onToggleCollapse, mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingOrders = usePendingOrders();

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  // `compact` = version repliée (icône seule). Toujours false dans le tiroir mobile.
  const renderItems = (compact) =>
    NAV_ITEMS.map((it) => {
      const active = isActive(it.path);
      const badgeValue = it.badge === 'orders' && pendingOrders > 0 ? pendingOrders : null;
      return (
        <li
          key={it.path}
          onClick={() => { onCloseMobile?.(); navigate(it.path); }}
          className={`px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5 ${active ? 'bg-white/5' : ''}`}
        >
          <span className={`w-3 h-3 rounded-full shrink-0 ${compact ? 'mx-auto' : ''} ${active ? 'ring-2 ring-blue-500' : 'bg-transparent'}`} />
          {!compact && <span className="font-medium text-sm tracking-wide">{it.label}</span>}
          {!compact && badgeValue != null && (
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
              {badgeValue}
            </span>
          )}
        </li>
      );
    });

  return (
    <>
      {/* Sidebar desktop */}
      <aside className={`${collapsed ? 'md:w-20' : 'md:w-56'} hidden md:flex fixed left-0 top-0 bottom-0 bg-[#0B1220] text-white flex-col justify-between transition-width duration-200 shadow-xl z-30`}>
        <div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="text-white font-extrabold text-sm">
                {collapsed ? 'RC' : 'RIVO-CARD'}
                <span className={`${collapsed ? 'hidden' : 'ml-1 text-blue-500'}`}> ADMIN</span>
              </div>
            </div>
            {onToggleCollapse && (
              <button
                title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
                aria-label="Toggle sidebar"
                onClick={onToggleCollapse}
                className="p-2 rounded hover:bg-white/10"
              >
                <svg className={`h-4 w-4 transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" /></svg>
              </button>
            )}
          </div>
          <nav className="mt-6 px-2">
            <ul className="space-y-3">{renderItems(collapsed)}</ul>
          </nav>
        </div>
        <div className="px-4 py-6">
          <div className="border-t border-white/10 pt-4">
            <Button onClick={logout} variant="ghost" className="w-full text-white hover:bg-white/10">Déconnexion</Button>
          </div>
        </div>
      </aside>

      {/* Tiroir mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0B1220] text-white flex flex-col justify-between shadow-xl p-4">
            <div>
              <div className="px-2 py-4 flex items-center justify-between">
                <div className="text-white font-extrabold">RIVO-CARD <span className="ml-1 text-blue-500">ADMIN</span></div>
                <button title="Fermer le menu" onClick={onCloseMobile} className="p-2 rounded hover:bg-white/10">✕</button>
              </div>
              <nav className="mt-6 px-2">
                <ul className="space-y-3">{renderItems(false)}</ul>
              </nav>
            </div>
            <div className="px-4 py-6">
              <div className="border-t border-white/10 pt-4">
                <Button onClick={logout} variant="ghost" className="w-full text-white hover:bg-white/10">Déconnexion</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
