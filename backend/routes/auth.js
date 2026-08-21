import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const isSupabaseActive = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = isSupabaseActive 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) 
  : null;

// 1. User Registration
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    name,
    staff_id,
    role,
    department_id,
    designation,
    phone,
    qualification,
    specialization,
    date_of_joining,
    academic_year,
    semester
  } = req.body;

  if (!email || !name || !staff_id || !role) {
    return res.status(400).json({ message: 'Email, name, staff ID, and role are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    let supabaseUid = null;
    let passwordHash = null;

    if (isSupabaseActive) {
      // Create user in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            staff_id
          }
        }
      });

      if (authErr) {
        return res.status(400).json({ message: authErr.message });
      }
      if (authData?.user) {
        supabaseUid = authData.user.id;
      }
    } else {
      // Local SQLite Mode: hash password
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Save user profile in database
    const userProfile = {
      email,
      password_hash: passwordHash,
      name,
      staff_id,
      role,
      department_id: department_id ? Number(department_id) : null,
      designation,
      phone,
      qualification,
      specialization,
      date_of_joining,
      academic_year,
      semester,
      supabase_uid: supabaseUid
    };

    const newUser = await db.createUser(userProfile);
    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, email, name, role } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Failed to complete registration' });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    if (isSupabaseActive) {
      // Log in via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      const profile = await db.getUserBySupabaseUid(data.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Login successful, but relational staff profile was not found' });
      }

      res.json({
        token: data.session.access_token,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          staff_id: profile.staff_id,
          department_id: profile.department_id,
          department_name: profile.department_name
        }
      });
    } else {
      // Local SQLite login check
      const profile = await db.getUserByEmail(email);
      if (!profile) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isPasswordMatch = await bcrypt.compare(password, profile.password_hash);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate local JWT token
      const token = jwt.sign(
        { id: profile.id, email: profile.email, role: profile.role },
        process.env.JWT_SECRET || 'mzcet_facultyreport_secure_jwt_secret_key_2026',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          staff_id: profile.staff_id,
          department_id: profile.department_id,
          department_name: profile.department_name
        }
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An error occurred during authentication' });
  }
});

// 3. Get Logged-in User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// 4. Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  const {
    name,
    phone,
    designation,
    qualification,
    specialization,
    date_of_joining,
    academic_year,
    semester,
    profile_photo
  } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (designation !== undefined) updateFields.designation = designation;
  if (qualification !== undefined) updateFields.qualification = qualification;
  if (specialization !== undefined) updateFields.specialization = specialization;
  if (date_of_joining !== undefined) updateFields.date_of_joining = date_of_joining;
  if (academic_year !== undefined) updateFields.academic_year = academic_year;
  if (semester !== undefined) updateFields.semester = semester;
  if (profile_photo !== undefined) updateFields.profile_photo = profile_photo;

  try {
    const updated = await db.updateUser(req.user.id, updateFields);
    res.json({ message: 'Profile updated successfully', user: { ...req.user, ...updated } });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// 5. Change Password Placeholder / Route
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    if (isSupabaseActive) {
      // In Supabase mode, we must update using Supabase Auth. Since the token represents the user session:
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      res.json({ message: 'Password changed successfully' });
    } else {
      const user = await db.getUserById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await db.updateUser(req.user.id, { password_hash: newHash });
      res.json({ message: 'Password changed successfully' });
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;
