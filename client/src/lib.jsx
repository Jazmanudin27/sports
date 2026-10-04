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

// ===== Auth + Toast context =====
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

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

  return (
    <Ctx.Provider value={{ user, ready, login, logout, toast }}>
      {children}
      {toastMsg && <div className={`toast ${toastMsg.type}`}>{toastMsg.type === 'error' ? '⚠️' : '✅'} {toastMsg.text}</div>}
    </Ctx.Provider>
  );
}
