import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, getIsSupabaseActive, getSupabase } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

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
    const isSupabaseActive = getIsSupabaseActive();
    const supabase = getSupabase();

    if (isSupabaseActive && supabase) {
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
    return res.status(400).json({ message: 'Login ID / Email and password are required' });
  }

  try {
    const cleanEmail = String(email).trim();
    const cleanPassword = String(password).trim();

    // 1. Check user profile in database by email address or staff ID or shorthand
    const profile = await db.getUserByEmail(cleanEmail);

    if (profile) {
      let isPasswordMatch = false;
      if (profile.password_hash) {
        isPasswordMatch = await bcrypt.compare(cleanPassword, profile.password_hash);
      }

      // Demo account safety fallback: allow default password mzcet@1234
      if (!isPasswordMatch && (cleanPassword === 'mzcet@1234' || password === 'mzcet@1234')) {
        const demoEmails = ['staff@mzcet.edu.in', 'hod.it@mzcet.edu.in', 'admin@mzcet.edu.in'];
        const demoStaff = ['mzcet@it_coordinator', 'mzcet@it_hod', 'mzcet@admin'];
        if (demoEmails.includes(profile.email) || demoStaff.includes(profile.staff_id)) {
          isPasswordMatch = true;
          try {
            const newHash = await bcrypt.hash('mzcet@1234', 10);
            await db.updateUser(profile.id, { password_hash: newHash });
          } catch (e) { }
        }
      }

      if (isPasswordMatch) {
        const token = jwt.sign(
          { id: profile.id, email: profile.email, role: profile.role },
          process.env.JWT_SECRET || 'mzcet_facultyreport_secure_jwt_secret_key_2026',
          { expiresIn: '24h' }
        );

        return res.json({
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
    }

    // 2. Fallback to Supabase Auth if profile wasn't matched or password didn't match
    const isSupabaseActive = getIsSupabaseActive();
    const supabase = getSupabase();
    if (isSupabaseActive && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (!error && data?.user) {
          const suProfile = await db.getUserBySupabaseUid(data.user.id);
          if (suProfile) {
            return res.json({
              token: data.session.access_token,
              user: {
                id: suProfile.id,
                email: suProfile.email,
                name: suProfile.name,
                role: suProfile.role,
                staff_id: suProfile.staff_id,
                department_id: suProfile.department_id,
                department_name: suProfile.department_name
              }
            });
          }
        }
      } catch (suErr) {
        console.warn('Supabase Auth fallback check error:', suErr.message);
      }
    }

    return res.status(400).json({ message: 'Invalid Login ID / Email address or password' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'An error occurred during authentication' });
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
    const isSupabaseActive = getIsSupabaseActive();
    const supabase = getSupabase();
    if (isSupabaseActive && supabase) {
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
