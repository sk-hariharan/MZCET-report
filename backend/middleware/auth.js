import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const isSupabaseActive = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = isSupabaseActive 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) 
  : null;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    if (isSupabaseActive) {
      // Supabase Authentication token verification
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(403).json({ message: 'Invalid or expired session token' });
      }

      // Query local/Supabase user record associated with this UID
      const profile = await db.getUserBySupabaseUid(user.id);
      if (!profile) {
        return res.status(404).json({ message: 'User profile not found in relational database' });
      }

      req.user = profile;
    } else {
      // Local SQLite Mode: Validate local JWT signature
      jwt.verify(token, process.env.JWT_SECRET || 'mzcet_facultyreport_secure_jwt_secret_key_2026', async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired session token' });
        }

        const profile = await db.getUserById(decoded.id);
        if (!profile) {
          return res.status(404).json({ message: 'User profile not found' });
        }

        req.user = profile;
        next();
      });
      return;
    }
    next();
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
