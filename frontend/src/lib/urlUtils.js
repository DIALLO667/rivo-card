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
    `TEL:${phone || ''}`,
    `EMAIL:${email || ''}`,
    'END:VCARD'
  ];
  return lines.join('\n');
}
