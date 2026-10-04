import { pool, query } from '../config/db.js';
import { scopeSql } from '../middleware/auth.js';
import { genCode, isWeekend, localDate } from '../utils/helpers.js';

/** Buat booking dengan cek bentrok di dalam transaksi DB (FOR UPDATE mencegah double booking) */
async function createBooking({ court_id, date, start_hour, duration, user_id, guest_name, guest_phone, note, status, companyId }) {
  start_hour = parseInt(start_hour);
  duration = Math.max(1, parseInt(duration) || 1);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[court]] = await conn.query(
      `SELECT ct.*, c.open_time, c.close_time FROM courts ct JOIN companies c ON c.id = ct.company_id
       WHERE ct.id = ? AND ct.is_active = 1 FOR UPDATE`, [court_id]);
    if (!court) throw { status: 404, message: 'Lapangan tidak ditemukan' };
    if (companyId && court.company_id != companyId) throw { status: 403, message: 'Lapangan bukan milik perusahaan Anda' };
    if (!date || date < localDate()) throw { status: 400, message: 'Tanggal tidak valid' };
    const endHour = start_hour + duration;
    if (start_hour < parseInt(court.open_time) || endHour > parseInt(court.close_time))
      throw { status: 400, message: 'Di luar jam operasional' };

    const start = `${String(start_hour).padStart(2, '0')}:00:00`;
    const end = `${String(endHour).padStart(2, '0')}:00:00`;
    const [clash] = await conn.query(
      `SELECT id FROM bookings WHERE court_id = ? AND date = ? AND status <> 'cancelled'
       AND start_time < ? AND end_time > ? LIMIT 1`, [court_id, date, end, start]);
    if (clash.length) throw { status: 409, message: 'Slot sudah dibooking, pilih jam lain' };

    const price = (isWeekend(date) ? court.price_weekend : court.price_per_hour) * duration;
    const code = genCode();
    const [r] = await conn.query(
      `INSERT INTO bookings (code, company_id, court_id, user_id, guest_name, guest_phone, date, start_time, end_time, total_price, status, note)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [code, court.company_id, court_id, user_id || null, guest_name || null, guest_phone || null, date, start, end, price, status, note || null]);
    await conn.commit();
    return { id: r.insertId, code, total_price: price, company_id: court.company_id };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function recordIncome(bookingId, userId) {
  const [b] = await query(
    `SELECT b.*, ct.name AS court_name FROM bookings b JOIN courts ct ON ct.id = b.court_id WHERE b.id = ?`, [bookingId]);
  await query(
    `INSERT IGNORE INTO transactions (company_id, booking_id, type, category, amount, note, date, created_by)
     VALUES (?,?, 'income','Sewa Lapang',?,?,?,?)`,
    [b.company_id, b.id, b.total_price, `Booking ${b.code} - ${b.court_name}`, localDate(), userId]);
}

const sendErr = (res, e) => {
  if (e.status) return res.status(e.status).json({ message: e.message });
  throw e;
};

// ===== Member =====
export async function memberCreate(req, res) {
  try {
    const result = await createBooking({ ...req.body, user_id: req.user.id, status: 'pending' });
    res.status(201).json(result);
  } catch (e) { sendErr(res, e); }
}

export const myBookings = async (req, res) =>
  res.json(await query(
    `SELECT b.*, ct.name AS court_name, s.name AS sport_name, s.icon, c.name AS venue_name, c.slug, c.phone AS venue_phone
     FROM bookings b JOIN courts ct ON ct.id = b.court_id JOIN sports s ON s.id = ct.sport_id
     JOIN companies c ON c.id = b.company_id WHERE b.user_id = ? ORDER BY b.date DESC, b.start_time DESC`, [req.user.id]));

export async function memberCancel(req, res) {
  const r = await query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status IN ('pending','confirmed')`,
    [req.params.id, req.user.id]);
  if (!r.affectedRows) return res.status(400).json({ message: 'Booking tidak bisa dibatalkan' });
  res.json({ message: 'Booking dibatalkan' });
}

// ===== Admin =====
export async function adminList(req, res) {
  const { date, from, to, status, court_id, q } = req.query;
  const s = scopeSql(req, 'b.company_id');
  let sql = `
    SELECT b.*, ct.name AS court_name, s.icon, s.name AS sport_name, c.name AS venue_name,
      COALESCE(u.name, b.guest_name) AS customer, COALESCE(u.phone, b.guest_phone) AS customer_phone
    FROM bookings b JOIN courts ct ON ct.id = b.court_id JOIN sports s ON s.id = ct.sport_id
    JOIN companies c ON c.id = b.company_id LEFT JOIN users u ON u.id = b.user_id
    WHERE 1=1 ${s.sql}`;
  const p = [...s.params];
  if (date) { sql += ' AND b.date = ?'; p.push(date); }
  if (from) { sql += ' AND b.date >= ?'; p.push(from); }
  if (to) { sql += ' AND b.date <= ?'; p.push(to); }
  if (status) { sql += ' AND b.status = ?'; p.push(status); }
  if (court_id) { sql += ' AND b.court_id = ?'; p.push(court_id); }
  if (q) { sql += ' AND (b.code LIKE ? OR u.name LIKE ? OR b.guest_name LIKE ?)'; p.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY b.date DESC, b.start_time ASC LIMIT 500';
  res.json(await query(sql, p));
}

export async function adminCreate(req, res) {
  try {
    const status = req.body.paid ? 'paid' : 'confirmed';
    const result = await createBooking({ ...req.body, status, companyId: req.companyId });
    if (status === 'paid') await recordIncome(result.id, req.user.id);
    res.status(201).json(result);
  } catch (e) { sendErr(res, e); }
}

export async function adminUpdateStatus(req, res) {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'paid', 'cancelled', 'done'].includes(status))
    return res.status(400).json({ message: 'Status tidak valid' });
  const s = scopeSql(req);
  const r = await query(`UPDATE bookings SET status = ? WHERE id = ? ${s.sql}`, [status, req.params.id, ...s.params]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Booking tidak ditemukan' });
  if (['paid', 'done'].includes(status)) await recordIncome(req.params.id, req.user.id);
  if (status === 'cancelled') await query('DELETE FROM transactions WHERE booking_id = ?', [req.params.id]);
  res.json({ message: 'Status diperbarui' });
}
