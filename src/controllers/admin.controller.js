import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { scopeSql } from '../middleware/auth.js';
import { localDate, slugify } from '../utils/helpers.js';

const needCompany = (req, res) => {
  if (!req.companyId) { res.status(400).json({ message: 'Pilih perusahaan terlebih dahulu' }); return true; }
  return false;
};

// ===== Courts =====
export async function courtList(req, res) {
  const s = scopeSql(req, 'ct.company_id');
  res.json(await query(
    `SELECT ct.*, s.name AS sport_name, s.icon, c.name AS venue_name FROM courts ct
     JOIN sports s ON s.id = ct.sport_id JOIN companies c ON c.id = ct.company_id
     WHERE 1=1 ${s.sql} ORDER BY c.name, ct.name`, s.params));
}

export async function courtSave(req, res) {
  const { sport_id, name, price_per_hour, price_weekend, is_active = 1 } = req.body;
  if (!sport_id || !name || !price_per_hour) return res.status(400).json({ message: 'Data lapangan belum lengkap' });
  const vals = [sport_id, name, price_per_hour, price_weekend || price_per_hour, is_active ? 1 : 0];
  if (req.params.id) {
    const s = scopeSql(req);
    const r = await query(`UPDATE courts SET sport_id=?, name=?, price_per_hour=?, price_weekend=?, is_active=? WHERE id=? ${s.sql}`,
      [...vals, req.params.id, ...s.params]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
  } else {
    if (needCompany(req, res)) return;
    await query('INSERT INTO courts (sport_id, name, price_per_hour, price_weekend, is_active, company_id) VALUES (?,?,?,?,?,?)',
      [...vals, req.companyId]);
  }
  res.json({ message: 'Lapangan disimpan' });
}

// ===== Finance =====
export async function financeList(req, res) {
  const { from, to, type } = req.query;
  const s = scopeSql(req, 't.company_id');
  let sql = `SELECT t.*, c.name AS venue_name, u.name AS created_by_name FROM transactions t
    JOIN companies c ON c.id = t.company_id LEFT JOIN users u ON u.id = t.created_by WHERE 1=1 ${s.sql}`;
  const p = [...s.params];
  if (from) { sql += ' AND t.date >= ?'; p.push(from); }
  if (to) { sql += ' AND t.date <= ?'; p.push(to); }
  if (type) { sql += ' AND t.type = ?'; p.push(type); }
  const rows = await query(sql + ' ORDER BY t.date DESC, t.id DESC', p);
  const income = rows.filter((r) => r.type === 'income').reduce((a, r) => a + r.amount, 0);
  const expense = rows.filter((r) => r.type === 'expense').reduce((a, r) => a + r.amount, 0);
  const byCategory = Object.values(rows.reduce((acc, r) => {
    const k = r.type + r.category;
    acc[k] = acc[k] || { type: r.type, category: r.category, total: 0 };
    acc[k].total += r.amount;
    return acc;
  }, {}));
  res.json({ rows, summary: { income, expense, profit: income - expense }, byCategory });
}

export async function financeCreate(req, res) {
  if (needCompany(req, res)) return;
  const { type, category, amount, note, date } = req.body;
  if (!['income', 'expense'].includes(type) || !category || !(amount > 0))
    return res.status(400).json({ message: 'Data transaksi belum lengkap' });
  await query(`INSERT INTO transactions (company_id, type, category, amount, note, date, created_by) VALUES (?,?,?,?,?,?,?)`,
    [req.companyId, type, category, amount, note || null, date || localDate(), req.user.id]);
  res.status(201).json({ message: 'Transaksi dicatat' });
}

export async function financeDelete(req, res) {
  const s = scopeSql(req);
  const r = await query(`DELETE FROM transactions WHERE id = ? AND booking_id IS NULL ${s.sql}`, [req.params.id, ...s.params]);
  if (!r.affectedRows) return res.status(400).json({ message: 'Transaksi booking tidak bisa dihapus manual' });
  res.json({ message: 'Transaksi dihapus' });
}

export async function categories(req, res) {
  const s = scopeSql(req);
  res.json(await query(`SELECT DISTINCT type, name FROM finance_categories WHERE 1=1 ${s.sql} ORDER BY type, name`, s.params));
}

// ===== Dashboard =====
export async function dashboard(req, res) {
  const s = scopeSql(req, 'company_id');
  const today = localDate();
  const month = today.slice(0, 7);
  const [stat] = await query(`
    SELECT
      (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='income' AND date = ? ${s.sql}) AS income_today,
      (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='income' AND DATE_FORMAT(date,'%Y-%m') = ? ${s.sql}) AS income_month,
      (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='expense' AND DATE_FORMAT(date,'%Y-%m') = ? ${s.sql}) AS expense_month,
      (SELECT COUNT(*) FROM bookings WHERE date = ? AND status <> 'cancelled' ${s.sql}) AS bookings_today,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending' ${s.sql}) AS pending,
      (SELECT COUNT(*) FROM courts WHERE is_active = 1 ${s.sql}) AS courts`,
    [today, ...s.params, month, ...s.params, month, ...s.params, today, ...s.params, ...s.params, ...s.params]);

  const daily = await query(`
    SELECT date, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
    FROM transactions WHERE date >= DATE_SUB(?, INTERVAL 29 DAY) AND date <= ? ${s.sql}
    GROUP BY date ORDER BY date`, [today, today, ...s.params]);

  const sb = scopeSql(req, 'b.company_id');
  const topCourts = await query(`
    SELECT ct.name, s.icon, c.name AS venue_name, COUNT(*) AS total, SUM(b.total_price) AS revenue
    FROM bookings b JOIN courts ct ON ct.id = b.court_id JOIN sports s ON s.id = ct.sport_id JOIN companies c ON c.id = b.company_id
    WHERE b.status IN ('paid','done') AND b.date >= DATE_SUB(?, INTERVAL 29 DAY) ${sb.sql}
    GROUP BY ct.id ORDER BY revenue DESC LIMIT 5`, [today, ...sb.params]);

  const bySport = await query(`
    SELECT s.name, s.icon, COUNT(*) AS total FROM bookings b JOIN courts ct ON ct.id = b.court_id JOIN sports s ON s.id = ct.sport_id
    WHERE b.status <> 'cancelled' AND b.date >= DATE_SUB(?, INTERVAL 29 DAY) ${sb.sql}
    GROUP BY s.id ORDER BY total DESC`, [today, ...sb.params]);

  // Okupansi hari ini = jam terbooking / (jumlah lapangan x jam operasional)
  const [occ] = await query(`
    SELECT
      (SELECT COALESCE(SUM(TIMESTAMPDIFF(HOUR, start_time, end_time)),0) FROM bookings b WHERE b.date = ? AND b.status <> 'cancelled' ${sb.sql}) AS used,
      (SELECT COALESCE(SUM(TIMESTAMPDIFF(HOUR, c.open_time, c.close_time)),0) FROM courts ct JOIN companies c ON c.id = ct.company_id
        WHERE ct.is_active = 1 ${scopeSql(req, 'ct.company_id').sql}) AS capacity`,
    [today, ...sb.params, ...s.params]);

  const upcoming = await query(`
    SELECT b.id, b.code, b.date, b.start_time, b.end_time, b.status, ct.name AS court_name, s.icon,
      COALESCE(u.name, b.guest_name) AS customer
    FROM bookings b JOIN courts ct ON ct.id = b.court_id JOIN sports s ON s.id = ct.sport_id LEFT JOIN users u ON u.id = b.user_id
    WHERE b.date = ? AND b.status <> 'cancelled' ${sb.sql} ORDER BY b.start_time LIMIT 8`, [today, ...sb.params]);

  res.json({
    ...stat,
    occupancy: occ.capacity ? Math.round((occ.used / occ.capacity) * 100) : 0,
    daily, topCourts, bySport, upcoming,
  });
}

// ===== Companies (super admin) =====
export const companyList = async (req, res) =>
  res.json(await query(`
    SELECT c.*, (SELECT COUNT(*) FROM courts WHERE company_id = c.id) AS court_count,
      (SELECT COUNT(*) FROM users WHERE company_id = c.id) AS user_count
    FROM companies c ORDER BY c.name`));

export async function companySave(req, res) {
  const { name, address, city, phone, description, open_time = '08:00', close_time = '23:00', is_active = 1 } = req.body;
  if (!name || !city) return res.status(400).json({ message: 'Nama & kota wajib diisi' });
  const vals = [name, address, city, phone, description, open_time, close_time, is_active ? 1 : 0];
  if (req.params.id) {
    await query('UPDATE companies SET name=?, address=?, city=?, phone=?, description=?, open_time=?, close_time=?, is_active=? WHERE id=?',
      [...vals, req.params.id]);
  } else {
    const r = await query('INSERT INTO companies (name, address, city, phone, description, open_time, close_time, is_active, slug) VALUES (?,?,?,?,?,?,?,?,?)',
      [...vals, `${slugify(name)}-${Date.now().toString(36)}`]);
    await query(`INSERT INTO finance_categories (company_id, type, name) VALUES
      (?, 'income','Sewa Lapang'),(?, 'income','Lainnya'),(?, 'expense','Listrik & Air'),(?, 'expense','Gaji Karyawan'),(?, 'expense','Perawatan'),(?, 'expense','Lainnya')`,
      Array(6).fill(r.insertId));
  }
  res.json({ message: 'Perusahaan disimpan' });
}

// ===== Users (super admin: semua, owner: staf perusahaannya) =====
export async function userList(req, res) {
  const s = scopeSql(req, 'u.company_id');
  const where = req.user.role === 'super_admin' ? `WHERE 1=1 ${s.sql}` : `WHERE u.company_id = ?`;
  res.json(await query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.company_id, c.name AS company_name, u.created_at
     FROM users u LEFT JOIN companies c ON c.id = u.company_id ${where} ORDER BY u.role, u.name`,
    req.user.role === 'super_admin' ? s.params : [req.companyId]));
}

export async function userCreate(req, res) {
  const { name, email, phone, password, role } = req.body;
  const allowed = req.user.role === 'super_admin' ? ['super_admin', 'owner', 'admin', 'member'] : ['admin'];
  if (!allowed.includes(role)) return res.status(403).json({ message: 'Tidak boleh membuat role ini' });
  if (!name || !email || !password) return res.status(400).json({ message: 'Data user belum lengkap' });
  const companyId = ['owner', 'admin'].includes(role) ? req.companyId : null;
  if (['owner', 'admin'].includes(role) && !companyId) return res.status(400).json({ message: 'Pilih perusahaan' });
  const [exist] = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (exist) return res.status(400).json({ message: 'Email sudah terdaftar' });
  await query('INSERT INTO users (company_id, name, email, phone, password, role) VALUES (?,?,?,?,?,?)',
    [companyId, name, email, phone, await bcrypt.hash(password, 10), role]);
  res.status(201).json({ message: 'User dibuat' });
}

export async function userDelete(req, res) {
  if (req.params.id == req.user.id) return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
  const extra = req.user.role === 'super_admin' ? '' : ` AND company_id = ${Number(req.companyId)} AND role = 'admin'`;
  const r = await query(`DELETE FROM users WHERE id = ?${extra}`, [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json({ message: 'User dihapus' });
}
