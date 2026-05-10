import React, { useState, useEffect } from 'react';
import { Phone, Globe, Mail, Instagram, Facebook, Linkedin, Youtube, Twitter, Send } from 'lucide-react';
import { normalizeUrl } from '@/lib/urlUtils';

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
    { id: 'instagram', url: profile.instagram, icon: <Instagram size={20} />, label: 'Instagram' },
    { id: 'linkedin', url: profile.linkedin, icon: <Linkedin size={20} />, label: 'LinkedIn' },
    { id: 'facebook', url: profile.facebook, icon: <Facebook size={20} />, label: 'Facebook' },
    { id: 'youtube', url: profile.youtube, icon: <Youtube size={20} />, label: 'YouTube' },
    { id: 'twitter', url: profile.twitter, icon: <Twitter size={20} />, label: 'Twitter' },
    { id: 'telegram', url: profile.telegram, icon: <Send size={20} />, label: 'Telegram' },
    { id: 'website', url: profile.website, icon: <Globe size={20} />, label: 'Site' },
    // ... add other networks as needed
  ].filter(s => s.url);

  const fontClass = prefs.font === 'serif' ? 'font-serif' : 'font-sans';
  const buttonTextColor = isHexLight(prefs.button) ? '#0b0b0b' : '#ffffff';

  return (
    <div className={`w-full max-w-[420px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${fontClass}`} style={{ background: prefs.bg }}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 bg-white/10 flex items-center justify-center overflow-hidden ${prefs.iconStyle === 'rounded' ? 'rounded-full' : 'rounded-md'}`}
            style={{ border: `2px solid ${prefs.icon}` }}
          >
            {/* avatar */}
            {profile?.avatar || profile?.photo ? (
              <img src={profile.avatar || profile.photo} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-white/80 uppercase font-bold">{(profile?.name || 'R').charAt(0)}</div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-white font-black text-xl leading-tight">{profile?.name}</div>
            <div className="text-white/70 text-sm mt-1">{profile?.title}</div>
          </div>
        </div>

        <p className="text-white/70 text-sm mt-4">
          {profile?.bio}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {socialList.map(s => (
            <a
              key={s.id}
              href={normalizeUrl(s.url)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: 'transparent',
                borderRadius: prefs.iconStyle === 'rounded' ? 9999 : 8,
                color: prefs.icon,
                border: `1px solid ${prefs.icon}30`,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{ color: prefs.icon }}>{s.icon}</div>
              <div className="text-white/90 text-sm">{s.label || (s.id.charAt(0).toUpperCase() + s.id.slice(1))}</div>
            </a>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            {/* Background color */}
            <label className="flex flex-col text-xs text-white/80">
              Fond
              <div className="mt-2 flex items-center gap-2">
                <input disabled={!editable} type="color" value={prefs.bg} onChange={e => updatePrefs({ bg: e.target.value })} className="h-9 w-12 p-0 border-0" />
                <div className="flex gap-1">
                  {colorPresets.map(c => (
                    <button key={c} disabled={!editable} onClick={() => updatePrefs({ bg: c })} style={{ background: c }} className="w-6 h-6 rounded-sm border border-white/10" />
                  ))}
                </div>
                <input disabled={!editable} type="text" value={prefs.bg} onChange={e => updatePrefs({ bg: e.target.value })} className="ml-2 h-9 bg-white/5 text-white px-2" />
              </div>
            </label>

            {/* Button color */}
            <label className="flex flex-col text-xs text-white/80">
              Bouton
              <div className="mt-2 flex items-center gap-2">
                <input disabled={!editable} type="color" value={prefs.button} onChange={e => updatePrefs({ button: e.target.value })} className="h-9 w-12 p-0 border-0" />
                <div className="flex gap-1">
                  {colorPresets.map(c => (
                    <button key={c} disabled={!editable} onClick={() => updatePrefs({ button: c })} style={{ background: c }} className="w-6 h-6 rounded-sm border border-white/10" />
                  ))}
                </div>
                <input disabled={!editable} type="text" value={prefs.button} onChange={e => updatePrefs({ button: e.target.value })} className="ml-2 h-9 bg-white/5 text-white px-2" />
              </div>
            </label>

            {/* Icon color */}
            <label className="flex flex-col text-xs text-white/80">
              Icônes
              <div className="mt-2 flex items-center gap-2">
                <input disabled={!editable} type="color" value={prefs.icon} onChange={e => updatePrefs({ icon: e.target.value })} className="h-9 w-12 p-0 border-0" />
                <div className="flex gap-1">
                  {colorPresets.map(c => (
                    <button key={c} disabled={!editable} onClick={() => updatePrefs({ icon: c })} style={{ background: c }} className="w-6 h-6 rounded-sm border border-white/10" />
                  ))}
                </div>
                <input disabled={!editable} type="text" value={prefs.icon} onChange={e => updatePrefs({ icon: e.target.value })} className="ml-2 h-9 bg-white/5 text-white px-2" />
              </div>
            </label>

            {/* Font */}
            <label className="flex flex-col text-xs text-white/80">
              Police
              <select disabled={!editable} value={prefs.font} onChange={e => updatePrefs({ font: e.target.value })} className="mt-2 h-9 bg-white/5 text-white">
                <option value="sans">Sans (moderne)</option>
                <option value="serif">Serif (élégant)</option>
              </select>
            </label>

            <label className="flex flex-col text-xs text-white/80 col-span-2">
              Style icônes / boutons
              <select disabled={!editable} value={prefs.iconStyle} onChange={e => updatePrefs({ iconStyle: e.target.value })} className="mt-2 h-9 bg-white/5 text-white">
                <option value="default">Carré (par défaut)</option>
                <option value="rounded">Arrondi / Cercle</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={save}
              disabled={!editable}
              className="px-4 py-2 font-bold text-sm"
              style={{
                background: prefs.button,
                color: buttonTextColor,
                borderRadius: prefs.iconStyle === 'rounded' ? 9999 : 8,
              }}
            >
              Enregistrer
            </button>
            {saved && <div className="text-sm text-white/80">Préférences enregistrées</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
