export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const isWeekend = (dateStr) => [0, 6].includes(new Date(`${dateStr}T00:00:00`).getDay());

export const genCode = () => 'BK' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Bungkus async controller agar error otomatis ke handler */
export const h = (fn) => (req, res, next) => fn(req, res, next).catch(next);
