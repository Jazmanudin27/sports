import { createContext, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, errMsg, jam, ROLE_LABEL, rupiah, tgl, today, useApp } from '../lib.jsx';

// company_id aktif (hanya berpengaruh untuk super admin)
const AdminCtx = createContext({});
const useAdmin = () => useContext(AdminCtx);

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ marginBottom: 18 }}><h3>{title}</h3><button className="btn btn-sm" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { user, ready, logout } = useApp();
  const nav = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const isSuper = user?.role === 'super_admin';

  useEffect(() => { if (isSuper) api.get('/admin/companies').then((r) => setCompanies(r.data)); }, [isSuper]);

  if (!ready) return <div className="spinner" />;
  if (!user || user.role === 'member') return <Navigate to="/login" />;

  const links = [
    ['/admin', '📊', 'Dashboard', true],
    ['/admin/bookings', '🗓️', 'Booking'],
    ['/admin/courts', '🏟️', 'Lapangan'],
    ['/admin/finance', '💰', 'Keuangan'],
    ...(['super_admin', 'owner'].includes(user.role) ? [['/admin/users', '👥', 'Pengguna']] : []),
    ...(isSuper ? [['/admin/companies', '🏢', 'Perusahaan']] : []),
  ];
  const params = companyId ? { company_id: companyId } : {};

  return (
    <AdminCtx.Provider value={{ companyId, params, isSuper, companies, refreshCompanies: () => api.get('/admin/companies').then((r) => setCompanies(r.data)) }}>
      <div className="admin">
        <aside className="sidebar">
          <Link to="/" className="logo"><span className="dot" />Arena<span className="grad-text">Ku</span></Link>
          {links.map(([to, i, label, end]) => (
            <NavLink key={to} to={to} end={end} className="side-link" id={`side-${label.toLowerCase()}`}><span>{i}</span>{label}</NavLink>
          ))}
          <Link to="/" className="side-link"><span>🌐</span>Lihat Situs</Link>
          <div className="side-foot">
            <b>{user.name}</b>
            <div className="muted" style={{ fontSize: '.8rem' }}>{ROLE_LABEL[user.role]}{user.company_name ? ` · ${user.company_name}` : ''}</div>
            <button className="btn btn-sm" style={{ marginTop: 10, width: '100%' }} id="btn-logout" onClick={() => { logout(); nav('/'); }}>Keluar</button>
          </div>
        </aside>
        <main className="admin-main">
          {isSuper && (
            <div className="row" style={{ marginBottom: 18 }}>
              <span className="muted">🏢 Lihat data:</span>
              <select className="input" style={{ maxWidth: 260 }} id="company-switch" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">Semua perusahaan</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <Outlet key={companyId} />
        </main>
      </div>
    </AdminCtx.Provider>
  );
}

const COLORS = ['hsl(165 85% 48%)', 'hsl(84 85% 55%)', 'hsl(210 95% 65%)', 'hsl(38 95% 58%)', 'hsl(280 80% 65%)', 'hsl(350 85% 62%)'];
const tip = { contentStyle: { background: 'hsl(222 35% 12%)', border: '1px solid hsl(220 30% 22%)', borderRadius: 12 } };

export function Dashboard() {
  const { params } = useAdmin();
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/admin/dashboard', { params }).then((r) => setD(r.data)); }, []);
  if (!d) return <div className="spinner" />;

  const stats = [
    ['💵', 'Pendapatan hari ini', rupiah(d.income_today)],
    ['📈', 'Pendapatan bulan ini', rupiah(d.income_month)],
    ['🧾', 'Laba bulan ini', rupiah(d.income_month - d.expense_month)],
    ['🗓️', 'Booking hari ini', d.bookings_today],
    ['⏳', 'Menunggu konfirmasi', d.pending],
    ['🔥', 'Okupansi hari ini', `${d.occupancy}%`],
  ];
  return (
    <>
      <div className="page-head"><div><h1>Dashboard</h1><p className="muted">{tgl(today(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        <Link to="/admin/bookings" className="btn btn-primary">+ Booking Manual</Link></div>
      <div className="stats">
        {stats.map(([i, l, v], idx) => (
          <div key={l} className="card stat" style={{ animationDelay: `${idx * 60}ms` }}><div className="icon">{i}</div><div className="value">{v}</div><div className="label">{l}</div></div>
        ))}
      </div>

      <div className="grid mt" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <div className="card" style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h3 style={{ marginBottom: 16 }}>Arus kas 30 hari</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={d.daily.map((x) => ({ ...x, income: +x.income, expense: +x.expense, label: tgl(x.date, { day: 'numeric', month: 'short' }) }))}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.5} /><stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} /></linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[5]} stopOpacity={0.4} /><stop offset="100%" stopColor={COLORS[5]} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(220 30% 20%)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...tip} formatter={(v) => rupiah(v)} />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke={COLORS[0]} fill="url(#gi)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke={COLORS[5]} fill="url(#ge)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Booking per olahraga</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.bySport.map((s) => ({ name: `${s.icon} ${s.name}`, value: s.total }))} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {d.bySport.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="row" style={{ justifyContent: 'center', fontSize: '.85rem' }}>
            {d.bySport.map((s, i) => <span key={s.name}><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} /> {s.name}</span>)}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Lapangan terlaris (30 hari)</h3>
          {d.topCourts.map((c, i) => (
            <div key={i} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{c.icon} <b>{c.name}</b> <small className="muted">{c.venue_name}</small></span>
              <span><b className="grad-text">{rupiah(c.revenue)}</b> <small className="muted">· {c.total}x</small></span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Jadwal hari ini</h3>
          {!d.upcoming.length && <p className="muted">Belum ada booking hari ini.</p>}
          {d.upcoming.map((b) => (
            <div key={b.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span><b>{jam(b.start_time)}</b> {b.icon} {b.court_name} <small className="muted">· {b.customer}</small></span>
              <span className={`badge ${b.status}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const STATUS = ['pending', 'confirmed', 'paid', 'done', 'cancelled'];

export function Bookings() {
  const { params, isSuper, companyId } = useAdmin();
  const { toast } = useApp();
  const [f, setF] = useState({ date: today(), status: '', q: '' });
  const [rows, setRows] = useState(null);
  const [courts, setCourts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ court_id: '', date: today(), start_hour: 18, duration: 1, guest_name: '', guest_phone: '', paid: false });

  const load = () => api.get('/admin/bookings', { params: { ...params, ...f } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [f]);
  useEffect(() => { api.get('/admin/courts', { params }).then((r) => setCourts(r.data.filter((c) => c.is_active))); }, []);

  const setStatus = async (id, status) => {
    try { await api.patch(`/admin/bookings/${id}/status`, { status }); toast(`Status: ${status}`); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const create = async (e) => {
    e.preventDefault();
    try {
      const court = courts.find((c) => c.id == form.court_id);
      await api.post('/admin/bookings', { ...form, company_id: court?.company_id });
      toast('Booking manual dibuat'); setModal(false); load();
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <>
      <div className="page-head"><h1>Booking</h1><button className="btn btn-primary" id="btn-new-booking" onClick={() => setModal(true)}>+ Booking Manual</button></div>
      <div className="card">
        <div className="row" style={{ marginBottom: 16 }}>
          <input type="date" className="input" style={{ maxWidth: 180 }} id="bk-date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          <button className="btn btn-sm" onClick={() => setF({ ...f, date: '' })}>Semua tanggal</button>
          <select className="input" style={{ maxWidth: 170 }} id="bk-status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">Semua status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input className="input" style={{ maxWidth: 240 }} placeholder="Cari kode / nama..." id="bk-search" onKeyDown={(e) => e.key === 'Enter' && setF({ ...f, q: e.target.value })} />
        </div>
        <div className="table-wrap">
          {!rows ? <div className="spinner" /> : !rows.length ? <div className="empty">Tidak ada booking</div> : (
            <table>
              <thead><tr><th>Kode</th><th>Tanggal & Jam</th><th>Lapangan</th>{isSuper && !companyId && <th>Venue</th>}<th>Pelanggan</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.code}</b></td>
                    <td>{tgl(b.date, { day: 'numeric', month: 'short' })} · {jam(b.start_time)}–{jam(b.end_time)}</td>
                    <td>{b.icon} {b.court_name}</td>
                    {isSuper && !companyId && <td>{b.venue_name}</td>}
                    <td>{b.customer}<br /><small className="muted">{b.customer_phone}</small></td>
                    <td>{rupiah(b.total_price)}</td>
                    <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                    <td>
                      <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                        {b.status === 'pending' && <button className="btn btn-sm" onClick={() => setStatus(b.id, 'confirmed')}>✔ Konfirmasi</button>}
                        {['pending', 'confirmed'].includes(b.status) && <button className="btn btn-sm btn-primary" onClick={() => setStatus(b.id, 'paid')}>💵 Lunas</button>}
                        {b.status === 'paid' && <button className="btn btn-sm" onClick={() => setStatus(b.id, 'done')}>🏁 Selesai</button>}
                        {['pending', 'confirmed'].includes(b.status) && <button className="btn btn-sm btn-danger" onClick={() => confirm('Batalkan booking?') && setStatus(b.id, 'cancelled')}>✕</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Booking Manual (Walk-in)" onClose={() => setModal(false)}>
          <form className="grid" style={{ gap: 14 }} onSubmit={create}>
            <div className="field"><label>Lapangan</label>
              <select className="input" required id="mb-court" value={form.court_id} onChange={(e) => setForm({ ...form, court_id: e.target.value })}>
                <option value="">Pilih lapangan</option>
                {courts.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}{isSuper ? ` — ${c.venue_name}` : ''}</option>)}
              </select></div>
            <div className="form-grid">
              <div className="field"><label>Tanggal</label><input type="date" className="input" required value={form.date} min={today()} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="field"><label>Jam mulai</label><input type="number" className="input" min={0} max={23} required value={form.start_hour} onChange={(e) => setForm({ ...form, start_hour: e.target.value })} /></div>
              <div className="field"><label>Durasi (jam)</label><input type="number" className="input" min={1} max={8} required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Nama pelanggan</label><input className="input" required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} /></div>
              <div className="field"><label>No. HP</label><input className="input" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
            </div>
            <label className="row"><input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} /> Sudah dibayar (otomatis tercatat di keuangan)</label>
            <button className="btn btn-primary" id="mb-submit">Simpan Booking</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Courts() {
  const { params, isSuper, companyId } = useAdmin();
  const { toast } = useApp();
  const [rows, setRows] = useState([]);
  const [sports, setSports] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => api.get('/admin/courts', { params }).then((r) => setRows(r.data));
  useEffect(() => { load(); api.get('/sports').then((r) => setSports(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      edit.id ? await api.put(`/admin/courts/${edit.id}`, edit) : await api.post('/admin/courts', { ...edit, company_id: companyId });
      toast('Lapangan disimpan'); setEdit(null); load();
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <>
      <div className="page-head"><h1>Lapangan</h1>
        <button className="btn btn-primary" id="btn-new-court" disabled={isSuper && !companyId} title={isSuper && !companyId ? 'Pilih perusahaan dulu' : ''}
          onClick={() => setEdit({ sport_id: sports[0]?.id, name: '', price_per_hour: '', price_weekend: '', is_active: 1 })}>+ Tambah Lapangan</button></div>
      <div className="venue-grid">
        {rows.map((c) => (
          <div key={c.id} className="card card-hover" style={{ opacity: c.is_active ? 1 : 0.5 }}>
            <div className="row between"><span style={{ fontSize: '2rem' }}>{c.icon}</span><span className={`badge ${c.is_active ? 'paid' : 'cancelled'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></div>
            <h3 style={{ marginTop: 10 }}>{c.name}</h3>
            <p className="muted">{c.sport_name}{isSuper ? ` · ${c.venue_name}` : ''}</p>
            <div className="row between mt" style={{ marginTop: 14 }}>
              <div><small className="muted">Weekday / Weekend</small><br /><b>{rupiah(c.price_per_hour)}</b> / <b>{rupiah(c.price_weekend)}</b></div>
              <button className="btn btn-sm" onClick={() => setEdit(c)}>✏️ Edit</button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Lapangan' : 'Tambah Lapangan'} onClose={() => setEdit(null)}>
          <form className="grid" style={{ gap: 14 }} onSubmit={save}>
            <div className="field"><label>Nama lapangan</label><input className="input" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>Olahraga</label>
              <select className="input" value={edit.sport_id} onChange={(e) => setEdit({ ...edit, sport_id: e.target.value })}>
                {sports.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select></div>
            <div className="form-grid">
              <div className="field"><label>Harga/jam (weekday)</label><input type="number" className="input" required value={edit.price_per_hour} onChange={(e) => setEdit({ ...edit, price_per_hour: e.target.value })} /></div>
              <div className="field"><label>Harga/jam (weekend)</label><input type="number" className="input" value={edit.price_weekend} onChange={(e) => setEdit({ ...edit, price_weekend: e.target.value })} /></div>
            </div>
            <label className="row"><input type="checkbox" checked={!!edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked ? 1 : 0 })} /> Aktif (bisa dibooking)</label>
            <button className="btn btn-primary">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Finance() {
  const { params, isSuper, companyId } = useAdmin();
  const { toast } = useApp();
  const [f, setF] = useState({ from: today().slice(0, 8) + '01', to: today(), type: '' });
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => api.get('/admin/finance', { params: { ...params, ...f } }).then((r) => setData(r.data));
  useEffect(() => { load(); }, [f]);
  useEffect(() => { api.get('/admin/categories', { params }).then((r) => setCats(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/finance', { ...form, company_id: companyId }); toast('Transaksi dicatat'); setForm(null); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const del = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try { await api.delete(`/admin/finance/${id}`, { params }); toast('Transaksi dihapus'); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const newTx = (type) => setForm({ type, category: cats.find((c) => c.type === type)?.name || '', amount: '', note: '', date: today() });
  const noCompany = isSuper && !companyId;

  return (
    <>
      <div className="page-head"><h1>Keuangan</h1>
        <div className="row">
          <button className="btn" id="btn-income" disabled={noCompany} onClick={() => newTx('income')}>➕ Pemasukan</button>
          <button className="btn btn-danger" id="btn-expense" disabled={noCompany} onClick={() => newTx('expense')}>➖ Pengeluaran</button>
        </div></div>
      <div className="card row" style={{ marginBottom: 20 }}>
        <span className="muted">Periode</span>
        <input type="date" className="input" style={{ maxWidth: 170 }} id="fin-from" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <span className="muted">s/d</span>
        <input type="date" className="input" style={{ maxWidth: 170 }} id="fin-to" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        <select className="input" style={{ maxWidth: 170 }} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="">Semua jenis</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option>
        </select>
      </div>
      {!data ? <div className="spinner" /> : (
        <>
          <div className="stats">
            <div className="card stat"><div className="icon">📥</div><div className="value grad-text">{rupiah(data.summary.income)}</div><div className="label">Total pemasukan</div></div>
            <div className="card stat"><div className="icon">📤</div><div className="value" style={{ color: 'var(--danger)' }}>{rupiah(data.summary.expense)}</div><div className="label">Total pengeluaran</div></div>
            <div className="card stat"><div className="icon">💎</div><div className="value">{rupiah(data.summary.profit)}</div><div className="label">Laba / rugi bersih</div></div>
          </div>
          <div className="grid mt" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px' }}>
            <div className="card table-wrap">
              <table>
                <thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Keterangan</th>{isSuper && !companyId && <th>Venue</th>}<th style={{ textAlign: 'right' }}>Jumlah</th><th></th></tr></thead>
                <tbody>
                  {data.rows.map((t) => (
                    <tr key={t.id}>
                      <td>{tgl(t.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><span className={`badge ${t.type}`}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
                      <td>{t.category}</td>
                      <td className="muted">{t.note}</td>
                      {isSuper && !companyId && <td>{t.venue_name}</td>}
                      <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--primary)' : 'var(--danger)' }}>{t.type === 'income' ? '+' : '−'} {rupiah(t.amount)}</td>
                      <td>{!t.booking_id && <button className="btn btn-sm btn-danger" onClick={() => del(t.id)}>🗑</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.rows.length && <div className="empty">Tidak ada transaksi</div>}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Per kategori</h3>
              {data.byCategory.map((c) => (
                <div key={c.type + c.category} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span><span className={`badge ${c.type}`}>{c.type === 'income' ? '+' : '−'}</span> {c.category}</span><b>{rupiah(c.total)}</b>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {form && (
        <Modal title={form.type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'} onClose={() => setForm(null)}>
          <form className="grid" style={{ gap: 14 }} onSubmit={save}>
            <div className="form-grid">
              <div className="field"><label>Tanggal</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="field"><label>Kategori</label>
                <input className="input" list="cat-list" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <datalist id="cat-list">{cats.filter((c) => c.type === form.type).map((c) => <option key={c.name} value={c.name} />)}</datalist></div>
            </div>
            <div className="field"><label>Jumlah (Rp)</label><input type="number" className="input" id="fin-amount" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
            <div className="field"><label>Keterangan</label><input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <button className="btn btn-primary" id="fin-submit">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Users() {
  const { params, isSuper, companyId, companies } = useAdmin();
  const { toast, user } = useApp();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const load = () => api.get('/admin/users', { params }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/users', form); toast('User dibuat'); setForm(null); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const del = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try { await api.delete(`/admin/users/${id}`, { params }); toast('User dihapus'); load(); } catch (err) { toast(errMsg(err), 'error'); }
  };
  const roles = isSuper ? ['owner', 'admin', 'member', 'super_admin'] : ['admin'];

  return (
    <>
      <div className="page-head"><h1>Pengguna</h1>
        <button className="btn btn-primary" id="btn-new-user" onClick={() => setForm({ name: '', email: '', phone: '', password: '', role: roles[0], company_id: companyId || companies[0]?.id })}>+ Tambah User</button></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Nama</th><th>Email</th><th>No. HP</th><th>Role</th><th>Perusahaan</th><th></th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone}</td>
                <td><span className={`badge ${u.role === 'member' ? 'confirmed' : u.role === 'admin' ? 'done' : 'paid'}`}>{ROLE_LABEL[u.role]}</span></td>
                <td>{u.company_name || '—'}</td>
                <td>{u.id !== user.id && (isSuper || u.role === 'admin') && <button className="btn btn-sm btn-danger" onClick={() => del(u.id)}>🗑</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {form && (
        <Modal title="Tambah User" onClose={() => setForm(null)}>
          <form className="grid" style={{ gap: 14 }} onSubmit={save}>
            <div className="form-grid">
              <div className="field"><label>Nama</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>No. HP</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="field"><label>Email</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Password</label><input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Role</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
              {isSuper && ['owner', 'admin'].includes(form.role) && (
                <div className="field"><label>Perusahaan</label>
                  <select className="input" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              )}
            </div>
            <button className="btn btn-primary">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function Companies() {
  const { companies, refreshCompanies } = useAdmin();
  const { toast } = useApp();
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    try {
      edit.id ? await api.put(`/admin/companies/${edit.id}`, edit) : await api.post('/admin/companies', edit);
      toast('Perusahaan disimpan'); setEdit(null); refreshCompanies();
    } catch (err) { toast(errMsg(err), 'error'); }
  };
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });
  return (
    <>
      <div className="page-head"><h1>Perusahaan / Venue</h1>
        <button className="btn btn-primary" id="btn-new-company" onClick={() => setEdit({ name: '', city: '', address: '', phone: '', description: '', open_time: '08:00', close_time: '23:00', is_active: 1 })}>+ Tambah Perusahaan</button></div>
      <div className="venue-grid">
        {companies.map((c) => (
          <div key={c.id} className="card card-hover">
            <div className="row between"><h3>{c.name}</h3><span className={`badge ${c.is_active ? 'paid' : 'cancelled'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></div>
            <p className="muted" style={{ margin: '6px 0 14px' }}>📍 {c.address}, {c.city}</p>
            <div className="row between"><span className="muted">🏟️ {c.court_count} lapangan · 👥 {c.user_count} staf</span><button className="btn btn-sm" onClick={() => setEdit({ ...c, open_time: jam(c.open_time), close_time: jam(c.close_time) })}>✏️ Edit</button></div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Perusahaan' : 'Tambah Perusahaan'} onClose={() => setEdit(null)}>
          <form className="grid" style={{ gap: 14 }} onSubmit={save}>
            <div className="field"><label>Nama</label><input className="input" required value={edit.name} onChange={set('name')} /></div>
            <div className="form-grid">
              <div className="field"><label>Kota</label><input className="input" required value={edit.city} onChange={set('city')} /></div>
              <div className="field"><label>Telepon</label><input className="input" value={edit.phone || ''} onChange={set('phone')} /></div>
            </div>
            <div className="field"><label>Alamat</label><input className="input" value={edit.address || ''} onChange={set('address')} /></div>
            <div className="field"><label>Deskripsi</label><textarea className="input" rows={3} value={edit.description || ''} onChange={set('description')} /></div>
            <div className="form-grid">
              <div className="field"><label>Jam buka</label><input type="time" className="input" value={edit.open_time} onChange={set('open_time')} /></div>
              <div className="field"><label>Jam tutup</label><input type="time" className="input" value={edit.close_time} onChange={set('close_time')} /></div>
            </div>
            <label className="row"><input type="checkbox" checked={!!edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked ? 1 : 0 })} /> Aktif</label>
            <button className="btn btn-primary">Simpan</button>
          </form>
        </Modal>
      )}
    </>
  );
}
