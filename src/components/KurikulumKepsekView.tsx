import React, { useState } from 'react';
import {
  School,
  GraduationCap,
  Search,
  Users,
  Eye,
  BookOpen,
  FileCheck2,
  Megaphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { User, ClassRoom, OnlineExam, Announcement, TabType } from '../types';
import { OFFICIAL_MAJORS } from '../data/schoolData';

interface KurikulumKepsekViewProps {
  currentUser: User;
  classes: ClassRoom[];
  usersRoster: User[];
  exams?: OnlineExam[];
  announcements?: Announcement[];
  onNavigateTab?: (tab: TabType) => void;
}

export const KurikulumKepsekView: React.FC<KurikulumKepsekViewProps> = ({
  currentUser,
  classes,
  usersRoster,
  exams = [],
  announcements = [],
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'classes'>('students');
  const [search, setSearch] = useState('');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [activeClassDetail, setActiveClassDetail] = useState<ClassRoom | null>(null);

  const registeredStudents = usersRoster.filter((u) => u.role === 'student');
  const registeredTeachers = usersRoster.filter((u) => u.role === 'teacher');

  // Filter classes by major
  const filteredClasses = classes.filter((cls) => {
    if (selectedMajorFilter === 'all') return true;
    return cls.majorCode === selectedMajorFilter || cls.name.includes(selectedMajorFilter);
  });

  // Filter students
  const filteredStudents = registeredStudents.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn && s.nisn.includes(search)) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
    const matchClass = selectedClassFilter === 'all' || s.class === selectedClassFilter;
    const matchMajor =
      selectedMajorFilter === 'all' || (s.class && s.class.toUpperCase().includes(selectedMajorFilter));
    return matchSearch && matchClass && matchMajor;
  });

  // Filter teachers
  const filteredTeachers = registeredTeachers.filter((t) => {
    const q = search.toLowerCase();
    const mapel = (t.subjectTaught || t.subject || '').toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      (t.nip && t.nip.toLowerCase().includes(q)) ||
      mapel.includes(q) ||
      (t.email && t.email.toLowerCase().includes(q));
    return matchSearch;
  });

  const studentsInSelectedClass = activeClassDetail
    ? registeredStudents.filter((s) => s.class === activeClassDetail.name)
    : [];

  const roleTitle = currentUser.role === 'kepalasekolah' ? 'Kepala Sekolah' : 'Wakil Bidang Kurikulum';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              Role: {roleTitle}
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              Hak Akses Data & Monitoring
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Portal Monitoring {roleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Tinjau data seluruh peserta didik dan dewan guru yang telah terdaftar di sistem, pantau pelaksanaan ulangan CBT, serta pantau informasi pengumuman sekolah.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0 text-center">
          <div className="px-2">
            <div className="text-[10px] text-slate-300 font-medium">Siswa</div>
            <div className="text-base sm:text-lg font-black text-white">{registeredStudents.length}</div>
          </div>
          <div className="px-2 border-x border-white/15">
            <div className="text-[10px] text-slate-300 font-medium">Guru</div>
            <div className="text-base sm:text-lg font-black text-white">{registeredTeachers.length}</div>
          </div>
          <div className="px-2">
            <div className="text-[10px] text-slate-300 font-medium">Rombel</div>
            <div className="text-base sm:text-lg font-black text-white">{classes.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards to Exams and Announcements */}
      {onNavigateTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onNavigateTab('exams')}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                  Pantau Ulangan Siswa (CBT)
                </h3>
                <p className="text-xs text-slate-500">
                  {exams.length} paket ulangan aktif & hasil pengerjaan CBT siswa
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
          </div>

          <div
            onClick={() => onNavigateTab('announcements')}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition">
                  Papan Pengumuman Sekolah
                </h3>
                <p className="text-xs text-slate-500">
                  {announcements.length} pengumuman & edaran akademik terbit
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </div>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveTab('students');
            setActiveClassDetail(null);
            setSearch('');
          }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          1. Data Siswa Terdaftar ({registeredStudents.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('teachers');
            setActiveClassDetail(null);
            setSearch('');
          }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          2. Data Guru Terdaftar ({registeredTeachers.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('classes');
            setActiveClassDetail(null);
            setSearch('');
          }}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <School className="w-4 h-4" />
          3. Data Rombel Kelas ({classes.length})
        </button>
      </div>

      {/* ================= VIEW 1: DATA SISWA TERDAFTAR ================= */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Data Seluruh Siswa Terdaftar ({registeredStudents.length} Siswa)
              </h2>
              <p className="text-xs text-slate-500">
                Pemantauan data lengkap seluruh peserta didik aktif di {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / NISN / email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-52 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Kelas ({classes.length})</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedMajorFilter}
                onChange={(e) => setSelectedMajorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Jurusan</option>
                {OFFICIAL_MAJORS.map((m) => (
                  <option key={m.code} value={m.code}>{m.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4">Kelas / Rombel</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Jenis Kelamin</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <span>{std.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{std.nisn || '-'}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                          {std.class || 'Belum Ditentukan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{std.email}</td>
                      <td className="py-3 px-4 text-slate-500">{std.gender || 'Laki-laki'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {std.status || 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: DATA GURU TERDAFTAR ================= */}
      {activeTab === 'teachers' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Data Guru & Tenaga Pendidik Terdaftar ({registeredTeachers.length} Guru)
              </h2>
              <p className="text-xs text-slate-500">
                Daftar lengkap dewan guru pengampu mata pelajaran.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / NIP / mapel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Mata Pelajaran Diampu</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((tc) => {
                    return (
                      <tr key={tc.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <img
                            src={tc.avatar}
                            alt={tc.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span>{tc.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{tc.nip || '-'}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px]">
                            {tc.subjectTaught || tc.subject || 'Produktif Kejuruan'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{tc.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif Mengajar
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Tidak ada data guru yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: DATA KELAS & ROMBEL ================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Major Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0">Filter Jurusan:</span>
            <button
              onClick={() => setSelectedMajorFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
                selectedMajorFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Jurusan ({classes.length})
            </button>
            {OFFICIAL_MAJORS.map((m) => {
              const count = classes.filter((c) => c.majorCode === m.code || c.name.includes(m.code)).length;
              const isSelected = selectedMajorFilter === m.code;
              return (
                <button
                  key={m.code}
                  onClick={() => setSelectedMajorFilter(m.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{m.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => {
              const studentsInThisClass = registeredStudents.filter((s) => s.class === cls.name);
              const isSelected = activeClassDetail?.id === cls.id;

              return (
                <div
                  key={cls.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-lg text-slate-900">{cls.name}</span>
                      {(cls.isPlus || cls.name.includes('+')) && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          + Plus
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Tingkat {cls.gradeLevel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">{cls.majorName}</div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div>Tahun Ajaran: {cls.academicYear}</div>
                  </div>

                  <button
                    onClick={() => setActiveClassDetail(cls)}
                    className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Tinjau {studentsInThisClass.length} Siswa Rombel Ini
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modal / Card: Siswa di kelas yang dipilih */}
          {activeClassDetail && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    Data Siswa Kelas {activeClassDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeClassDetail.majorName}
                  </p>
                </div>
                <button
                  onClick={() => setActiveClassDetail(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>

              {studentsInSelectedClass.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {studentsInSelectedClass.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-6 h-6 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {st.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{st.nisn}</td>
                          <td className="py-2.5 px-3 text-slate-500">{st.email}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {st.status || 'Aktif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada data siswa di kelas ini.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

