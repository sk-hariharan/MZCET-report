import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Mail, Phone, GraduationCap, RefreshCw } from 'lucide-react';
import type { User } from '../types';
import { IT_FACULTY_ROSTER } from '../constants/curriculumData';

export const StaffDirectory: React.FC = () => {
  const { token, apiBaseUrl } = useAuth();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const map = new Map<string, any>();

      // 1. First add all official MZCET IT faculty roster members
      IT_FACULTY_ROSTER.forEach((fac, idx) => {
        const staffCode = fac.idNo ? `ID: ${fac.idNo}` : (fac.staffId ? `ID: ${fac.staffId}` : `MZCET-IT-${idx + 1}`);
        map.set(fac.name.toLowerCase(), {
          id: idx + 100,
          name: fac.name,
          staff_id: staffCode,
          role: fac.role,
          department_name: fac.department,
          designation: fac.designation + (fac.coordinatorRole ? ` (${fac.coordinatorRole})` : ''),
          qualification: fac.role === 'hod' ? 'M.Tech., Ph.D.' : 'M.E. / M.Tech.',
          specialization: 'Information Technology',
          email: fac.email
        });
      });

      // 2. Fetch reports to extract dynamic active staff from backend
      try {
        const res = await fetch(`${apiBaseUrl}/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const reports = data.reports || [];
          reports.forEach((r: any) => {
            if (r.staff_name) {
              const key = r.staff_name.toLowerCase();
              if (map.has(key)) {
                const existing = map.get(key);
                map.set(key, { ...existing, id: r.staff_id || existing.id });
              } else {
                map.set(key, {
                  id: r.staff_id || Date.now(),
                  name: r.staff_name,
                  staff_id: r.staff_code || `MZCET-${r.staff_id}`,
                  role: 'staff',
                  department_name: r.department_name || 'Information Technology',
                  designation: r.designation || 'Faculty Member',
                  qualification: r.qualification || '',
                  specialization: r.specialization || '',
                  email: r.staff_name ? `${r.staff_name.toLowerCase().replace(/ /g, '.')}@mzcet.in` : 'faculty@mzcet.in'
                });
              }
            }
          });
        }
      } catch (err) {
        console.warn('Backend reports fetch in staff directory:', err);
      }

      setStaffList(Array.from(map.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const filteredStaff = staffList.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.staff_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Faculty & Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Mount Zion College of Engineering and Technology academic staff roster</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search faculty name, ID, or dept..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-md">
                {staff.name?.charAt(0) || 'F'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">{staff.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {staff.role}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold font-mono">{staff.staff_id}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 text-xs border border-slate-100">
              <p className="text-slate-700 font-semibold truncate"><strong className="text-slate-900">Dept:</strong> {staff.department_name || 'Information Technology'}</p>
              <p className="text-slate-700 font-semibold truncate"><strong className="text-slate-900">Designation:</strong> {staff.designation || 'Faculty Member'}</p>
              {staff.qualification && <p className="text-slate-600 truncate"><strong className="text-slate-900">Qualification:</strong> {staff.qualification}</p>}
              {staff.email && (
                <div className="flex items-center gap-1.5 text-blue-600 font-medium pt-1 border-t border-slate-200/60 truncate">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
