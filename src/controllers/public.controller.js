import { query } from '../config/db.js';

export const sports = async (req, res) => res.json(await query('SELECT * FROM sports ORDER BY id'));

export async function venues(req, res) {
  const { sport_id, city, q } = req.query;
  let sql = `
    SELECT c.id, c.name, c.slug, c.city, c.address, c.open_time, c.close_time,
      MIN(ct.price_per_hour) AS min_price, COUNT(DISTINCT ct.id) AS court_count,
      GROUP_CONCAT(DISTINCT CONCAT(s.icon,' ',s.name) SEPARATOR ', ') AS sports
    FROM companies c
    JOIN courts ct ON ct.company_id = c.id AND ct.is_active = 1
    JOIN sports s ON s.id = ct.sport_id
    WHERE c.is_active = 1`;
  const p = [];
  if (sport_id) { sql += ' AND c.id IN (SELECT company_id FROM courts WHERE sport_id = ? AND is_active = 1)'; p.push(sport_id); }
  if (city) { sql += ' AND c.city = ?'; p.push(city); }
  if (q) { sql += ' AND (c.name LIKE ? OR c.address LIKE ?)'; p.push(`%${q}%`, `%${q}%`); }
  sql += ' GROUP BY c.id ORDER BY c.name';
  res.json(await query(sql, p));
}

export const cities = async (req, res) =>
  res.json((await query('SELECT DISTINCT city FROM companies WHERE is_active = 1 ORDER BY city')).map((r) => r.city));

export async function venueDetail(req, res) {
  const [venue] = await query('SELECT * FROM companies WHERE slug = ? AND is_active = 1', [req.params.slug]);
  if (!venue) return res.status(404).json({ message: 'Venue tidak ditemukan' });
  venue.courts = await query(
    `SELECT ct.*, s.name AS sport_name, s.icon FROM courts ct JOIN sports s ON s.id = ct.sport_id
     WHERE ct.company_id = ? AND ct.is_active = 1 ORDER BY s.id, ct.name`, [venue.id]);
  res.json(venue);
}

/** Slot per jam untuk semua lapangan venue pada tanggal tertentu */
export async function availability(req, res) {
  const { date } = req.query;
  const [venue] = await query('SELECT id, open_time, close_time FROM companies WHERE id = ?', [req.params.companyId]);
  if (!venue || !date) return res.status(400).json({ message: 'Venue/tanggal tidak valid' });

  const booked = await query(
    `SELECT court_id, start_time, end_time FROM bookings
     WHERE company_id = ? AND date = ? AND status <> 'cancelled'`, [venue.id, date]);

  const open = parseInt(venue.open_time), close = parseInt(venue.close_time);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const slots = [];
  for (let hr = open; hr < close; hr++) {
    const start = `${String(hr).padStart(2, '0')}:00:00`;
    slots.push({
      hour: hr,
      start,
      past: date < todayStr || (date === todayStr && hr <= now.getHours()),
      bookedCourts: booked
        .filter((b) => b.start_time <= start && b.end_time > start)
        .map((b) => b.court_id),
    });
  }
  res.json(slots);
}
