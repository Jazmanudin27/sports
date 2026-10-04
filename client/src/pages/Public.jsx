import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, errMsg, jam, rupiah, tgl, today, useApp } from '../lib.jsx';

export function Navbar() {
  const { user, logout } = useApp();
  const nav = useNavigate();
  const isStaff = user && user.role !== 'member';
  return (
    <header className="nav">
      <div className="container">
        <Link to="/" className="logo" id="nav-logo"><span className="dot" />Arena<span className="grad-text">Ku</span></Link>
        <nav className="nav-links">
          <NavLink to="/" end>Beranda</NavLink>
          <NavLink to="/venues">Cari Lapangan</NavLink>
          {user && <NavLink to="/my-bookings">Booking Saya</NavLink>}
          {isStaff && <Link to="/admin" className="btn btn-sm" id="nav-admin">⚙️ Panel Admin</Link>}
          {user ? (
            <button className="btn btn-sm" id="nav-logout" onClick={() => { logout(); nav('/'); }}>Keluar</button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-login">Masuk</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export const Footer = () => (
  <footer><div className="container row between"><span>© {new Date().getFullYear()} ArenaKu — Booking lapangan olahraga jadi mudah.</span><span>⚽ 🏸 🏀 🎾</span></div></footer>
);

function VenueCard({ v }) {
  return (
    <Link to={`/venue/${v.slug}`} className="card card-hover" id={`venue-${v.slug}`}>
      <div className="venue-cover"><span>{v.sports.split(', ').map((s) => s.split(' ')[0]).join(' ')}</span></div>
      <h3>{v.name}</h3>
      <p className="muted" style={{ fontSize: '.9rem', margin: '4px 0 12px' }}>📍 {v.address}, {v.city}</p>
      <p style={{ fontSize: '.85rem' }} className="muted">{v.sports}</p>
      <div className="row between mt" style={{ marginTop: 16 }}>
        <span className="muted" style={{ fontSize: '.85rem' }}>{v.court_count} lapangan · {jam(v.open_time)}–{jam(v.close_time)}</span>
        <span className="price grad-text">{rupiah(v.min_price)}<small className="muted">/jam</small></span>
      </div>
    </Link>
  );
}

function useSports() {
  const [sports, setSports] = useState([]);
  useEffect(() => { api.get('/sports').then((r) => setSports(r.data)); }, []);
  return sports;
}

export function Home() {
  const sports = useSports();
  const [venues, setVenues] = useState([]);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  useEffect(() => { api.get('/venues').then((r) => setVenues(r.data)); }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content">
            <span className="badge-pill">⚡ Cek slot kosong secara real-time</span>
            <h1>Main kapan saja,<br /><span className="grad-text">booking dalam detik.</span></h1>
            <p>Futsal, badminton, basket, padel, sampai mini soccer — temukan lapangan terdekat dan amankan jadwalmu sekarang.</p>
            <form className="search-box" onSubmit={(e) => { e.preventDefault(); nav(`/venues?q=${encodeURIComponent(q)}`); }}>
              <input className="input" id="hero-search" placeholder="Cari nama venue atau lokasi..." value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn btn-primary" id="hero-search-btn">🔍 Cari Lapangan</button>
            </form>
          </div>
        </div>
      </section>

      <section className="container mt">
        <h2 style={{ marginBottom: 16 }}>Pilih olahraga</h2>
        <div className="chips">
          {sports.map((s) => (
            <Link key={s.id} to={`/venues?sport_id=${s.id}`} className="chip" id={`sport-${s.id}`}>{s.icon} {s.name}</Link>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: 48 }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <h2>Venue populer</h2>
          <Link to="/venues" className="btn btn-sm">Lihat semua →</Link>
        </div>
        <div className="venue-grid">{venues.slice(0, 6).map((v) => <VenueCard key={v.id} v={v} />)}</div>
      </section>

      <section className="container" style={{ marginTop: 60 }}>
        <div className="stats">
          {[['🔎', 'Cari venue', 'Filter olahraga & kota'], ['🗓️', 'Pilih slot', 'Lihat jam kosong langsung'], ['✅', 'Booking', 'Konfirmasi dari pengelola'], ['🏆', 'Main!', 'Datang & nikmati permainan']].map(([i, t, d]) => (
            <div key={t} className="card stat"><div className="icon">{i}</div><div className="value" style={{ fontSize: '1.2rem' }}>{t}</div><div className="label">{d}</div></div>
          ))}
        </div>
      </section>
    </>
  );
}

export function Venues() {
  const sports = useSports();
  const [params, setParams] = useSearchParams();
  const [cities, setCities] = useState([]);
  const [venues, setVenues] = useState(null);
  const filters = Object.fromEntries(params);

  useEffect(() => { api.get('/cities').then((r) => setCities(r.data)); }, []);
  useEffect(() => { setVenues(null); api.get('/venues', { params: filters }).then((r) => setVenues(r.data)); }, [params]);

  const set = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p); };

  return (
    <main className="container mt">
      <h1 style={{ fontSize: '2rem' }}>Cari <span className="grad-text">Lapangan</span></h1>
      <div className="row mt">
        <input className="input" style={{ maxWidth: 320 }} id="filter-q" placeholder="Cari venue..." defaultValue={filters.q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} />
        <select className="input" style={{ maxWidth: 200 }} id="filter-city" value={filters.city || ''} onChange={(e) => set('city', e.target.value)}>
          <option value="">Semua kota</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="chips mt" style={{ marginTop: 16 }}>
        <button className={`chip ${!filters.sport_id ? 'active' : ''}`} onClick={() => set('sport_id', '')}>Semua</button>
        {sports.map((s) => (
          <button key={s.id} id={`chip-sport-${s.id}`} className={`chip ${filters.sport_id == s.id ? 'active' : ''}`} onClick={() => set('sport_id', s.id)}>{s.icon} {s.name}</button>
        ))}
      </div>
      <div className="mt">
        {!venues ? <div className="spinner" /> : venues.length ? (
          <div className="venue-grid">{venues.map((v) => <VenueCard key={v.id} v={v} />)}</div>
        ) : <div className="empty card">Tidak ada venue yang cocok 😔</div>}
      </div>
    </main>
  );
}

export function VenueDetail() {
  const { slug } = useParams();
  const { user, toast } = useApp();
  const nav = useNavigate();
  const [venue, setVenue] = useState(null);
  const [courtId, setCourtId] = useState(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => today(i)), []);
  const court = venue?.courts.find((c) => c.id === courtId);

  useEffect(() => {
    api.get(`/venues/${slug}`).then((r) => { setVenue(r.data); setCourtId(r.data.courts[0]?.id); });
  }, [slug]);

  const loadSlots = () => venue && api.get(`/venues/${venue.id}/availability`, { params: { date } }).then((r) => setSlots(r.data));
  useEffect(() => { loadSlots(); setSelected([]); }, [venue, date, courtId]);

  // Pilih slot berurutan (jam berturut-turut)
  const toggle = (hr) => {
    if (!selected.length) return setSelected([hr]);
    const min = Math.min(...selected), max = Math.max(...selected);
    if (selected.includes(hr)) return setSelected(hr === min || hr === max ? selected.filter((h) => h !== hr) : [hr]);
    if (hr === max + 1 || hr === min - 1) return setSelected([...selected, hr]);
    setSelected([hr]);
  };

  const weekend = [0, 6].includes(new Date(`${date}T00:00:00`).getDay());
  const price = court ? (weekend ? court.price_weekend : court.price_per_hour) : 0;

  const book = async () => {
    if (!user) return nav('/login', { state: { from: `/venue/${slug}` } });
    setSaving(true);
    try {
      const r = await api.post('/bookings', { court_id: courtId, date, start_hour: Math.min(...selected), duration: selected.length });
      toast(`Booking ${r.data.code} berhasil! Menunggu konfirmasi admin.`);
      nav('/my-bookings');
    } catch (e) {
      toast(errMsg(e), 'error');
      loadSlots();
    } finally { setSaving(false); }
  };

  if (!venue) return <div className="spinner" />;
  return (
    <main className="container mt">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row between">
          <div>
            <h1 style={{ fontSize: '2rem' }}>{venue.name}</h1>
            <p className="muted">📍 {venue.address}, {venue.city} · 🕒 {jam(venue.open_time)}–{jam(venue.close_time)} · 📞 {venue.phone}</p>
          </div>
        </div>
        {venue.description && <p style={{ marginTop: 12 }}>{venue.description}</p>}
      </div>

      <div className="booking-layout">
        <div className="grid">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>1. Pilih lapangan</h3>
            <div className="court-tabs">
              {venue.courts.map((c) => (
                <button key={c.id} id={`court-${c.id}`} className={`court-tab ${c.id === courtId ? 'active' : ''}`} onClick={() => setCourtId(c.id)}>
                  <b>{c.icon} {c.name}</b><br /><small className="muted">{rupiah(c.price_per_hour)}/jam</small>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>2. Pilih tanggal</h3>
            <div className="date-strip">
              {dates.map((d) => (
                <button key={d} id={`date-${d}`} className={`date-item ${d === date ? 'active' : ''}`} onClick={() => setDate(d)}>
                  <small>{tgl(d, { weekday: 'short' })}</small><b>{tgl(d, { day: 'numeric' })}</b><small>{tgl(d, { month: 'short' })}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <h3>3. Pilih jam</h3>
              <div className="legend">
                <span><i style={{ background: 'hsl(165 70% 45% / .3)' }} />Kosong</span>
                <span><i style={{ background: 'hsl(350 70% 55% / .3)' }} />Terisi</span>
                <span><i style={{ background: 'var(--grad)' }} />Dipilih</span>
              </div>
            </div>
            <div className="slots">
              {slots.map((s) => {
                const booked = s.bookedCourts.includes(courtId);
                const cls = booked ? 'booked' : s.past ? 'past' : selected.includes(s.hour) ? 'selected' : '';
                return (
                  <button key={s.hour} id={`slot-${s.hour}`} className={`slot ${cls}`} disabled={booked || s.past} onClick={() => toggle(s.hour)}>
                    {jam(s.start)}<small>{booked ? 'Terisi' : s.past ? 'Lewat' : 'Kosong'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="card sticky">
          <h3>Ringkasan</h3>
          {selected.length ? (
            <div className="grid" style={{ gap: 10, marginTop: 16 }}>
              <div className="row between"><span className="muted">Lapangan</span><b>{court?.name}</b></div>
              <div className="row between"><span className="muted">Tanggal</span><b>{tgl(date)}</b></div>
              <div className="row between"><span className="muted">Jam</span><b>{String(Math.min(...selected)).padStart(2, '0')}:00 – {String(Math.max(...selected) + 1).padStart(2, '0')}:00</b></div>
              <div className="row between"><span className="muted">Durasi</span><b>{selected.length} jam × {rupiah(price)}</b></div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="row between"><span>Total</span><span className="price grad-text" style={{ fontSize: '1.5rem' }}>{rupiah(price * selected.length)}</span></div>
              <button className="btn btn-primary btn-lg" id="btn-book" disabled={saving} onClick={book}>{saving ? 'Memproses...' : user ? 'Booking Sekarang' : 'Masuk untuk Booking'}</button>
              <small className="muted">Booking akan dikonfirmasi oleh pengelola venue.</small>
            </div>
          ) : <p className="muted" style={{ marginTop: 12 }}>Pilih slot jam yang tersedia. Klik jam bersebelahan untuk durasi lebih dari 1 jam.</p>}
        </aside>
      </div>
    </main>
  );
}

export function MyBookings() {
  const { toast } = useApp();
  const [rows, setRows] = useState(null);
  const load = () => api.get('/bookings/me').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const cancel = async (id) => {
    if (!confirm('Batalkan booking ini?')) return;
    try { await api.patch(`/bookings/${id}/cancel`); toast('Booking dibatalkan'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  return (
    <main className="container mt">
      <h1 style={{ fontSize: '2rem', marginBottom: 20 }}>Booking <span className="grad-text">Saya</span></h1>
      {!rows ? <div className="spinner" /> : !rows.length ? <div className="card empty">Belum ada booking. <Link to="/venues" className="grad-text">Cari lapangan →</Link></div> : (
        <div className="grid">
          {rows.map((b) => (
            <div key={b.id} className="card row between">
              <div>
                <div className="row"><b>{b.icon} {b.venue_name} — {b.court_name}</b><span className={`badge ${b.status}`}>{b.status}</span></div>
                <p className="muted" style={{ marginTop: 6 }}>{tgl(b.date)} · {jam(b.start_time)}–{jam(b.end_time)} · Kode <b>{b.code}</b></p>
              </div>
              <div className="row">
                <span className="price">{rupiah(b.total_price)}</span>
                {['pending', 'confirmed'].includes(b.status) && b.date >= today() && (
                  <button className="btn btn-sm btn-danger" id={`cancel-${b.id}`} onClick={() => cancel(b.id)}>Batalkan</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const DEMO = [['Super Admin', 'super@arenaku.id'], ['Owner Aulia', 'owner@aulia.id'], ['Admin Aulia', 'admin@aulia.id'], ['Admin Lidya', 'admin1@lidya.id'], ['Owner Lidya', 'owner@lidya.id'], ['Member', 'member@arenaku.id']];

export function AuthPage({ mode }) {
  const { login, toast } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e, data = f) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const r = await api.post(`/auth/${mode}`, data);
      login(r.data);
      toast(`Selamat datang, ${r.data.user.name}!`);
      nav(r.data.user.role === 'member' ? (history.state?.usr?.from || '/') : '/admin');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setLoading(false); }
  };

  return (
    <main className="auth-wrap">
      <form className="card auth-card grid" style={{ gap: 14 }} onSubmit={submit}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>{mode === 'login' ? 'Masuk' : 'Daftar'} ke <span className="grad-text">ArenaKu</span></h1>
          <p className="muted">{mode === 'login' ? 'Lanjutkan booking lapangan favoritmu.' : 'Buat akun member gratis.'}</p>
        </div>
        {mode === 'register' && (
          <>
            <div className="field"><label>Nama lengkap</label><input className="input" id="reg-name" required value={f.name} onChange={set('name')} /></div>
            <div className="field"><label>No. HP</label><input className="input" id="reg-phone" value={f.phone} onChange={set('phone')} /></div>
          </>
        )}
        <div className="field"><label>Email</label><input className="input" id="auth-email" type="email" required value={f.email} onChange={set('email')} /></div>
        <div className="field"><label>Password</label><input className="input" id="auth-password" type="password" required value={f.password} onChange={set('password')} /></div>
        <button className="btn btn-primary btn-lg" id="auth-submit" disabled={loading}>{loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        <p className="muted" style={{ textAlign: 'center' }}>
          {mode === 'login' ? <>Belum punya akun? <Link to="/register" className="grad-text">Daftar</Link></> : <>Sudah punya akun? <Link to="/login" className="grad-text">Masuk</Link></>}
        </p>
        {mode === 'login' && (
          <div>
            <p className="muted" style={{ fontSize: '.8rem', marginBottom: 8 }}>Akun demo (password: <b>password</b>):</p>
            <div className="demo-accounts">
              {DEMO.map(([label, email]) => (
                <button type="button" key={email} className="btn btn-sm" onClick={() => submit(null, { email, password: 'password' })}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
