import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, CheckCircle2, Clock, Layers, Plus } from 'lucide-react';

export const AcademicSetup: React.FC = () => {
  const [academicYears, setAcademicYears] = useState([
    { id: 1, year_name: '2025-2026', active: true },
    { id: 2, year_name: '2026-2027', active: false }
  ]);
  const [activeSem, setActiveSem] = useState<'ODD' | 'EVEN'>('ODD');
  const [newYear, setNewYear] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetActiveYear = (id: number) => {
    setAcademicYears(prev => prev.map(y => ({ ...y, active: y.id === id })));
    setSuccessMsg('Active Academic Year updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim()) return;
    setAcademicYears(prev => [...prev, { id: prev.length + 1, year_name: newYear.trim(), active: false }]);
    setNewYear('');
    setSuccessMsg('New academic year added.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Academic Setup & Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control active semesters, academic calendars, and reporting periods</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <CalendarDays className="h-6 w-6" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Semester Switcher */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" /> Active Semester Period
          </h3>
          <p className="text-xs text-slate-500">Defines the default semester pre-selected when faculty create new activity reports</p>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { setActiveSem('ODD'); setSuccessMsg('Switched active semester to ODD.'); setTimeout(() => setSuccessMsg(null), 3000); }}
              className={`p-4 rounded-2xl font-black text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                activeSem === 'ODD'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-900/10'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <span>ODD Semester</span>
              <span className="text-[10px] font-semibold text-slate-400">Semesters I, III, V, VII</span>
            </button>

            <button
              onClick={() => { setActiveSem('EVEN'); setSuccessMsg('Switched active semester to EVEN.'); setTimeout(() => setSuccessMsg(null), 3000); }}
              className={`p-4 rounded-2xl font-black text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                activeSem === 'EVEN'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-900/10'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <span>EVEN Semester</span>
              <span className="text-[10px] font-semibold text-slate-400">Semesters II, IV, VI, VIII</span>
            </button>
          </div>
        </div>

        {/* Academic Years List */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" /> Academic Years
          </h3>
          
          <div className="space-y-2.5">
            {academicYears.map((year) => (
              <div key={year.id} className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-2xl">
                <span className="font-bold text-xs text-slate-800">{year.year_name}</span>
                {year.active ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">Active</span>
                ) : (
                  <button 
                    onClick={() => handleSetActiveYear(year.id)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Set Active
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddYear} className="flex gap-2 pt-2">
            <input 
              type="text" 
              placeholder="e.g. 2027-2028"
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              className="flex-1 border border-slate-300 px-3 py-2 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
