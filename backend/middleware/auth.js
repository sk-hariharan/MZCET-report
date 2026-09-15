import jwt from 'jsonwebtoken';
import { db, getIsSupabaseActive, getSupabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    // 1. Try backend JWT token verification first
    const secret = process.env.JWT_SECRET || 'mzcet_facultyreport_secure_jwt_secret_key_2026';
    try {
      const decoded = jwt.verify(token, secret);
      if (decoded && decoded.id) {
        const profile = await db.getUserById(decoded.id);
        if (profile) {
          req.user = profile;
          return next();
        }
      }
    } catch (jwtErr) {
      // Fallback to Supabase Auth token check below
    }

    // 2. Try Supabase Auth token verification
    const isSupabaseActive = getIsSupabaseActive();
    const supabase = getSupabase();
    if (isSupabaseActive && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        const profile = await db.getUserBySupabaseUid(user.id);
        if (profile) {
          req.user = profile;
          return next();
        }
      }
    }

    return res.status(403).json({ message: 'Invalid or expired session token' });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Internal authentication error' });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
    next();
  };
}
