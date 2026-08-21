import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle, KeyRound, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'staff' | 'hod' | 'admin') => {
    let demoEmail = '';
    const demoPass = 'mzcet@1234';

    switch (demoRole) {
      case 'admin':
        demoEmail = 'admin@mzcet.edu.in';
        break;
      case 'hod':
        demoEmail = 'hod.it@mzcet.edu.in';
        break;
      case 'staff':
      default:
        demoEmail = 'staff@mzcet.edu.in';
        break;
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);
    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      console.error(err);
      setError('Demo login failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950">
      
      {/* Container */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="p-3.5 bg-white/95 rounded-3xl inline-block shadow-2xl shadow-blue-900/50 border border-blue-400/20 transform hover:scale-105 transition-transform">
            <img src="/mzcet-logo.png" alt="Mount Zion College of Engineering and Technology Logo" className="h-16 w-auto object-contain max-w-[280px]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-50 tracking-wider">MOUNT ZION</h1>
            <p className="text-xs font-extrabold text-blue-400 uppercase tracking-widest mt-0.5">FacultyReport Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-extrabold text-slate-100">Sign In to Portal</h2>
            <p className="text-xs font-semibold text-slate-400">Mount Zion College of Engineering and Technology</p>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/80 p-3.5 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wider">Login ID / Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input 
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-medium"
                  placeholder="e.g. mzcet@admin or mzcet@it_coordinator"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </span>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-950/60 disabled:opacity-50 text-sm mt-2 active:scale-98"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
