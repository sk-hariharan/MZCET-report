import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  User, 
  LogOut, 
  ClipboardCheck, 
  Users, 
  Building2, 
  BarChart3, 
  CalendarDays, 
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Custom links based on user roles
  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'All Reports', icon: History },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'staff', label: 'Staff Directory', icon: Users },
          { id: 'academics', label: 'Academic Setup', icon: CalendarDays },
          { id: 'analytics', label: 'College Analytics', icon: BarChart3 },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
      case 'hod':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'review_queue', label: 'Review Queue', icon: ClipboardCheck },
          { id: 'reports', label: 'Department Reports', icon: History },
          { id: 'analytics', label: 'Dept Analytics', icon: BarChart3 },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
      case 'staff':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'new_weekly', label: 'New Weekly Report', icon: FilePlus },
          { id: 'new_monthly', label: 'New Monthly Report', icon: FilePlus },
          { id: 'reports', label: 'My Reports History', icon: History },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-20 shadow-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
        <div className="p-1.5 bg-white/95 rounded-xl flex-shrink-0 shadow-md border border-white/20">
          <img src="/mzcet-logo.png" alt="MZCET Logo" className="h-8 w-auto object-contain max-w-[90px]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-extrabold text-xs leading-tight tracking-wider text-slate-50 truncate">MOUNT ZION</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest truncate">FacultyReport</p>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/30 flex items-center justify-center font-black text-white text-base uppercase overflow-hidden shadow-inner flex-shrink-0">
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-slate-100">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 uppercase border border-blue-800/40 tracking-wider">
                {user.role}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user.department_name ? user.department_name.split(' ')[0] : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group text-left ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-400 hover:bg-red-950/40 hover:text-red-300 rounded-xl text-xs font-bold transition-all duration-150 group"
        >
          <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
