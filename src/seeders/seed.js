import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { localDate as fmt } from '../utils/helpers.js';
const pad = (h) => `${String(h).padStart(2, '0')}:00:00`;

async function seed() {
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    console.log('✅ Schema dibuat');

    const pw = await bcrypt.hash('password', 10);

    await query(`INSERT INTO sports (name, icon) VALUES
      ('Futsal','⚽'),('Badminton','🏸'),('Basket','🏀'),('Padel','🎾'),('Mini Soccer','🥅'),('Voli','🏐'),('Tenis','🎾')`);

    await query(`INSERT INTO companies (name, slug, address, city, phone, description, open_time, close_time) VALUES
      ('Aulia Futsal','aulia-futsal','Jl. Soekarno Hatta No. 12','Bandung','081234567890','Lapangan futsal vinyl standar internasional dengan tribun penonton.','08:00','23:00'),
      ('Lidya Sport','lidya-sport','Jl. Dipatiukur No. 45','Bandung','081298765432','Sport center lengkap: futsal, badminton, dan mini soccer rumput sintetis.','07:00','23:00'),
      ('Padel Arena Senayan','padel-arena-senayan','Jl. Asia Afrika No. 8','Jakarta','081311122233','Lapangan padel & basket indoor premium.','06:00','22:00')`);

    await query(
      `INSERT INTO users (company_id, name, email, phone, password, role) VALUES
      (NULL,'Super Admin','super@arenaku.id','0800000000',?,'super_admin'),
      (1,'Pak Aulia (Owner)','owner@aulia.id','0811111111',?,'owner'),
      (1,'Admin Aulia','admin@aulia.id','0811111112',?,'admin'),
      (2,'Bu Lidya (Owner)','owner@lidya.id','0822222221',?,'owner'),
      (2,'Admin Lidya 1','admin1@lidya.id','0822222222',?,'admin'),
      (2,'Admin Lidya 2','admin2@lidya.id','0822222223',?,'admin'),
      (3,'Owner Padel','owner@padel.id','0833333331',?,'owner'),
      (NULL,'Budi Member','member@arenaku.id','0855555555',?,'member'),
      (NULL,'Siti Member','siti@arenaku.id','0855555556',?,'member')`,
      Array(9).fill(pw)
    );

    await query(`INSERT INTO courts (company_id, sport_id, name, price_per_hour, price_weekend) VALUES
      (1,1,'Futsal A (Vinyl)',150000,180000),
      (1,1,'Futsal B (Sintetis)',130000,160000),
      (2,1,'Futsal Utama',140000,170000),
      (2,2,'Badminton 1',50000,60000),
      (2,2,'Badminton 2',50000,60000),
      (2,5,'Mini Soccer',350000,450000),
      (3,4,'Padel Court 1',300000,380000),
      (3,4,'Padel Court 2',300000,380000),
      (3,3,'Basket Indoor',200000,250000)`);

    for (const cid of [1, 2, 3]) {
      await query(
        `INSERT INTO finance_categories (company_id, type, name) VALUES
        (?, 'income','Sewa Lapang'),(?, 'income','Kantin'),(?, 'income','Lainnya'),
        (?, 'expense','Listrik & Air'),(?, 'expense','Gaji Karyawan'),(?, 'expense','Perawatan'),(?, 'expense','Lainnya')`,
        Array(7).fill(cid)
      );
    }

    // Booking & transaksi dummy: 30 hari ke belakang + 3 hari ke depan
    const courts = await query('SELECT * FROM courts');
    const today = new Date();
    let n = 1;
    for (let d = -30; d <= 3; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() + d);
      const date = fmt(day);
      const weekend = [0, 6].includes(day.getDay());
      for (const c of courts) {
        const hours = [9, 13, 16, 18, 19, 20, 21].filter(() => Math.random() < 0.45);
        for (const h of hours) {
          const price = weekend ? c.price_weekend : c.price_per_hour;
          const status = d < 0 ? (Math.random() < 0.08 ? 'cancelled' : 'done') : d === 0 ? 'paid' : Math.random() < 0.5 ? 'pending' : 'confirmed';
          const code = `BK${String(n++).padStart(6, '0')}`;
          const userId = Math.random() < 0.5 ? 8 : 9;
          const r = await query(
            `INSERT INTO bookings (code, company_id, court_id, user_id, date, start_time, end_time, total_price, status)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [code, c.company_id, c.id, userId, date, pad(h), pad(h + 1), price, status]
          );
          if (['done', 'paid'].includes(status)) {
            await query(
              `INSERT INTO transactions (company_id, booking_id, type, category, amount, note, date) VALUES (?,?,?,?,?,?,?)`,
              [c.company_id, r.insertId, 'income', 'Sewa Lapang', price, `Booking ${code} - ${c.name}`, date]
            );
          }
        }
      }
      // pengeluaran mingguan
      if (d <= 0 && day.getDay() === 1) {
        for (const cid of [1, 2, 3]) {
          await query(
            `INSERT INTO transactions (company_id, type, category, amount, note, date) VALUES
             (?, 'expense','Listrik & Air',?, 'Tagihan mingguan', ?),(?, 'expense','Perawatan',?, 'Perawatan lapangan', ?)`,
            [cid, 400000 + cid * 150000, date, cid, 150000 + cid * 50000, date]
          );
        }
      }
    }
    for (const cid of [1, 2, 3]) {
      await query(`INSERT INTO transactions (company_id, type, category, amount, note, date) VALUES (?, 'expense','Gaji Karyawan',?, 'Gaji bulanan', ?)`, [
        cid, 3000000 * cid, fmt(new Date(today.getFullYear(), today.getMonth(), 1, 12)),
      ]);
    }

    console.log(`✅ Seed selesai: ${n - 1} booking dibuat`);
    console.log('🔑 Login (password: "password"): super@arenaku.id, owner@aulia.id, admin@aulia.id, owner@lidya.id, admin1@lidya.id, member@arenaku.id');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed gagal:', err);
    process.exit(1);
  }
}

seed();
