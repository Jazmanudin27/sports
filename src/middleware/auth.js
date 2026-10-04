import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Silakan login' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Sesi berakhir, login ulang' });
  }
}

export const role = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Akses ditolak' });

/** Tentukan company_id yang boleh diakses. Super admin boleh pilih via ?company_id= */
export function scope(req, res, next) {
  if (req.user.role === 'super_admin') {
    req.companyId = req.query.company_id || req.body?.company_id || null;
  } else {
    req.companyId = req.user.company_id;
    if (!req.companyId) return res.status(403).json({ message: 'Akun tidak terhubung ke perusahaan' });
  }
  next();
}

/** Helper: kondisi SQL berdasarkan scope (null = semua perusahaan untuk super admin) */
export const scopeSql = (req, col = 'company_id') =>
  req.companyId ? { sql: ` AND ${col} = ?`, params: [req.companyId] } : { sql: '', params: [] };
