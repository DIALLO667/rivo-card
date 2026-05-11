import React, { useState, useEffect } from 'react';
import { makeVCard, normalizeUrl } from '@/lib/urlUtils';
import { FaSave, FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe, FaInstagram, FaLinkedin, FaFacebook, FaYoutube, FaTwitter } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';

// Minimal, self-contained customizable template inspired by TemplateQuietLuxury.
// - Accepts `profile` prop.
// - Reads initial colors from profile fields (bg_color, button_color, icon_color, font_choice, icon_style) when present.
// - Provides UI controls to change background color, button color, icon color, font, and icon/button style.
// - Saves preferences to localStorage under key `rivo:prefs:<unique_link>` when "Enregistrer" is clicked.
// - Applies choices live without backend calls.

export default function TemplateCustomizable({ profile, onChange: onFormChange = null, editable = true, useLocalStorage = true }) {
  const key = (profile?.unique_link && useLocalStorage) ? `rivo:prefs:${profile.unique_link}` : null;

  const defaults = {
    bg: profile?.bg_color || '#0a0a0b',
    button: profile?.button_color || '#f5c27a',
    icon: profile?.icon_color || '#f5c27a',
    font: profile?.font_choice || 'sans', // 'sans' | 'serif'
    iconStyle: profile?.icon_style || 'default', // 'default' | 'rounded'
  };

  const [prefs, setPrefs] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setPrefs(prev => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch (e) { /* ignore */ }
  }, [key]);

  useEffect(() => {
    // update if profile changes (e.g., first render)
    setPrefs(prev => ({ ...defaults, ...prev }));
    // notify parent form of initial values
    if (onFormChange) {
      onFormChange({
        bg_color: defaults.bg,
        button_color: defaults.button,
        icon_color: defaults.icon,
        font_choice: defaults.font,
        icon_style: defaults.iconStyle,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.unique_link]);

  const persistLocal = (newPrefs) => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(newPrefs));
    } catch (e) { /* ignore */ }
  };

  const save = () => {
    if (useLocalStorage) persistLocal(prefs);
    setSaved(true);
    if (onFormChange) {
      onFormChange({
        bg_color: prefs.bg,
        button_color: prefs.button,
        icon_color: prefs.icon,
        font_choice: prefs.font,
        icon_style: prefs.iconStyle,
      });
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePrefs = (patch) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      // live notify parent form
      if (onFormChange) {
        onFormChange({
          bg_color: next.bg,
          button_color: next.button,
          icon_color: next.icon,
          font_choice: next.font,
          icon_style: next.iconStyle,
        });
      }
      return next;
    });
  };

  // helper: determine if hex color is light => choose dark text, else white
  const isHexLight = (hex) => {
    try {
      const h = hex.replace('#','');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      // relative luminance approximation
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum > 0.6;
    } catch (e) {
      return false;
    }
  };

  // small set of color presets for quick selection
  const colorPresets = ['#0a0a0b', '#ffffff', '#f5c27a', '#ff4757', '#4ade80', '#60a5fa', '#7c3aed', '#f97316'];

  const socialList = [
    { id: 'instagram', url: profile.instagram, icon: <FaInstagram size={20} />, label: 'Instagram' },
    { id: 'linkedin', url: profile.linkedin, icon: <FaLinkedin size={20} />, label: 'LinkedIn' },
    { id: 'facebook', url: profile.facebook, icon: <FaFacebook size={20} />, label: 'Facebook' },
    { id: 'youtube', url: profile.youtube, icon: <FaYoutube size={20} />, label: 'YouTube' },
    { id: 'twitter', url: profile.twitter, icon: <FaTwitter size={20} />, label: 'Twitter' },
    { id: 'telegram', url: profile.telegram, icon: <FaTelegramPlane size={20} />, label: 'Telegram' },
    { id: 'website', url: profile.website, icon: <FaGlobe size={20} />, label: 'Site' },
    // ... add other networks as needed
  ].filter(s => s.url);

  const fontClass = prefs.font === 'serif' ? 'font-serif' : 'font-sans';
  const buttonTextColor = isHexLight(prefs.button) ? '#0b0b0b' : '#ffffff';

  const name = profile?.name || 'Utilisateur';
  const job = profile?.job || '';
  const company = profile?.company || '';
  const photo = profile?.photo_url || profile?.avatar || 'https://via.placeholder.com/150';

  const telHref = profile?.phone ? `tel:${String(profile.phone).replace(/\s+/g, '')}` : null;
  const mailHref = profile?.email ? `mailto:${profile.email}` : null;
  const websiteHref = profile?.website && profile.website !== 'https://' ? normalizeUrl(profile.website) : null;

  const downloadVCard = () => {
    const vcard = makeVCard({ name, phone: profile?.phone || '', email: profile?.email || '' });
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col items-center relative overflow-x-hidden min-h-screen" style={{ background: prefs.bg }}>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />

      <div className="w-full px-6 flex justify-between items-center z-50 pt-16 pb-4">
        <div className="w-8" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border" style={{ borderColor: prefs.button, color: prefs.button }}>
            <div className="text-[10px] font-bold" style={{ color: prefs.button }}>R</div>
          </div>
          <div className="text-lg font-medium tracking-tight text-white">Rivo <span className='font-light text-white/60'>Card</span></div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center` }>
        <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${prefs.button}20` }} />
        <img src={photo} alt={name} className={`w-32 h-32 rounded-full object-cover border-[2px]`} style={{ borderColor: prefs.button }} />
      </div>

      <div className="text-center w-full max-w-sm px-8 relative z-10 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight" style={{ color: prefs.button, fontFamily: prefs.font === 'serif' ? "'Playfair Display', serif" : 'inherit' }}>{name}</h1>
        {job && <p className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{ color: prefs.button }}>{job}</p>}
        {company && <p className="text-[10px] text-white/40 tracking-widest uppercase font-light">{company}</p>}
      </div>

      <div className="w-full max-w-[85%] sm:max-w-sm space-y-3.5 relative z-10 mb-10">
        <button onClick={downloadVCard} className="w-full rounded-xl py-4 text-[11px] font-black tracking-[0.15em] text-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg" style={{ background: prefs.button, color: buttonTextColor, borderRadius: prefs.iconStyle === 'rounded' ? 9999 : 8 }}>
          <FaSave /> ENREGISTRER CONTACT
        </button>

        {profile?.location && (
          <a href={normalizeUrl(profile.location)} target="_blank" rel="noreferrer" className="block w-full">
            <button className="w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase">
              <FaMapMarkerAlt style={{ color: prefs.button }} /> Adresse
            </button>
          </a>
        )}

        {profile?.email && mailHref && (
          <a href={mailHref} className="block w-full">
            <button className="w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase">
              <FaEnvelope style={{ color: prefs.button }} /> RDV par email
            </button>
          </a>
        )}

        {profile?.phone && telHref && (
          <a href={telHref} className="block w-full">
            <button className="w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase">
              <FaPhone style={{ color: prefs.button }} /> APPELER
            </button>
          </a>
        )}

        {websiteHref && (
          <a href={websiteHref} target="_blank" rel="noreferrer" className="block w-full">
            <button className="w-full bg-white/[0.03] border border-white/10 text-white/90 rounded-xl py-4 text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 active:bg-white/10 transition-all backdrop-blur-sm uppercase font-bold">
              <FaGlobe style={{ color: prefs.button }} /> Portfolio / Site Web
            </button>
          </a>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-wrap justify-center gap-6 px-6 relative z-10 mb-16">
        {socialList.slice(0,4).map((s, index) => (
          <a key={index} href={normalizeUrl(s.url)} target="_blank" rel="noreferrer" className={`w-11 h-11 rounded-full border border-white/10 flex items-center justify-center transition-all`} style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ color: prefs.icon }}>{s.icon}</div>
          </a>
        ))}
      </div>

      <div className="w-full text-center pb-8 mt-auto relative z-10">
        <div className="text-[7px] text-white/20 tracking-[0.4em] uppercase">RIVO CARD • CUSTOM EDITION</div>
      </div>
    </div>
  );
}
