import { Router } from 'express';
import { auth, role, scope } from '../middleware/auth.js';
import { h } from '../utils/helpers.js';
import * as A from '../controllers/auth.controller.js';
import * as P from '../controllers/public.controller.js';
import * as B from '../controllers/booking.controller.js';
import * as M from '../controllers/admin.controller.js';

const r = Router();
const staff = [auth, role('super_admin', 'owner', 'admin'), scope];
const managers = [auth, role('super_admin', 'owner'), scope];
const superOnly = [auth, role('super_admin')];

// Auth
r.post('/auth/login', h(A.login));
r.post('/auth/register', h(A.register));
r.get('/auth/me', auth, h(A.me));

// Publik
r.get('/sports', h(P.sports));
r.get('/cities', h(P.cities));
r.get('/venues', h(P.venues));
r.get('/venues/:slug', h(P.venueDetail));
r.get('/venues/:companyId/availability', h(P.availability));

// Member
r.post('/bookings', auth, h(B.memberCreate));
r.get('/bookings/me', auth, h(B.myBookings));
r.patch('/bookings/:id/cancel', auth, h(B.memberCancel));

// Admin / Owner / Super Admin
r.get('/admin/dashboard', ...staff, h(M.dashboard));
r.get('/admin/bookings', ...staff, h(B.adminList));
r.post('/admin/bookings', ...staff, h(B.adminCreate));
r.patch('/admin/bookings/:id/status', ...staff, h(B.adminUpdateStatus));
r.get('/admin/courts', ...staff, h(M.courtList));
r.post('/admin/courts', ...staff, h(M.courtSave));
r.put('/admin/courts/:id', ...staff, h(M.courtSave));
r.get('/admin/finance', ...staff, h(M.financeList));
r.post('/admin/finance', ...staff, h(M.financeCreate));
r.delete('/admin/finance/:id', ...staff, h(M.financeDelete));
r.get('/admin/categories', ...staff, h(M.categories));
r.get('/admin/users', ...managers, h(M.userList));
r.post('/admin/users', ...managers, h(M.userCreate));
r.delete('/admin/users/:id', ...managers, h(M.userDelete));

// Super Admin
r.get('/admin/companies', ...superOnly, h(M.companyList));
r.post('/admin/companies', ...superOnly, h(M.companySave));
r.put('/admin/companies/:id', ...superOnly, h(M.companySave));

export default r;
