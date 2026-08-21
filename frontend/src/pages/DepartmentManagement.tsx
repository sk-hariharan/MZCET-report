import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Users, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import type { Department } from '../types';

export const DepartmentManagement: React.FC = () => {
  const { token, apiBaseUrl } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/analytics/comparison`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDepartments(data.comparisons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Academic Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Mount Zion College of Engineering and Technology branches & faculties</p>
        </div>
        <button 
          onClick={fetchDepartments}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">{d.department_name}</h4>
                <p className="text-[11px] text-slate-400 font-semibold">Dept ID: #{d.id}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Faculty Members:</span>
                <span className="font-bold text-slate-800">{d.staffCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reports Processed:</span>
                <span className="font-bold text-blue-600">{d.reportsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Avg Syllabus Progress:</span>
                <span className="font-extrabold text-emerald-600">{d.avgSyllabus || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
