const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '×' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }));
}

const bookingForm = document.querySelector('form[action="/api/booking"]');
const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';

if (bookingForm && isLocalPreview) {
  const previewNote = document.createElement('p');
  previewNote.className = 'form-note local-booking-note';
  previewNote.setAttribute('role', 'status');
  previewNote.hidden = true;
  bookingForm.prepend(previewNote);

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const data = new FormData(bookingForm);
    const message = [
      'Hello Lumière, I would like to request an appointment.',
      '',
      `Name: ${data.get('name') || ''}`,
      `Phone: ${data.get('phone') || ''}`,
      `Service: ${data.get('service') || ''}`,
      `Preferred date: ${data.get('date') || 'Flexible'}`,
      `Notes: ${data.get('message') || 'None'}`
    ].join('\\n');
    const whatsappNumber = '923000000000'; // Portfolio demo number.
    previewNote.textContent = 'Local preview mode: the Netlify backend is not running here. Your WhatsApp request is being opened instead.';
    previewNote.hidden = false;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
