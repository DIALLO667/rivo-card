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
