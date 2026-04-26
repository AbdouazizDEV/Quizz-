import { createHash } from 'node:crypto';

import { getEnv } from './env.js';

type ParsedCloudinary = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function parseCloudinaryUrl(raw: string): ParsedCloudinary {
  const u = new URL(raw);
  if (u.protocol !== 'cloudinary:') {
    throw new Error('CLOUDINARY_URL invalide (protocole cloudinary:// attendu).');
  }
  const cloudName = u.hostname;
  const apiKey = decodeURIComponent(u.username);
  const apiSecret = decodeURIComponent(u.password);
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_URL invalide (cloud name / key / secret manquant).');
  }
  return { cloudName, apiKey, apiSecret };
}

function signParams(input: Record<string, string>, apiSecret: string): string {
  const base = Object.keys(input)
    .sort()
    .map((k) => `${k}=${input[k]}`)
    .join('&');
  return createHash('sha1')
    .update(`${base}${apiSecret}`)
    .digest('hex');
}

async function uploadToCloudinary(params: {
  imageBase64: string;
  userId: string;
  folderFallback: string;
}): Promise<string> {
  const env = getEnv();
  const cloudinaryUrl = env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL non configurée.');
  }

  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(cloudinaryUrl);
  const folder = env.CLOUDINARY_UPLOAD_FOLDER?.trim() || params.folderFallback;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const publicId = `${folder}/${params.userId}-${Date.now()}`;
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const dataUri = params.imageBase64.startsWith('data:')
    ? params.imageBase64
    : `data:image/jpeg;base64,${params.imageBase64}`;

  const body = new URLSearchParams();
  body.set('file', dataUri);
  body.set('api_key', apiKey);
  body.set('timestamp', timestamp);
  body.set('public_id', publicId);
  body.set('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  type CloudinaryUploadResponse = { secure_url?: string; error?: { message?: string } };
  const payload = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;
  if (!res.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || "Échec d'upload Cloudinary.");
  }
  return payload.secure_url;
}

export async function uploadAvatarToCloudinary(imageBase64: string, userId: string): Promise<string> {
  return uploadToCloudinary({
    imageBase64,
    userId,
    folderFallback: 'quizzplus/avatars',
  });
}

export async function uploadCoverToCloudinary(imageBase64: string, userId: string): Promise<string> {
  return uploadToCloudinary({
    imageBase64,
    userId,
    folderFallback: 'quizzplus/covers',
  });
}

