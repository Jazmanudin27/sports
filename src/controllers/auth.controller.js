import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, company_id: u.company_id, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = async (id) =>
  (await query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.company_id, c.name AS company_name
     FROM users u LEFT JOIN companies c ON c.id = u.company_id WHERE u.id = ?`, [id]))[0];

export async function login(req, res) {
  const { email, password } = req.body;
  const [u] = await query('SELECT * FROM users WHERE email = ?', [email]);
  if (!u || !(await bcrypt.compare(password || '', u.password)))
    return res.status(400).json({ message: 'Email atau password salah' });
  res.json({ token: sign(u), user: await publicUser(u.id) });
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Nama, email, dan password (min. 6 karakter) wajib diisi' });
  const [exist] = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (exist) return res.status(400).json({ message: 'Email sudah terdaftar' });
  const r = await query(`INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?, 'member')`, [
    name, email, phone, await bcrypt.hash(password, 10),
  ]);
  const user = await publicUser(r.insertId);
  res.status(201).json({ token: sign(user), user });
}

export async function me(req, res) {
  res.json(await publicUser(req.user.id));
}
