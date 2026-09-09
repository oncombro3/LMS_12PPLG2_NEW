import React, { useState } from 'react';
import {
  School,
  Users,
  GraduationCap,
  Search,
  BookOpen,
  Mail,
  Eye,
  X,
  Check,
  Flame,
  Copy,
  User,
} from 'lucide-react';
import { ClassRoom, User as UserType } from '../types';

interface TeacherRosterViewProps {
  classes: ClassRoom[];
  teachers: UserType[];
  allStudents: UserType[];
  currentTeacherName?: string;
  onUpdateStudentRole?: (studentId: string, newRole: string) => Promise<void> | void;
}

export const TeacherRosterView: React.FC<TeacherRosterViewProps> = ({
  classes,
  teachers,
  allStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'teachers'>('classes');
  const [search, setSearch] = useState('');
  
  // State for Overlay Modal "Lihat Siswa"
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalRoleFilter, setModalRoleFilter] = useState<'all' | 'male' | 'female'>('all');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.nip && t.nip.includes(search)) ||
      (t.subjectTaught && t.subjectTaught.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.majorName.toLowerCase().includes(search.toLowerCase())
  );

  const rawStudentsInSelectedClass = selectedClass
    ? allStudents.filter((s) => s.role === 'student' && s.class === selectedClass.name)
    : [];

  const filteredModalStudents = rawStudentsInSelectedClass.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (s.nisn && s.nisn.includes(modalSearch)) ||
      s.email.toLowerCase().includes(modalSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (modalRoleFilter === 'male') {
      return s.gender === 'Laki-laki';
    }
    if (modalRoleFilter === 'female') {
      return s.gender === 'Perempuan';
    }
    return true;
  });

  const handleCopyStudentList = () => {
    if (!selectedClass || rawStudentsInSelectedClass.length === 0) return;
    const textLines = rawStudentsInSelectedClass.map(
      (s, idx) =>
        `${idx + 1}. ${s.name} | NISN: ${s.nisn || '-'} | Gender: ${s.gender || '-'}`
    );
    const summary = `DAFTAR SISWA KELAS ${selectedClass.name.toUpperCase()}\nTotal: ${rawStudentsInSelectedClass.length} Siswa\n\n` + textLines.join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Stats calculation for modal
  const maleCount = rawStudentsInSelectedClass.filter((s) => s.gender === 'Laki-laki').length;
  const femaleCount = rawStudentsInSelectedClass.filter((s) => s.gender === 'Perempuan').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              Direktori & Rombel Siswa
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              Sinkronisasi Rombel
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Daftar Kelas & Rekan Guru Pendidik
          </h1>
          <p className="text-xs text-slate-500">
            Akses data seluruh rombel kelas yang dibentuk Admin dan direktori guru pengampu.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => {
              setActiveTab('classes');
              setSelectedClass(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeTab === 'classes'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Daftar Kelas ({classes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('teachers');
              setSelectedClass(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeTab === 'teachers'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Direktori Guru ({teachers.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: DAFTAR KELAS & ANGGOTA SISWA */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelas atau program kejuruan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 hidden sm:block">
              Total {filteredClasses.length} Rombel Terdaftar
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => {
              const studentsInThisClass = allStudents.filter(
                (s) => s.role === 'student' && s.class === cls.name
              );

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                >
                  <div className="space-y-2.5">
                    {/* Header Card */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-base text-slate-900">{cls.name}</span>
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
                      <div className="flex items-center justify-between">
                        <span>Tahun Ajaran: <strong>{cls.academicYear}</strong></span>
                        <span className="text-indigo-600 font-bold">{studentsInThisClass.length} Siswa</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setModalSearch('');
                        setModalRoleFilter('all');
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Daftar Siswa ({studentsInThisClass.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: LIHAT DATA SISWA KELAS */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Rombel Kelas
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                    Tingkat {selectedClass.gradeLevel} • TP {selectedClass.academicYear}
                  </span>
                  {(selectedClass.isPlus || selectedClass.name.includes('+')) && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-amber-950">
                      + PLUS
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                  Daftar Siswa Kelas {selectedClass.name}
                </h2>
                <p className="text-xs text-indigo-200/90 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{selectedClass.majorName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyStudentList}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                  title="Salin Data Daftar Siswa"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="hidden sm:inline text-emerald-300">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Salin Data</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setModalSearch('');
                    setModalRoleFilter('all');
                  }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
                  title="Tutup Overlay"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{rawStudentsInSelectedClass.length} Siswa</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Terdaftar Aktif</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laki-Laki</div>
                <div className="text-xl font-black text-indigo-600 mt-0.5">{maleCount} Siswa</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Siswa Laki-Laki</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perempuan</div>
                <div className="text-xl font-black text-pink-600 mt-0.5">{femaleCount} Siswi</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Siswa Perempuan</div>
              </div>
            </div>

            {/* Search & Filter Bar inside modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa berdasarkan nama, NISN, atau email..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setModalRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modalRoleFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({rawStudentsInSelectedClass.length})
                </button>
                <button
                  onClick={() => setModalRoleFilter('male')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modalRoleFilter === 'male'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Laki-laki ({maleCount})
                </button>
                <button
                  onClick={() => setModalRoleFilter('female')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modalRoleFilter === 'female'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Perempuan ({femaleCount})
                </button>
              </div>
            </div>

            {/* Student List Grid inside modal */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[50vh] space-y-3">
              {filteredModalStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredModalStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xs"
                            />
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {st.name}
                            </div>
                            <div className="text-[11px] font-mono text-indigo-600 font-bold">
                              NISN: {st.nisn || '-'}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          Siswa
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1.5 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{st.email}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                            {st.gender || 'Laki-laki'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-2">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Tidak ada data siswa yang cocok</div>
                  <p className="text-[11px] text-slate-400">
                    {modalSearch ? 'Coba ganti kata kunci pencarian Anda.' : 'Belum ada siswa yang terdaftar di kelas ini.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Menampilkan <strong>{filteredModalStudents.length}</strong> dari <strong>{rawStudentsInSelectedClass.length}</strong> siswa
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setModalSearch('');
                    setModalRoleFilter('all');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DIREKTORI GURU */}
      {activeTab === 'teachers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Direktori Guru Pendidik Terdaftar ({teachers.length} Guru)
              </h2>
              <p className="text-xs text-slate-500">
                Profil pengampu mata pelajaran kejuruan dan umum di {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari guru / NIP / mapel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((tch) => (
              <div
                key={tch.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 text-xs hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tch.avatar}
                    alt={tch.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {tch.name}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500 font-bold">
                      NIP: {tch.nip}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-slate-600">
                  <div>
                    <span className="text-slate-400">Mapel Diampu:</span>{' '}
                    <strong className="text-indigo-600">{tch.subjectTaught || 'Produktif Kejuruan'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Penugasan:</span>{' '}
                    <strong>{tch.class}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{tch.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
