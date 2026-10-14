import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { clean, config, json, parseBody, redirect, sendEmail } from '../shared.mjs';

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = await parseBody(request);
    if (body.website) return redirect('/contact.html?status=received');

    const name = clean(body.name, 120);
    const phone = clean(body.phone, 60);
    const service = clean(body.service || 'Not sure yet', 120);
    const preferredDate = clean(body.date || 'Flexible', 40);
    const message = clean(body.message || 'None', 600);
    if (!name || !phone) return json({ error: 'Name and phone number are required.' }, 400);

    const createdAt = new Date().toISOString();
    const booking = { createdAt, name, phone, service, preferredDate, message };
    const store = getStore('salon-bookings');
    const key = `${createdAt.replace(/[^0-9]/g, '')}-${crypto.randomUUID()}`;
    await store.setJSON(key, booking);

    const emailBody = [
      `New appointment request for ${config.salonName}`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      `Preferred date: ${preferredDate}`,
      `Notes: ${message}`,
      `Received: ${createdAt}`,
    ].join('\n');
    await sendEmail({ subject: `New booking request — ${name}`, text: emailBody });

    const whatsappText = [
      `Hello ${config.salonName}, I would like to request an appointment.`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      `Preferred date: ${preferredDate}`,
      `Notes: ${message}`,
    ].join('\n');
    return redirect(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`);
  } catch (error) {
    console.error('Booking function failed:', error);
    return json({ error: 'Could not save the booking request.' }, 500);
  }
};
