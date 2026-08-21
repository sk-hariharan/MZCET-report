import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { StaffDashboard } from './pages/StaffDashboard';
import { HodDashboard } from './pages/HodDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MultiStepReportForm } from './components/MultiStepReportForm';
import { ReportReviewModal } from './components/ReportReviewModal';
import { ReportPreview } from './pages/ReportPreview';
import { Profile } from './pages/Profile';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { StaffDirectory } from './pages/StaffDirectory';
import { AcademicSetup } from './pages/AcademicSetup';
import { 
  GraduationCap, 
  Bell, 
  Calendar, 
  Search, 
  Menu,
  X,
  FileSpreadsheet
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Navigation & View states
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeReportType, setActiveReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [editReportId, setEditReportId] = useState<number | null>(null);
  const [previewReportId, setPreviewReportId] = useState<number | null>(null);
  const [reviewReportId, setReviewReportId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [previousTab, setPreviousTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">Loading MZCET Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Handlers for report navigation
  const handleCreateReport = (type: 'weekly' | 'monthly') => {
    setActiveReportType(type);
    setEditReportId(null);
    setPreviewReportId(null);
    setCurrentTab(type === 'weekly' ? 'new_weekly' : 'new_monthly');
  };

  const handleEditReport = (id: number, type: 'weekly' | 'monthly') => {
    setActiveReportType(type);
    setEditReportId(id);
    setPreviewReportId(null);
    setCurrentTab(type === 'weekly' ? 'new_weekly' : 'new_monthly');
  };

  const handlePreviewReport = (id: number) => {
    setPreviousTab(currentTab);
    setPreviewReportId(id);
    setCurrentTab('preview');
  };

  const handleReviewReport = (id: number) => {
    setReviewReportId(id);
  };

  const handleCancelForm = () => {
    setEditReportId(null);
    setPreviewReportId(null);
    setCurrentTab('dashboard');
  };

  const renderContent = () => {
    // 1. Full Report Preview Mode
    if (previewReportId || currentTab === 'preview') {
      return (
        <ReportPreview 
          reportId={previewReportId || 1} 
          onBack={() => { setPreviewReportId(null); setCurrentTab(previousTab || 'dashboard'); }}
          onEdit={handleEditReport}
        />
      );
    }

    // 2. Report Creation / Edit Stepper
    if (currentTab === 'new_weekly' || currentTab === 'new_monthly') {
      return (
        <MultiStepReportForm 
          reportType={currentTab === 'new_weekly' ? 'weekly' : activeReportType}
          onCancel={handleCancelForm}
          editReportId={editReportId}
        />
      );
    }

    // 3. Tab-based Routing
    switch (currentTab) {
      case 'profile':
        return <Profile />;
      
      case 'departments':
        return <DepartmentManagement />;
      
      case 'staff':
        return <StaffDirectory />;
      
      case 'academics':
        return <AcademicSetup />;
      
      case 'reports':
      case 'review_queue':
      case 'analytics':
      case 'dashboard':
      default:
        if (user.role === 'admin') {
          return <AdminDashboard currentTab={currentTab} onPreviewReport={handlePreviewReport} />;
        } else if (user.role === 'hod') {
          return (
            <HodDashboard 
              onReviewReport={handleReviewReport} 
              onPreviewReport={handlePreviewReport} 
            />
          );
        } else {
          return (
            <StaffDashboard 
              onCreateReport={handleCreateReport} 
              onEditReport={handleEditReport} 
              onPreviewReport={handlePreviewReport} 
            />
          );
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex min-w-0 overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => { setPreviewReportId(null); setCurrentTab(tab); }} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 w-full">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 flex-shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <img src="/mzcet-logo.png" alt="Mount Zion Logo" className="h-8 w-auto object-contain flex-shrink-0" />
            <div className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-blue-700 truncate hidden sm:inline">Mount Zion College of Engineering and Technology</span>
              <span className="text-blue-700 truncate sm:hidden">MZCET</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-semibold capitalize truncate">{currentTab.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>AY 2025-2026</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-inner flex-shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {renderContent()}
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-4 md:px-8 border-t border-slate-200/80 bg-white text-center text-[11px] sm:text-xs text-slate-400 font-semibold">
          Mount Zion College of Engineering & Technology — Staff Weekly & Monthly Report Automation System © 2026
        </footer>
      </div>

      {/* HOD / Admin Review Action Modal */}
      {reviewReportId && (
        <ReportReviewModal 
          reportId={reviewReportId} 
          onClose={() => setReviewReportId(null)} 
          onActionComplete={() => {
            setReviewReportId(null);
            // Refresh current view by state trigger
            setCurrentTab('dashboard');
          }}
        />
      )}

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
