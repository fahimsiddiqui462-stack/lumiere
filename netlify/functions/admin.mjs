import { getStore } from '@netlify/blobs';
import { adminCookie, clean, config, createAdminToken, getCookie, isValidAdminToken, json, parseBody } from '../shared.mjs';

function unauthorized() {
  return json({ error: 'Unauthorized.' }, 401, { 'www-authenticate': 'Cookie' });
}

function authenticated(request) {
  return isValidAdminToken(getCookie(request, 'lumiere_admin'));
}

export default async (request) => {
  try {
    if (request.method === 'POST') {
      const body = await parseBody(request);
      if (!body.password || !cryptoSafeEqual(String(body.password), config.adminPassword)) return unauthorized();
      return json({ ok: true }, 200, { 'set-cookie': adminCookie(createAdminToken()) });
    }

    if (request.method === 'DELETE') {
      return json({ ok: true }, 200, { 'set-cookie': adminCookie('', 0) });
    }

    if (request.method !== 'GET' || !authenticated(request)) return unauthorized();

    const store = getStore('salon-bookings');
    const { blobs } = await store.list();
    const bookings = await Promise.all(blobs.map(async (blob) => {
      const value = await store.get(blob.key, { type: 'json' });
      return value ? { key: blob.key, ...value } : null;
    }));
    bookings.sort((a, b) => String(b?.createdAt || '').localeCompare(String(a?.createdAt || '')));
    return json({ bookings: bookings.filter(Boolean) });
  } catch (error) {
    console.error('Admin function failed:', error);
    return json({ error: 'Admin service is unavailable.' }, 500);
  }
};

function cryptoSafeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a[index] ^ b[index];
  return result === 0;
}
