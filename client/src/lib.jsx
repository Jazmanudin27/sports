import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || 'Terjadi kesalahan';
export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
export const jam = (t) => t?.slice(0, 5);
export const tgl = (d, opt = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', opt);
export const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const ROLE_LABEL = { super_admin: 'Super Admin', owner: 'Owner', admin: 'Admin', member: 'Member' };

// ===== DAFTAR TEMA WARNA (DEFAULT: BIRU ROYAL) =====
export const THEMES = {
  blue: {
    id: 'blue',
    name: 'Biru Royal (Default)',
    primary: '#0056fb',
    primaryDark: '#0042c7',
    gradient: 'linear-gradient(180deg, #0056fb 0%, #0046d1 50%, #0036a1 100%)',
    accent: '#38bdf8',
    cardHeader: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    badgeColor: '#0056fb',
  },
  red: {
    id: 'red',
    name: 'Merah Alfagift',
    primary: '#e11d48',
    primaryDark: '#be123c',
    gradient: 'linear-gradient(180deg, #e11d48 0%, #be123c 50%, #9f1239 100%)',
    accent: '#fb7185',
    cardHeader: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    badgeColor: '#e11d48',
  },
  emerald: {
    id: 'emerald',
    name: 'Hijau Sport Turf',
    primary: '#10b981',
    primaryDark: '#059669',
    gradient: 'linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%)',
    accent: '#34d399',
    cardHeader: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    badgeColor: '#10b981',
  },
  purple: {
    id: 'purple',
    name: 'Ungu Modern',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    gradient: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
    accent: '#a78bfa',
    cardHeader: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    badgeColor: '#7c3aed',
  },
  dark: {
    id: 'dark',
    name: 'Onyx Midnight',
    primary: '#0f172a',
    primaryDark: '#020617',
    gradient: 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
    accent: '#38bdf8',
    cardHeader: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    badgeColor: '#0f172a',
  },
};

// ===== Auth + Toast + Theme Context =====
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Tema aktif (Default: 'blue')
  const [themeId, setThemeId] = useState(() => localStorage.getItem('arenaku_theme') || 'blue');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Terapkan CSS Variables ketika tema berubah
  useEffect(() => {
    const activeTheme = THEMES[themeId] || THEMES.blue;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', activeTheme.primary);
    root.style.setProperty('--theme-primary-dark', activeTheme.primaryDark);
    root.style.setProperty('--theme-gradient', activeTheme.gradient);
    root.style.setProperty('--theme-accent', activeTheme.accent);
    root.style.setProperty('--theme-card-header', activeTheme.cardHeader);
    root.style.setProperty('--theme-badge-color', activeTheme.badgeColor);
    localStorage.setItem('arenaku_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {}).finally(() => setReady(true));
  }, []);

  const toast = useCallback((text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const changeTheme = (newThemeId) => {
    if (THEMES[newThemeId]) {
      setThemeId(newThemeId);
      toast(`Warna tema diubah ke ${THEMES[newThemeId].name}`);
    }
  };

  return (
    <Ctx.Provider value={{ 
      user, 
      ready, 
      login, 
      logout, 
      toast, 
      themeId, 
      setTheme: changeTheme, 
      THEMES,
      openThemeModal: () => setShowThemeModal(true),
      closeThemeModal: () => setShowThemeModal(false)
    }}>
      {children}
      {toastMsg && (
        <div className={`toast ${toastMsg.type}`}>
          {toastMsg.type === 'error' ? '⚠️' : '✅'} {toastMsg.text}
        </div>
      )}

      {/* Modal Pengaturan Warna Tema */}
      {showThemeModal && (
        <div className="modal-backdrop" onClick={() => setShowThemeModal(false)}>
          <div className="theme-selector-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="theme-sheet-header">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🎨</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Pengaturan Warna Tema</h3>
                  <small className="muted">Pilih warna tampilan aplikasi favoritmu</small>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowThemeModal(false)}>✕</button>
            </div>

            <div className="theme-options-grid">
              {Object.values(THEMES).map((t) => {
                const isSelected = t.id === themeId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`theme-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      changeTheme(t.id);
                      setShowThemeModal(false);
                    }}
                  >
                    <div className="color-preview-circle" style={{ background: t.gradient }}>
                      {isSelected && <span className="check-mark">✓</span>}
                    </div>
                    <span className="theme-name-label">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
