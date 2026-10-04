import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg, useApp } from '../lib.jsx';

const DEMO = [
  ['Super Admin', 'super@arenaku.id'],
  ['Owner Aulia', 'owner@aulia.id'],
  ['Admin Aulia', 'admin@aulia.id'],
  ['Owner Lidya', 'owner@lidya.id'],
  ['Admin Lidya', 'admin1@lidya.id'],
  ['Member', 'member@arenaku.id'],
];

/**
 * Halaman Login & Register
 */
export function AuthPage({ mode }) {
  const { login, toast } = useApp();
  const navigate = useNavigate();
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
      navigate(r.data.user.role === 'member' ? '/' : '/admin');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap" style={{ paddingBottom: 60 }}>
      <form className="card auth-card grid" style={{ gap: 14 }} onSubmit={submit}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>
            {mode === 'login' ? 'Masuk' : 'Daftar'} ke <span className="grad-text">ArenaKu</span>
          </h1>
          <p className="muted">
            {mode === 'login'
              ? 'Lanjutkan booking lapangan olahraga favoritmu.'
              : 'Daftar akun member gratis & cepat.'}
          </p>
        </div>

        {mode === 'register' && (
          <>
            <div className="field">
              <label>Nama Lengkap</label>
              <input
                className="input"
                id="reg-name"
                required
                value={f.name}
                onChange={set('name')}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div className="field">
              <label>No. WhatsApp / HP</label>
              <input
                className="input"
                id="reg-phone"
                value={f.phone}
                onChange={set('phone')}
                placeholder="08123456789"
              />
            </div>
          </>
        )}

        <div className="field">
          <label>Email</label>
          <input
            className="input"
            id="auth-email"
            type="email"
            required
            value={f.email}
            onChange={set('email')}
            placeholder="nama@email.com"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            className="input"
            id="auth-password"
            type="password"
            required
            value={f.password}
            onChange={set('password')}
            placeholder="Minimal 6 karakter"
          />
        </div>

        <button className="btn btn-primary btn-lg" id="auth-submit" disabled={loading}>
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
        </button>

        <p className="muted" style={{ textAlign: 'center', fontSize: '.9rem' }}>
          {mode === 'login' ? (
            <>
              Belum punya akun?{' '}
              <Link to="/register" className="grad-text">
                Daftar Akun Baru
              </Link>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <Link to="/login" className="grad-text">
                Masuk ke Akun
              </Link>
            </>
          )}
        </p>

        {mode === 'login' && (
          <div style={{ marginTop: 6, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <p className="muted" style={{ fontSize: '.8rem', marginBottom: 8 }}>
              ⚡ Akun demo 1-Klik (Password: <b>password</b>):
            </p>
            <div className="demo-accounts">
              {DEMO.map(([label, email]) => (
                <button
                  type="button"
                  key={email}
                  className="btn btn-sm"
                  onClick={() => submit(null, { email, password: 'password' })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
export default AuthPage;
