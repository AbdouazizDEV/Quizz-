/** Payload signé embarqué dans le QR profil ami (v1). */
export interface FriendQrProfile {
  v: 1;
  uid: string;
  n: string;
  s: number;
  l: string;
}

const FRIEND_QR_SALT = 'quizzplus-friend-v1';
const DEEP_LINK_PREFIX = 'quizzplus://friend';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function fnv1a(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function signProfile(profile: FriendQrProfile): string {
  const core = JSON.stringify(profile);
  return fnv1a(`${FRIEND_QR_SALT}:${core}`);
}

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    const triplet = (b1 << 16) | ((b2 ?? 0) << 8) | (b3 ?? 0);
    output += BASE64_ALPHABET[(triplet >> 18) & 63];
    output += BASE64_ALPHABET[(triplet >> 12) & 63];
    output += b2 === undefined ? '=' : BASE64_ALPHABET[(triplet >> 6) & 63];
    output += b3 === undefined ? '=' : BASE64_ALPHABET[triplet & 63];
  }
  return output;
}

function base64ToBytes(base64: string): Uint8Array {
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    const c1 = BASE64_ALPHABET.indexOf(padded[i] ?? '=');
    const c2 = BASE64_ALPHABET.indexOf(padded[i + 1] ?? '=');
    const c3 = BASE64_ALPHABET.indexOf(padded[i + 2] ?? '=');
    const c4 = BASE64_ALPHABET.indexOf(padded[i + 3] ?? '=');
    const triplet = (c1 << 18) | (c2 << 12) | ((c3 & 63) << 6) | (c4 & 63);
    bytes.push((triplet >> 16) & 255);
    if (padded[i + 2] !== '=') bytes.push((triplet >> 8) & 255);
    if (padded[i + 3] !== '=') bytes.push(triplet & 255);
  }
  return Uint8Array.from(bytes);
}

function base64UrlEncode(value: string): string {
  return bytesToBase64(utf8ToBytes(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  return bytesToUtf8(base64ToBytes(value));
}

export function buildFriendQrProfile(input: {
  userId: string;
  displayName: string;
  totalScore: number;
  levelLabel: string;
}): FriendQrProfile {
  return {
    v: 1,
    uid: input.userId.trim(),
    n: input.displayName.trim() || 'Joueur',
    s: Math.max(0, Math.round(input.totalScore)),
    l: input.levelLabel.trim() || 'Niveau 1',
  };
}

/** Lien deep link + payload signé (obfusqué en base64url). */
export function encodeFriendQrDeepLink(profile: FriendQrProfile): string {
  const sig = signProfile(profile);
  const token = base64UrlEncode(JSON.stringify({ p: profile, sig }));
  return `${DEEP_LINK_PREFIX}?d=${token}`;
}

function parseEnvelope(raw: string): FriendQrProfile | null {
  try {
    const parsed = JSON.parse(raw) as { p?: FriendQrProfile; sig?: string };
    if (!parsed.p || parsed.p.v !== 1 || !parsed.p.uid?.trim()) return null;
    if (parsed.sig !== signProfile(parsed.p)) return null;
    return parsed.p;
  } catch {
    return null;
  }
}

/** Extrait le profil depuis un QR scanné ou un lien partagé. */
export function decodeFriendQrPayload(raw: string): FriendQrProfile | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const tokenMatch = trimmed.match(/[?&]d=([^&#]+)/);
  if (tokenMatch?.[1]) {
    try {
      return parseEnvelope(base64UrlDecode(decodeURIComponent(tokenMatch[1])));
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith(`${DEEP_LINK_PREFIX}?`)) {
    try {
      const query = trimmed.slice(DEEP_LINK_PREFIX.length + 1);
      const params = new URLSearchParams(query);
      const token = params.get('d');
      if (token) return parseEnvelope(base64UrlDecode(token));
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith('{')) {
    return parseEnvelope(trimmed);
  }

  try {
    return parseEnvelope(base64UrlDecode(trimmed));
  } catch {
    return null;
  }
}
