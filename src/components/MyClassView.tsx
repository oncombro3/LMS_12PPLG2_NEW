import React, { useState } from 'react';
import {
  School,
  Users,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import { User, ClassRoom } from '../types';

interface MyClassViewProps {
  currentUser: User;
  classInfo?: ClassRoom;
  allStudentsInSchool: User[];
}

export const MyClassView: React.FC<MyClassViewProps> = ({
  currentUser,
  classInfo,
  allStudentsInSchool,
}) => {
  const [search, setSearch] = useState('');

  // Classmates in the same class as current user
  const classmates = allStudentsInSchool.filter((s) => s.role === 'student' && s.class === currentUser.class);

  const filteredClassmates = classmates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.nisn && c.nisn.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Class Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              Profil Rombel Kelas Saya
            </span>
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              Aktif 2025/2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kelas {currentUser.class}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            {classInfo ? classInfo.majorName : 'Pengembangan Perangkat Lunak & Gim (PPLG)'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0">
          <Users className="w-8 h-8 text-indigo-300" />
          <div>
            <div className="text-xs text-indigo-200 font-medium">Teman Sekelas</div>
            <div className="text-2xl font-black text-white">{classmates.length} Siswa</div>
          </div>
        </div>
      </div>

      {/* Classmates Grid / Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Daftar Teman Satu Kelas ({classmates.length} Siswa)
            </h2>
            <p className="text-xs text-slate-500">
              Daftar seluruh akun siswa yang terdaftar di kelas <strong>{currentUser.class}</strong>.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari teman sekelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassmates.map((student) => {
            const isMe = student.id === currentUser.id;

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isMe
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">
                        {student.name}
                      </h4>
                      {isMe && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-full">
                          Saya
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-600 font-bold">
                      NISN: {student.nisn}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-semibold text-slate-700">{student.gender || 'Laki-laki'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
