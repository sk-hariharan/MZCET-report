import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, GraduationCap, Building2, KeyRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      await updateProfile({
        name,
        designation,
        phone,
        qualification,
        specialization
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Faculty Profile & Account Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your personal credentials, qualifications, and security settings</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-white text-lg">
          {user.name?.charAt(0) || 'U'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Information Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Personal & Academic Details
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Details auto-populate into your weekly & monthly reports</p>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Staff ID</label>
                <input 
                  type="text" 
                  value={user.staff_id} 
                  disabled
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Role</label>
                <input 
                  type="text" 
                  value={user.role?.toUpperCase()} 
                  disabled
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl uppercase font-bold text-blue-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Email Address</label>
              <input 
                type="email" 
                value={user.email} 
                disabled
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Designation</label>
              <input 
                type="text" 
                value={designation} 
                onChange={e => setDesignation(e.target.value)} 
                className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                placeholder="e.g. Assistant Professor"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Qualification</label>
                <input 
                  type="text" 
                  value={qualification} 
                  onChange={e => setQualification(e.target.value)} 
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  placeholder="e.g. M.E., Ph.D."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Specialization</label>
                <input 
                  type="text" 
                  value={specialization} 
                  onChange={e => setSpecialization(e.target.value)} 
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  placeholder="e.g. AI / Cloud"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all mt-4 text-xs flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-600" /> Account Security
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Change your portal login password</p>
            </div>

            {passwordSuccess && (
              <div className="p-3 my-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Password changed successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 my-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs font-semibold mt-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl shadow-md transition-all mt-4 text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1 mt-6">
            <p className="font-bold text-slate-700">Password Requirements:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Minimum 6 characters</li>
              <li>Case sensitive</li>
              <li>Changes take effect immediately on next login</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
