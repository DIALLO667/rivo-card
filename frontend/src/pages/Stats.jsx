import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, TrendingDown, Users, Eye, MousePointerClick, AlertTriangle, Trophy, Clock, MapPin, X } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || '';

const LINK_LABELS = {
  call: 'Appel', email: 'E-mail', whatsapp: 'WhatsApp', website: 'Site web',
  location: 'Adresse / Maps', linkedin: 'LinkedIn', instagram: 'Instagram',
  facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter',
  telegram: 'Telegram', snapchat: 'Snapchat',
};

function fmtDate(iso) {
  if (!iso) return 'jamais';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch (e) { return iso; }
}

function Delta({ pct }) {
  if (pct === null || pct === undefined) return <span className="text-gray-400 text-xs">—</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      <Icon className="h-3.5 w-3.5" />{up ? '+' : ''}{pct}%
    </span>
  );
}

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
        <Icon className="h-4 w-4" />{label}
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      {sub !== undefined && <div className="mt-1">{sub}</div>}
    </div>
  );
}

function Bars({ data, labelKey, valueKey, max, unit = '' }) {
  const top = max || Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <div className="w-28 shrink-0 text-gray-600 truncate">{d[labelKey]}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(d[valueKey] / top) * 100}%` }} />
          </div>
          <div className="w-12 shrink-0 text-right font-semibold text-gray-900">{d[valueKey]}{unit}</div>
        </div>
      ))}
    </div>
  );
}

export default function Stats() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [scopeAll, setScopeAll] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` },
        params: scopeAll ? { scope: 'all' } : {},
        withCredentials: true,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [scopeAll]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const openDetail = async (profileId) => {
    setDetail({ loading: true });
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/profiles/${profileId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setDetail(res.data);
    } catch (err) {
      toast.error('Impossible de charger le détail de ce profil');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const navItems = [
    { label: 'Tableau de Bord', path: '/dashboard' },
    { label: 'Statistiques', path: '/stats', active: true },
    { label: 'Commandes', path: '/orders' },
    { label: 'Gestion des Filiales', path: '/subaccounts' },
    { label: 'Gestion des Liens', path: '/links' },
  ];

  return (
    <div className="flex min-h-screen">
      <Helmet><title>Statistiques | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>

      <aside className={`${sidebarCollapsed ? 'md:w-20' : 'md:w-56'} hidden md:flex fixed left-0 top-0 bottom-0 bg-[#0B1220] text-white flex-col justify-between transition-width duration-200 shadow-xl`}>
        <div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="text-white font-extrabold text-sm">{sidebarCollapsed ? 'RC' : 'RIVO-CARD'}<span className={`${sidebarCollapsed ? 'hidden' : 'ml-1 text-blue-500'}`}> ADMIN</span></div>
            <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} className="p-2 rounded hover:bg-white/10">
              <svg className={`h-4 w-4 transform ${sidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <nav className="mt-6 px-2">
            <ul className="space-y-3">
              {navItems.map((it) => (
                <li key={it.path} onClick={() => navigate(it.path)} className={`px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5 ${it.active ? 'bg-white/5' : ''}`}>
                  <span className={`w-3 h-3 rounded-full ${it.active ? 'ring-2 ring-blue-500' : 'bg-transparent'}`} />
                  <span className="font-medium text-sm tracking-wide">{!sidebarCollapsed && it.label}</span>
                </li>
              ))}
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
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0B1220] text-white flex flex-col shadow-xl p-4">
            <div className="px-2 py-4 flex items-center justify-between">
              <div className="text-white font-extrabold">RIVO-CARD <span className="ml-1 text-blue-500">ADMIN</span></div>
              <button onClick={() => setMobileSidebarVisible(false)} className="p-2 rounded hover:bg-white/10">✕</button>
            </div>
            <nav className="mt-6 px-2">
              <ul className="space-y-3">
                {navItems.map((it) => (
                  <li key={it.path} className={`px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-white/5 ${it.active ? 'bg-white/5' : ''}`} onClick={() => { setMobileSidebarVisible(false); navigate(it.path); }}>{it.label}</li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <main className={`flex-1 ${sidebarCollapsed ? 'md:ml-20 ml-0' : 'md:ml-56 ml-0'} bg-gray-50 min-h-screen p-4 md:p-10 transition-margin duration-200`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setMobileSidebarVisible(true)} aria-label="Ouvrir le menu">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Statistiques</h1>
                <p className="text-xs text-gray-500">Scans des cartes sur les 30 derniers jours</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={scopeAll} onChange={(e) => setScopeAll(e.target.checked)} />
              Inclure les filiales
            </label>
          </div>

          {loading || !data ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <div className="space-y-6">
              {/* Alertes d'inactivité */}
              {data.inactive?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                    <AlertTriangle className="h-4 w-4" /> Commerciaux sans scan depuis 7 jours ou plus
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.inactive.map((p) => (
                      <button key={p.profile_id} onClick={() => openDetail(p.profile_id)} className="text-xs bg-white border border-amber-200 rounded-full px-3 py-1.5 text-amber-900 hover:bg-amber-100">
                        {p.name} · {p.days_since === null ? 'aucun scan' : `${p.days_since} j`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi icon={Eye} label="Scans (30 j)" value={data.total_scans} />
                <Kpi icon={Users} label="Visiteurs (30 j)" value={data.visiteurs} />
                <Kpi icon={TrendingUp} label="Cette semaine" value={data.this_week} sub={<Delta pct={data.delta_pct} />} />
                <Kpi icon={MousePointerClick} label="Taux de conversion" value={`${data.conversion_rate}%`} sub={<span className="text-xs text-gray-400">{data.conversions} contacts enregistrés</span>} />
              </div>

              {/* Scans par jour */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Scans par jour</h2>
                <div className="flex items-end gap-1 h-32">
                  {data.by_day.map((d, i) => {
                    const top = Math.max(1, ...data.by_day.map((x) => x.scans));
                    return (
                      <div key={i} className="flex-1 group relative flex flex-col justify-end">
                        <div className="bg-blue-600/80 group-hover:bg-blue-600 rounded-t" style={{ height: `${(d.scans / top) * 100}%`, minHeight: d.scans ? 3 : 0 }} title={`${d.date} : ${d.scans}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>{data.by_day[0]?.date}</span>
                  <span>{data.by_day[data.by_day.length - 1]?.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Classement */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Classement des commerciaux</h2>
                  {data.leaderboard?.length ? (
                    <div className="divide-y divide-gray-100">
                      {data.leaderboard.map((row, i) => (
                        <button key={row.profile_id} onClick={() => openDetail(row.profile_id)} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded-lg px-1">
                          <span className="w-5 text-center font-black text-gray-400 text-sm">{i + 1}</span>
                          {row.photo_url ? (
                            <img src={row.photo_url} alt={row.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{(row.name || 'U').charAt(0)}</div>}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{row.name}</div>
                            <div className="text-[11px] text-gray-400">dernier : {fmtDate(row.last_scan_at)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-gray-900">{row.scans}</div>
                            <div className="text-[11px] text-gray-400">
                              sem. {row.this_week} <span className="text-gray-300">/</span> {row.last_week}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400 py-6 text-center">Aucun scan sur la période</p>}
                </div>

                {/* Liens cliqués */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Liens les plus cliqués</h2>
                  {data.links?.length ? (
                    <Bars data={data.links.map((l) => ({ label: LINK_LABELS[l.type] || l.type, count: l.count }))} labelKey="label" valueKey="count" />
                  ) : <p className="text-sm text-gray-400 py-6 text-center">Aucun clic enregistré pour le moment</p>}

                  <h2 className="font-bold text-gray-900 mt-6 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><MapPin className="h-4 w-4" /> Zones (top)</h2>
                  {data.top_zones?.length ? (
                    <Bars data={data.top_zones.map((z) => ({ label: z.zone, scans: z.scans }))} labelKey="label" valueKey="scans" />
                  ) : <p className="text-sm text-gray-400 py-4 text-center">—</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Détail par profil */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{detail?.profile?.name || 'Détail'}</h2>
              <button onClick={() => setDetail(null)} className="p-2 rounded-md hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            {detailLoading || detail.loading ? (
              <div className="py-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <Kpi icon={Eye} label="Scans" value={detail.total_scans} />
                  <Kpi icon={Users} label="Visiteurs" value={detail.visiteurs} />
                  <Kpi icon={MousePointerClick} label="Conversion" value={`${detail.conversion_rate}%`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><Clock className="h-4 w-4" /> Par heure</h3>
                  <div className="flex items-end gap-0.5 h-24">
                    {detail.by_hour.map((h) => {
                      const top = Math.max(1, ...detail.by_hour.map((x) => x.scans));
                      return <div key={h.hour} className="flex-1 flex flex-col justify-end" title={`${h.hour}h : ${h.scans}`}>
                        <div className="bg-blue-600/80 rounded-t" style={{ height: `${(h.scans / top) * 100}%`, minHeight: h.scans ? 3 : 0 }} />
                      </div>;
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0h</span><span>12h</span><span>23h</span></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><MapPin className="h-4 w-4" /> Par zone</h3>
                  {detail.by_zone?.length ? (
                    <Bars data={detail.by_zone.slice(0, 8).map((z) => ({ label: z.zone, scans: z.scans }))} labelKey="label" valueKey="scans" />
                  ) : <p className="text-sm text-gray-400">Aucune donnée</p>}
                </div>
                {detail.links?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Liens cliqués</h3>
                    <Bars data={detail.links.map((l) => ({ label: LINK_LABELS[l.type] || l.type, count: l.count }))} labelKey="label" valueKey="count" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
