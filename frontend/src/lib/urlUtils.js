export function normalizeUrl(raw) {
  if (!raw && raw !== '') return '';
  const s = String(raw).trim();
  if (!s) return '';
  // If it already starts with a protocol, leave it
  if (/^https?:\/\//i.test(s)) return s;
  // If it's a mailto or tel, keep as-is
  if (/^mailto:/i.test(s) || /^tel:/i.test(s)) return s;
  // Otherwise, assume https
  return 'https://' + s;
}

// Turns a pasted Google Maps link OR a plain-text address into a URL that
// always opens correctly in Maps. A raw address (no scheme, no maps domain)
// would otherwise get "https://" tacked on by normalizeUrl and 404.
export function toMapsUrl(raw) {
  if (!raw && raw !== '') return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/(maps\.app\.goo\.gl|goo\.gl\/maps|google\.[a-z.]+\/maps|maps\.google\.)/i.test(s)) {
    return normalizeUrl(s);
  }
  return `https://www.google.com/maps/search/?api=query&query=${encodeURIComponent(s)}`;
}

export function makeVCard({ name = '', phone = '', email = '' } = {}) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name || ''}`,
  ];
  // phone may be a string or an array of strings
  if (Array.isArray(phone)) {
    phone.forEach(p => lines.push(`TEL:${p || ''}`));
  } else {
    lines.push(`TEL:${phone || ''}`);
  }
  lines.push(`EMAIL:${email || ''}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

// Split a raw phone string into multiple phone numbers.
// Accepts separators: '/', ',', ';', newline.
export function splitPhones(raw) {
  if (!raw && raw !== 0) return [];
  const s = String(raw).trim();
  if (!s) return [];
  // split on common separators and whitespace-newline combos
  const parts = s.split(/[\/,;\n]+/).map(p => p.trim()).filter(Boolean);
  return parts;
}

// Normalize a raw phone number into a clean form usable by both tel: and
// wa.me links: keeps a leading "+" if present, converts a leading "00"
// (the international access code many people dial instead of "+") into "+",
// and strips everything else that isn't a digit (spaces, dashes, dots...).
export function cleanPhoneNumber(raw) {
  if (!raw && raw !== 0) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const hadPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  if (hadPlus) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  return digits;
}

// tel: links are fine with a leading "+".
export function toTelHref(raw) {
  const n = cleanPhoneNumber(raw);
  return n ? `tel:${n}` : '';
}

// wa.me requires digits only — no "+", no leading zeros.
export function toWhatsAppHref(raw) {
  const n = cleanPhoneNumber(raw).replace(/^\+/, '');
  return n ? `https://wa.me/${n}` : '';
}
