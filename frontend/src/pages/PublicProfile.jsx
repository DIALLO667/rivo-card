import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Phone, Globe, Mail, Instagram, Facebook, Linkedin,Youtube,Twitter, ShieldAlert, MapPin, Send, CreditCard } from 'lucide-react';
import TemplateQuietLuxury from '@/components/templates/TemplateQuietLuxury';
import TemplateCleanLinks from '@/components/templates/TemplateCleanLinks';
import TemplateCustomizable from '@/components/templates/TemplateCustomizable';
import { normalizeUrl } from '@/lib/urlUtils';
import CVView from '@/components/templates/CVView';

const API = process.env.REACT_APP_API_URL;

// Fuseau horaire du navigateur -> sert de "zone" côté stats (aucune pop-up).
function browserTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
}

// Envoi "fire and forget" d'un événement de suivi. text/plain => pas de préflight
// CORS ; le backend lit le corps quel que soit le Content-Type.
function sendHit(url, data) {
  try {
    const body = JSON.stringify(data || {});
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
    } else {
      fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  } catch (e) { /* noop */ }
}

// Devine le type de lien cliqué à partir de l'élément (fonctionne pour tous les
// templates sans les modifier). null = clic non pertinent.
function classifyClick(target) {
  const el = target && target.closest ? target.closest('a,button') : null;
  if (!el) return null;
  const href = (el.getAttribute('href') || '').toLowerCase();
  const label = ((el.textContent || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
  if (href.startsWith('tel:')) return 'call';
  if (href.startsWith('mailto:')) return 'email';
  if (/wa\.me|whatsapp/.test(href)) return 'whatsapp';
  if (/linkedin\./.test(href)) return 'linkedin';
  if (/instagram\./.test(href)) return 'instagram';
  if (/facebook\.|fb\.me/.test(href)) return 'facebook';
  if (/tiktok\./.test(href)) return 'tiktok';
  if (/youtube\.|youtu\.be/.test(href)) return 'youtube';
  if (/twitter\.|x\.com/.test(href)) return 'twitter';
  if (/t\.me\/|telegram\./.test(href)) return 'telegram';
  if (/snapchat\./.test(href)) return 'snapchat';
  if (/maps\.app|google\.[a-z.]+\/maps|maps\.google/.test(href)) return 'location';
  if (/enregistrer|save.?contact|\.vcf|t[eé]l[eé]charger|\bpdf\b/.test(label)) return 'save_contact';
  if (el.tagName === 'A' && /^https?:/.test(href)) return 'website';
  return null;
}

const TikTokIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.73 8.73 0 01-1.89-1.42l-.01 7.41c.02 1.34-.17 2.72-.73 3.94-.62 1.39-1.68 2.62-3.04 3.36-1.39.78-3.04 1.12-4.63 1.01-1.61-.08-3.23-.62-4.54-1.6-1.37-1-2.4-2.47-2.85-4.08-.48-1.65-.36-3.48.35-5.06.63-1.45 1.73-2.73 3.12-3.49 1.43-.8 3.14-1.15 4.75-1.01.01 1.41.01 2.82.01 4.23-1.03-.22-2.16-.14-3.1.34-.84.41-1.52 1.17-1.81 2.06-.32.93-.24 2 .24 2.87.41.77 1.15 1.38 2.01 1.62.88.26 1.86.19 2.69-.21.78-.36 1.41-1.04 1.74-1.83.24-.59.32-1.23.31-1.87L12.52.02z"/>
  </svg>
);

export default function PublicProfile() {
  const { uniqueLink } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const scanSentRef = useRef(false);

  useEffect(() => {
    if (uniqueLink) {
      axios.get(`${API}/profiles/public/${uniqueLink}`)
        .then(res => {
          const p = res.data || {};
          // Normalize common social URLs so templates can safely use them
          const normalized = { ...p };
          ['instagram','linkedin','facebook','tiktok','telegram','youtube','twitter','snapchat','website'].forEach(k => {
            if (p[k]) normalized[k] = normalizeUrl(p[k]);
          });
          setProfile(normalized);
          setLoading(false);

          // Enregistre le scan une seule fois. Garde-fou 30 min via sessionStorage
          // pour ne pas regonfler le compteur sur un simple rechargement.
          if (!p.is_archived && !scanSentRef.current) {
            scanSentRef.current = true;
            try {
              const key = `rivo_scan_${uniqueLink}`;
              const last = Number(sessionStorage.getItem(key) || 0);
              if (Date.now() - last > 30 * 60 * 1000) {
                sessionStorage.setItem(key, String(Date.now()));
                sendHit(`${API}/profiles/public/${uniqueLink}/scan`, {
                  tz: browserTz(),
                  referrer: document.referrer || '',
                });
              }
            } catch (e) {
              sendHit(`${API}/profiles/public/${uniqueLink}/scan`, { tz: browserTz(), referrer: document.referrer || '' });
            }
          }
        })
        .catch(() => setLoading(false));
    }
  }, [uniqueLink]);

  // Suivi des clics sur les liens de la carte (tous templates), en capture.
  useEffect(() => {
    if (!uniqueLink) return;
    const onClick = (e) => {
      const type = classifyClick(e.target);
      if (type) sendHit(`${API}/profiles/public/${uniqueLink}/event`, { type, tz: browserTz() });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [uniqueLink]);

  // Micro-interactions : petite onde au tap sur un bouton/lien + pulsation
  // discrète au focus d'un champ. Sans dépendance, fonctionne sur tous les
  // templates (clairs comme sombres) et respecte prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes rivo-tap { from { transform: scale(.35); opacity: .85 } to { transform: scale(4.6); opacity: 0 } }
      .rivo-tap { position: fixed; z-index: 99999; width: 22px; height: 22px; margin: -11px 0 0 -11px;
        border-radius: 9999px; border: 2px solid rgba(150,150,150,.55); pointer-events: none;
        animation: rivo-tap 480ms cubic-bezier(.22,.61,.36,1) forwards; will-change: transform, opacity; }
      /* propriété 'scale' (et non 'transform') pour composer avec un éventuel translate */
      @keyframes rivo-press { 50% { scale: .94 } }
      .rivo-press { animation: rivo-press 180ms ease-out; }
      @keyframes rivo-field { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,.45) } 100% { box-shadow: 0 0 0 6px rgba(99,102,241,0) } }
      .rivo-field { animation: rivo-field 500ms ease-out; border-radius: 12px; }
    `;
    document.head.appendChild(style);

    const onDown = (e) => {
      const el = e.target && e.target.closest ? e.target.closest('a,button,[role="button"]') : null;
      const p = e.touches ? e.touches[0] : e;
      if (p && typeof p.clientX === 'number') {
        const ring = document.createElement('span');
        ring.className = 'rivo-tap';
        ring.style.left = p.clientX + 'px';
        ring.style.top = p.clientY + 'px';
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 520);
      }
      if (el) {
        el.classList.remove('rivo-press');
        // reflow pour rejouer l'animation si on re-clique vite
        void el.offsetWidth;
        el.classList.add('rivo-press');
        setTimeout(() => el.classList.remove('rivo-press'), 220);
      }
    };
    const onFocusIn = (e) => {
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) {
        t.classList.add('rivo-field');
        setTimeout(() => t.classList.remove('rivo-field'), 520);
      }
    };

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      style.remove();
    };
  }, []);

  const noIndexTag = <Helmet><title>Profil digital | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>;

  if (loading) return <>{noIndexTag}<div className="h-screen bg-[#0a0a0b] flex items-center justify-center text-white italic tracking-widest uppercase text-xs">Rivo...</div></>;
  if (!profile) return <>{noIndexTag}<div className="h-screen bg-[#0a0a0b] flex items-center justify-center text-white italic">Profil introuvable</div></>;

  if (profile.is_archived) {
    return (
      <>
      {noIndexTag}
      <div className="h-screen w-full bg-[#0a0a0b] flex justify-center items-center p-6 font-sans">
        <div className="w-full max-w-[400px] bg-gradient-to-b from-[#1a1c1e] to-[#0a0a0b] border border-red-500/20 rounded-[3rem] p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-red-500/10 rounded-full">
              <ShieldAlert size={50} className="text-red-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Profil Suspendu</h1>
          <p className="text-gray-400 text-sm mb-10 px-4">
            Ce profil <span className="text-white font-bold">Rivo Card</span> est actuellement désactivé.
          </p>
          <p className="text-[10px] text-gray-600 font-black tracking-[0.5em] uppercase">Rivo Card Premium</p>
        </div>
      </div>
      </>
    );
  }

  const socialIcons = [
    { id: 'instagram', icon: <Instagram size={28} />, color: '#E4405F', url: profile.instagram },
    { id: 'linkedin', icon: <Linkedin size={28} />, color: '#0A66C2', url: profile.linkedin },
    { id: 'facebook', icon: <Facebook size={28} />, color: '#1877F2', url: profile.facebook },
    { id: 'tiktok', icon: <TikTokIcon size={28} />, color: '#FFFFFF', url: profile.tiktok },
    { id: 'telegram', icon: <Send size={28} />, color: '#0088cc', url: profile.telegram }, 
    { id: 'youtube', icon: <Youtube size={28} />, color: '#FF0000', url: profile.youtube },
    { id: 'twitter', icon: <Twitter size={28} />, color: '#1DA1F2', url: profile.twitter },
    { 
      id: 'snapchat', 
      icon: (
        <img 
          src="https://cdn.simpleicons.org/snapchat" 
          alt="Snapchat" 
          className="w-7 h-7"
          style={{ 
            filter: profile.design_type === 'modern' 
              ? 'none' 
              : 'sepia(1) saturate(5) hue-rotate(10deg) brightness(0.9)' 
          }} 
        />
      ), 
      color: '#FFFC00', 
      url: profile.snapchat 
    }
  ];

  // Render based on card_type and template_id
  const renderByType = () => {
    if (profile.card_type === 'cv') {
      const downloadUrl = `${API}/profiles/public/${profile.unique_link}/cv`;
      return <CVView profile={profile} downloadUrl={downloadUrl} />;
    }
    // profile card
    if (profile.template_id === 'template2') {
      return <TemplateCleanLinks profile={profile} />;
    }
    // use customizable template for legacy 'perso' id or new customizable id
    if (profile.template_id === 'template_customizable' || profile.template_id === 'perso') {
      return <TemplateCustomizable profile={profile} />;
    }
    return <TemplateQuietLuxury profile={profile} />;
  };

  return (
    <>
      {noIndexTag}
      <div className="h-screen w-full bg-[#0a0a0b] flex justify-center items-center overflow-hidden font-sans">
        {renderByType()}
      </div>
      <OrderYourOwn />
    </>
  );
}

// Étiquette flottante discrète en haut à gauche : permet à quiconque consulte
// un profil de commander sa propre Rivo Card. Coin haut-gauche = zone libre sur
// tous les templates (les CTA et boutons flottants sont ailleurs).
function OrderYourOwn() {
  return (
    <a
      href="/commander"
      title="Commander ma Rivo Card"
      className="fixed left-3 top-3 z-[60] inline-flex items-center gap-1.5 rounded-lg
                 border border-white/15 bg-black/45 py-1.5 pl-2 pr-2.5 text-white shadow-lg
                 backdrop-blur-md text-[11px] font-semibold tracking-wide
                 transition-colors hover:bg-black/70"
    >
      <span className="grid h-4 w-4 place-items-center rounded bg-white/15">
        <CreditCard className="h-3 w-3" />
      </span>
      Commander
    </a>
  );
}