import crypto from 'node:crypto';

export const config = {
  salonName: process.env.SALON_NAME || 'Lumière Beauty Studio',
  salonEmail: process.env.SALON_EMAIL || 'hello@lumiere.pk',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '923000000000',
  adminPassword: process.env.ADMIN_PASSWORD || 'lumiere-demo-2026',
  adminSecret: process.env.ADMIN_SECRET || 'change-this-netlify-admin-secret',
};

export function clean(value, limit = 500) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, limit);
}

export async function parseBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return await request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function redirect(url, status = 303) {
  return new Response(null, { status, headers: { location: url } });
}

export async function sendEmail({ subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: 'Email environment variables are not configured.' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [config.salonEmail], subject, text }),
  });
  if (!response.ok) {
    console.error('Resend email failed:', response.status, await response.text());
    return { sent: false, reason: 'Email provider returned an error.' };
  }
  return { sent: true };
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signature(payload) {
  return crypto.createHmac('sha256', config.adminSecret).update(payload).digest('base64url');
}

export function createAdminToken() {
  const payload = base64url(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 8 }));
  return `${payload}.${signature(payload)}`;
}

export function isValidAdminToken(token = '') {
  const [payload, providedSignature] = token.split('.');
  if (!payload || !providedSignature) return false;
  const expected = signature(payload);
  if (providedSignature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expected))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export function getCookie(request, name) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function adminCookie(token, maxAge = 60 * 60 * 8) {
  const secure = process.env.CONTEXT && process.env.CONTEXT !== 'dev' ? '; Secure' : '';
  return `lumiere_admin=${encodeURIComponent(token)}; Path=/api/admin; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}
