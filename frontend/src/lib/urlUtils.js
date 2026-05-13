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
