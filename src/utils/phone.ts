const AVATAR_PALETTE = [
  '#00a884',
  '#25d366',
  '#128c7e',
  '#075e54',
  '#34b7f1',
  '#53bdeb',
  '#6b5b95',
  '#feb236',
  '#d64161',
  '#ff7b25',
  '#86af49',
  '#b5e7a0',
];

export function cleanDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function toChatId(input: string): string {
  const trimmed = input.trim();
  if (trimmed.endsWith('@c.us') || trimmed.endsWith('@g.us')) {
    const [num, domain] = trimmed.split('@');
    const cleaned = cleanDigits(num);
    return `${cleaned}@${domain}`;
  }

  let cleaned = cleanDigits(trimmed);
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  return `${cleaned}@c.us`;
}

export function formatDisplayPhone(input: string): string {
  const bare = input.replace(/@(c|g)\.us$/, '');
  const digits = cleanDigits(bare);

  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }

  if (digits.length > 6) {
    return `+${digits}`;
  }

  return input;
}

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

export function getInitials(nameOrPhone: string): string {
  const clean = nameOrPhone.replace(/@(c|g)\.us$/, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  if (clean.length >= 2 && !/\d/.test(clean[0])) {
    return clean.slice(0, 2).toUpperCase();
  }

  const digits = cleanDigits(clean);
  if (digits.length >= 2) {
    return digits.slice(-2);
  }

  return clean.slice(0, 2).toUpperCase() || 'WA';
}
