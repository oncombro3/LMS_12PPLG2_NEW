import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  School,
  Users,
  GraduationCap,
  Database,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  ShieldCheck,
  Server,
  RefreshCw,
  Layers,
  Sparkles,
  Award,
  Phone,
  Mail,
  UserCheck,
  Eye,
  X,
  LayoutGrid,
  List,
  Shield,
  Briefcase,
  BookOpen,
  Calendar,
  ChevronRight,
  Cpu,
  KeyRound,
  Edit3,
  Lock,
  Save,
  AlertCircle
} from 'lucide-react';
import { User, ClassRoom, UserRole, SubjectItem } from '../types';
import { DbServerStatus } from '../services/api';
import { OFFICIAL_MAJORS, INITIAL_SUBJECTS } from '../data/schoolData';
import { AdminSubjectsTab } from './AdminSubjectsTab';

export type AdminSubTab = 'register' | 'classes' | 'subjects' | 'students' | 'teachers' | 'kepsek' | 'kurikulum' | 'admins' | 'server';

interface AdminManagerViewProps {
  classes: ClassRoom[];
  users: User[];
  subjects?: SubjectItem[];
  dbStatus: DbServerStatus | null;
  initialSubTab?: AdminSubTab;
  onSubTabChange?: (tab: AdminSubTab) => void;
  onRefreshDbStatus: () => void;
  onCreateClass: (data: {
    gradeLevel: string;
    majorName: string;
    majorCode: string;
    roomNumber: string;
    isPlus?: boolean;
    homeroomTeacher?: string;
  }) => Promise<void>;
  onCreateUser: (userData: Partial<User>) => Promise<void>;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onCreateSubject?: (subjectData: Partial<SubjectItem>) => Promise<void>;
  onUpdateSubject?: (subjectId: string, updates: Partial<SubjectItem>) => Promise<void>;
  onDeleteSubject?: (subjectId: string) => Promise<void>;
}

export const AdminManagerView: React.FC<AdminManagerViewProps> = ({
  classes,
  users,
  subjects,
  dbStatus,
  initialSubTab = 'register',
  onSubTabChange,
  onRefreshDbStatus,
  onCreateClass,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminSubTab>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected User for Full Biodata Modal
  const [selectedUserForBio, setSelectedUserForBio] = useState<User | null>(null);

  // Modal Konfirmasi Hapus Data Pengguna (Pop-up Konfirmasi / Batal)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Sync initial sub tab when props change
  useEffect(() => {
    if (initialSubTab) {
      setActiveAdminTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabSelect = (tab: AdminSubTab) => {
    setActiveAdminTab(tab);
    setSearchQuery('');
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Form State: Registrasi User Baru
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('password123');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regNisn, setRegNisn] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regClass, setRegClass] = useState(classes[0]?.name || '12 PPLG 2');
  const [regSubject, setRegSubject] = useState('Pemrograman Web (PWPB)');
  const [regGender, setRegGender] = useState('Laki-laki');
  const [regPhone, setRegPhone] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userSuccessMsg, setUserSuccessMsg] = useState('');

  // Form State: Edit User yang Sudah Terdaftar
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editNisn, setEditNisn] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editSubjectTaught, setEditSubjectTaught] = useState('');
  const [editTitleRole, setEditTitleRole] = useState('');
  const [editGender, setEditGender] = useState('Laki-laki');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword(u.password || 'password123');
    setEditRole(u.role);
    setEditNisn(u.nisn || '');
    setEditNip(u.nip || '');
    setEditClass(u.class || (classes[0]?.name || '12 PPLG 2'));
    setEditSubjectTaught(u.subjectTaught || 'Pemrograman Web (PWPB)');
    setEditTitleRole(u.titleRole || '');
    setEditGender(u.gender || 'Laki-laki');
    setEditPhone(u.phoneNumber || '');
    setEditStatus(u.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif');
    setEditSuccessMsg('');
    setEditErrorMsg('');
    if (selectedUserForBio) setSelectedUserForBio(null);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;
    setIsSubmittingEdit(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      await onUpdateUser(editingUser.id, {
        name: editName,
        email: editEmail,
        password: editPassword,
        role: editRole,
        nisn: editRole === 'student' ? editNisn : '-',
        nip: editRole !== 'student' ? editNip : '-',
        class: editRole === 'student' ? editClass : `Staf ${editRole}`,
        subjectTaught: editRole === 'teacher' ? editSubjectTaught : undefined,
        titleRole: editTitleRole || undefined,
        gender: editGender,
        phoneNumber: editPhone,
        status: editStatus,
      });

      setEditSuccessMsg(`Data akun ${editName} berhasil diperbarui di database!`);
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setEditErrorMsg(err?.message || 'Gagal memperbarui data akun.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Form State: Pembuatan Kelas Baru
  const [gradeLevel, setGradeLevel] = useState<'10' | '11' | '12'>('10');
  const [majorCode, setMajorCode] = useState('PPLG');
  const [majorName, setMajorName] = useState('Pengembangan Perangkat Lunak & Gim');
  const [roomNumber, setRoomNumber] = useState('1');
  const [isPlusClass, setIsPlusClass] = useState<boolean>(false);
  const [homeroomTeacher, setHomeroomTeacher] = useState('');
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);
  const [classSuccessMsg, setClassSuccessMsg] = useState('');

  // Auto set major name based on official 6 majors
  const handleMajorChange = (code: string) => {
    setMajorCode(code);
    const found = OFFICIAL_MAJORS.find((m) => m.code === code);
    if (found) {
      setMajorName(found.name);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    setIsSubmittingUser(true);
    setUserSuccessMsg('');

    try {
      await onCreateUser({
        name: regName,
        email: regEmail,
        password: regPassword || 'password123',
        role: regRole,
        nisn: regRole === 'student' ? regNisn : '-',
        nip: regRole !== 'student' ? regNip : '-',
        class: regRole === 'student' ? regClass : `Staf ${regRole}`,
        subjectTaught: regRole === 'teacher' ? regSubject : undefined,
        gender: regGender,
        phoneNumber: regPhone,
      });

      setUserSuccessMsg(`Akun ${regName} (${regRole.toUpperCase()}) berhasil didaftarkan ke sistem.`);
      setRegName('');
      setRegEmail('');
      setRegPassword('password123');
      setRegNisn('');
      setRegNip('');
      setRegPhone('');
      setTimeout(() => setUserSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClass(true);
    setClassSuccessMsg('');

    try {
      await onCreateClass({
        gradeLevel,
        majorCode,
        majorName,
        roomNumber,
        isPlus: isPlusClass,
        homeroomTeacher: homeroomTeacher || 'Belum Ditentukan',
      });

      const preview = `${gradeLevel} ${majorCode} ${roomNumber}${isPlusClass ? ' +' : ''}`;
      setClassSuccessMsg(`Kelas ${preview} berhasil dibuat dan disimpan.`);
      setRoomNumber((prev) => (parseInt(prev, 10) + 1).toString());
      setHomeroomTeacher('');
      setTimeout(() => setClassSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingClass(false);
    }
  };

  // =========================================================================
  // SUBJECTS MANAGEMENT (ADMIN MATA PELAJARAN)
  // =========================================================================
  const subjectsList = subjects && subjects.length > 0 ? subjects : INITIAL_SUBJECTS;

  // Filtered lists by role
  const registeredStudents = users.filter((u) => u.role === 'student');
  const registeredTeachers = users.filter((u) => u.role === 'teacher');
  const registeredKepsek = users.filter((u) => u.role === 'kepalasekolah');
  const registeredKurikulum = users.filter((u) => u.role === 'kurikulum');
  const registeredAdmins = users.filter((u) => u.role === 'admin');

  // Search filters
  const filteredStudents = registeredStudents.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchName = s.name.toLowerCase().includes(q) || (s.nisn && s.nisn.includes(q)) || s.email.toLowerCase().includes(q);
    const matchClass = filterClass === 'all' || s.class === filterClass;
    return matchName && matchClass;
  });

  const filteredTeachers = registeredTeachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.nip && t.nip.includes(q)) ||
      (t.subjectTaught && t.subjectTaught.toLowerCase().includes(q)) ||
      t.email.toLowerCase().includes(q)
    );
  });

  const filteredKepsek = registeredKepsek.filter((k) => {
    const q = searchQuery.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      (k.nip && k.nip.includes(q)) ||
      k.email.toLowerCase().includes(q)
    );
  });

  const filteredKurikulum = registeredKurikulum.filter((kr) => {
    const q = searchQuery.toLowerCase();
    return (
      kr.name.toLowerCase().includes(q) ||
      (kr.nip && kr.nip.includes(q)) ||
      kr.email.toLowerCase().includes(q)
    );
  });

  const filteredAdmins = registeredAdmins.filter((ad) => {
    const q = searchQuery.toLowerCase();
    return (
      ad.name.toLowerCase().includes(q) ||
      (ad.nip && ad.nip.includes(q)) ||
      ad.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold">
              Hak Akses Penuh Administrator IT
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              Database Aktif
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Pusat Kontrol & Manajemen Akun Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Kelola data registrasi akun, rombel kelas, serta biodata lengkap seluruh civitas sekolah (Siswa, Guru, Kepala Sekolah, Kurikulum, Administrator).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div className="text-xs">
            <div className="text-slate-300 font-medium">Total Akun Terdaftar</div>
            <div className="text-xl font-black text-white">{users.length} Akun User</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => handleTabSelect('register')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'register'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          1. Registrasi Akun Baru
        </button>

        <button
          onClick={() => handleTabSelect('classes')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <School className="w-4 h-4" />
          2. Manajemen Kelas ({classes.length})
        </button>

        <button
          onClick={() => handleTabSelect('subjects')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          3. Mata Pelajaran ({subjectsList.length})
        </button>

        <button
          onClick={() => handleTabSelect('students')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          4. Akun Siswa ({registeredStudents.length})
        </button>

        <button
          onClick={() => handleTabSelect('teachers')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          5. Akun Guru ({registeredTeachers.length})
        </button>

        <button
          onClick={() => handleTabSelect('kepsek')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'kepsek'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          6. Akun Kepsek ({registeredKepsek.length})
        </button>

        <button
          onClick={() => handleTabSelect('kurikulum')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'kurikulum'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          7. Akun Kurikulum ({registeredKurikulum.length})
        </button>

        <button
          onClick={() => handleTabSelect('admins')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'admins'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          8. Akun Admin IT ({registeredAdmins.length})
        </button>

        <button
          onClick={() => handleTabSelect('server')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
            activeAdminTab === 'server'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          9. Status Server & DB
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTRASI AKUN BARU                                              */}
      {/* ========================================================================= */}
      {activeAdminTab === 'register' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Form Registrasi Akun Pengguna Resmi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Admin mendaftarkan akun untuk Siswa, Guru, Kepala Sekolah, Kurikulum, atau sesama Admin ke database sekolah.
            </p>
          </div>

          {userSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {userSuccessMsg}
            </div>
          )}

          <form onSubmit={handleRegisterUser} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Pilih Role Akun yang Akan Didaftarkan *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'student', label: 'Siswa', desc: 'Mengerjakan CBT & Tugas' },
                  { id: 'teacher', label: 'Guru', desc: 'Membuat Ujian & Modul' },
                  { id: 'kepalasekolah', label: 'Kepala Sekolah', desc: 'Monitoring Mutu & Siswa' },
                  { id: 'kurikulum', label: 'Kurikulum', desc: 'Jadwal & Asesmen' },
                  { id: 'admin', label: 'Admin IT', desc: 'Registrasi & Database' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegRole(r.id as UserRole)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === r.id
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-900 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">{r.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom. / Rizky Pratama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Email Sekolah (@smktb.sch.id) *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama.user@smktb.sch.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Conditional: NISN for Student, NIP for Teacher/Staff */}
              {regRole === 'student' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Siswa Nasional (NISN) *</label>
                  <input
                    type="text"
                    required
                    value={regNisn}
                    onChange={(e) => setRegNisn(e.target.value)}
                    placeholder="Contoh: 0068124921 (10 Digit)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Pegawai (NIP) / Kode Staf *</label>
                  <input
                    type="text"
                    required
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    placeholder="Contoh: 198405122009021004"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Conditional: Class Assignment for Student */}
              {regRole === 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Rombel / Kelas Siswa *</label>
                  <select
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name} ({cls.majorName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional: Subject Taught for Teacher */}
              {regRole === 'teacher' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mata Pelajaran yang Diampu *</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Tersinkron Master Mapel</span>
                  </label>
                  <input
                    type="text"
                    list="registered-subjects-datalist"
                    value={regSubject}
                    onChange={(e) => setRegSubject(e.target.value)}
                    placeholder="Pilih atau ketik mapel (e.g. Matematika (MTK) / IPA)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="registered-subjects-datalist">
                    {subjectsList.map((s) => (
                      <option key={s.id} value={`${s.name} (${s.code})`}>
                        {s.category} - KKM: {s.kkm}
                      </option>
                    ))}
                  </datalist>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Kata Sandi (Password Akun) *</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Default: password123</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Masukkan password akun baru..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition"
                    tabIndex={-1}
                    title={showRegPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showRegPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / Kontak Telepon</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0812345678xx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingUser}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmittingUser ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Resmi Ini'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAJEMEN KELAS & PEMBUATAN ROMBEL                                */}
      {/* ========================================================================= */}
      {activeAdminTab === 'classes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                Pembuatan Rombel Kelas Baru (Sesuai 6 Jurusan Resmi)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih tingkat (10, 11, 12), jurusan resmi SMK TB, nomor rombel, dan opsi kelas plus.
              </p>
            </div>

            {classSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {classSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas *</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10">Kelas 10 (Fase E)</option>
                    <option value="11">Kelas 11 (Fase F)</option>
                    <option value="12">Kelas 12 (Fase F Lanjut)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Jurusan Resmi *</label>
                  <select
                    value={majorCode}
                    onChange={(e) => handleMajorChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {OFFICIAL_MAJORS.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rombel (1, 2, 3...) *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guru Pembimbing / Penanggung Jawab Kelas (Opsional)</label>
                <select
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Belum Ditentukan / Pilih Nanti --</option>
                  {registeredTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name} — {teacher.subjectTaught || 'Guru'} (NIP: {teacher.nip || '-'})
                    </option>
                  ))}
                </select>
                {registeredTeachers.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    * Belum ada akun guru terdaftar. Anda dapat mendaftarkan guru terlebih dahulu di tab Registrasi Akun.
                  </p>
                )}
              </div>

              {/* Opsi Kelas Plus (+) */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isPlusClass
                  ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-lg shrink-0 transition ${
                    isPlusClass ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}>
                    +
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                      <span>Opsi Kelas Plus (+) / Unggulan</span>
                      {isPlusClass && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                          AKTIF (+ DITAMBAHKAN)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Centang opsi ini jika ingin membuat rombel program kelas <strong>+</strong> (unggulan/khusus). Tanda <strong>+</strong> akan otomatis disematkan pada nama kelas.
                    </p>
                  </div>
                </div>

                <label className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border cursor-pointer select-none transition shrink-0 ${
                  isPlusClass
                    ? 'bg-amber-500 text-white border-amber-600 font-black shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 font-bold'
                }`}>
                  <input
                    type="checkbox"
                    checked={isPlusClass}
                    onChange={(e) => setIsPlusClass(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs">
                    {isPlusClass ? '✓ Kelas + Aktif' : 'Pilih Jadi Kelas +'}
                  </span>
                </label>
              </div>

              {/* Real-time Class Name Preview */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">Preview Nama Kelas Otomatis:</span>
                  <div className="text-xl font-black text-indigo-900 mt-0.5 flex items-center gap-2">
                    <span>
                      {gradeLevel} {majorCode} {roomNumber}{isPlusClass ? ' +' : ''}
                    </span>
                    {isPlusClass && (
                      <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Kelas + (Plus)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-indigo-700">
                    {majorName} {isPlusClass ? '• Program Kelas Unggulan Plus (+)' : ''}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingClass}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isSubmittingClass ? 'Menyimpan...' : 'Buat Kelas Ini'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Created Classes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600" />
              Daftar Kelas yang Telah Dibuat Admin ({classes.length} Rombel)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-indigo-900">{cls.name}</span>
                      {(cls.isPlus || cls.name.includes('+')) && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          + Plus
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Kelas {cls.gradeLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{cls.majorName}</div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 space-y-1">
                    <div>Tahun Ajaran: {cls.academicYear}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAJEMEN MATA PELAJARAN (ADMIN MASTER MAPEL)                    */}
      {/* ========================================================================= */}
      {activeAdminTab === 'subjects' && (
        <AdminSubjectsTab
          subjects={subjectsList}
          teachers={registeredTeachers}
          onCreateSubject={onCreateSubject}
          onUpdateSubject={onUpdateSubject}
          onDeleteSubject={onDeleteSubject}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AKUN SISWA TERDAFTAR (BIODATA & LIST)                             */}
      {/* ========================================================================= */}
      {activeAdminTab === 'students' && (
        <div className="space-y-4">
          {/* Header Stats & Filters */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    Direktori Akun Siswa
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                    {registeredStudents.length} Siswa Terdaftar
                  </span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-lg mt-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Daftar & Biodata Akun Siswa
                </h2>
                <p className="text-xs text-slate-500">
                  Data lengkap akun siswa yang memiliki akses pengerjaan tugas dan CBT di LMS SMK TB.
                </p>
              </div>

              {/* View Toggle & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Tampilan Kartu Biodata"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Tampilan Tabel Lengkap"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama / NISN / email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 sm:w-60 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GRID VIEW (BIODATA CARDS) */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((std) => (
                <div
                  key={std.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-indigo-100 shadow-xs"
                        />
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                            {std.name}
                          </h3>
                          <div className="text-[11px] font-mono text-indigo-600 font-bold">
                            NISN: {std.nisn}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                        {std.class}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{std.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{std.phoneNumber || 'Belum diisi'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-slate-400">Gender: <strong className="text-slate-700">{std.gender || 'Laki-laki'}</strong></span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {std.status || 'Aktif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedUserForBio(std)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Lihat Biodata Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Biodata
                      </button>
                      <button
                        onClick={() => handleOpenEditUser(std)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                        title="Edit Data Akun Siswa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>

                    <button
                      onClick={() => setUserToDelete(std)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Hapus Akun Siswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Nama Siswa</th>
                      <th className="py-3.5 px-4">NISN</th>
                      <th className="py-3.5 px-4">Kelas</th>
                      <th className="py-3.5 px-4">Email Sekolah</th>
                      <th className="py-3.5 px-4">No. HP / WA</th>
                      <th className="py-3.5 px-4">Gender</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <img src={std.avatar} alt={std.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <span className="line-clamp-1">{std.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{std.nisn}</td>
                        <td className="py-3 px-4 font-bold">{std.class}</td>
                        <td className="py-3 px-4 text-slate-500">{std.email}</td>
                        <td className="py-3 px-4 text-slate-500">{std.phoneNumber || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{std.gender || 'Laki-laki'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {std.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUserForBio(std)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Lihat Biodata Lengkap"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(std)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit Data Akun Siswa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(std)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Akun Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AKUN GURU TERDAFTAR (BIODATA & LIST)                              */}
      {/* ========================================================================= */}
      {activeAdminTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                    Direktori Tenaga Pendidik
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    {registeredTeachers.length} Guru Terdaftar
                  </span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-lg mt-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Daftar & Biodata Akun Guru Pendidik
                </h2>
                <p className="text-xs text-slate-500">
                  Data lengkap para guru pengampu mata pelajaran kejuruan & umum di {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}.
                </p>
              </div>

              {/* Search & Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari guru / NIP / mapel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 sm:w-60 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GRID VIEW (GURU CARDS) */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeachers.map((tch) => (
                <div
                  key={tch.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={tch.avatar}
                          alt={tch.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-emerald-100 shadow-xs"
                        />
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                            {tch.name}
                          </h3>
                          <div className="text-[11px] font-mono text-slate-500">
                            NIP: {tch.nip || '-'}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                        Guru
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-indigo-700 line-clamp-1">
                        📖 {tch.subjectTaught || 'Produktif Kejuruan'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        🏫 {tch.class || 'Guru Pengampu'}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tch.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{tch.phoneNumber || '0811987654xx'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedUserForBio(tch)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Lihat Biodata Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Biodata
                      </button>
                      <button
                        onClick={() => handleOpenEditUser(tch)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                        title="Edit Data Akun Guru"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>

                    <button
                      onClick={() => setUserToDelete(tch)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Hapus Akun Guru"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW GURU */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Nama Lengkap Guru</th>
                      <th className="py-3.5 px-4">NIP</th>
                      <th className="py-3.5 px-4">Mata Pelajaran yang Diampu</th>
                      <th className="py-3.5 px-4">Penugasan Mengajar</th>
                      <th className="py-3.5 px-4">Email Resmi</th>
                      <th className="py-3.5 px-4">No. HP / WA</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredTeachers.map((tch) => (
                      <tr key={tch.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <img src={tch.avatar} alt={tch.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <span className="line-clamp-1">{tch.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{tch.nip || '-'}</td>
                        <td className="py-3 px-4 font-bold text-indigo-600">{tch.subjectTaught || 'Produktif'}</td>
                        <td className="py-3 px-4 text-slate-600">{tch.class}</td>
                        <td className="py-3 px-4 text-slate-500">{tch.email}</td>
                        <td className="py-3 px-4 text-slate-500">{tch.phoneNumber || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {tch.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUserForBio(tch)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Lihat Biodata Lengkap"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(tch)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit Data Akun Guru"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(tch)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Akun Guru"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AKUN KEPALA SEKOLAH (BIODATA & LIST)                              */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kepsek' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                Pimpinan Eksekutif Sekolah
              </span>
              <span className="px-3 py-1 bg-white/10 text-slate-200 text-xs font-bold rounded-full border border-white/10">
                {registeredKepsek.length} Akun Terdaftar
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Direktori & Biodata Akun Kepala Sekolah
            </h2>
            <p className="text-xs text-amber-200">
              Hak akses pimpinan eksekutif untuk monitoring mutu sekolah, audit capaian akademik, evaluasi guru, dan persetujuan nilai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredKepsek.map((kep) => (
              <div
                key={kep.id}
                className="bg-white p-6 rounded-3xl border-2 border-amber-200 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-50 rounded-full pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={kep.avatar}
                        alt={kep.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          Kepala Sekolah
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">
                          {kep.name}
                        </h3>
                        <div className="text-xs font-mono font-bold text-slate-600">
                          NIP: {kep.nip || '196811201994031002'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2 text-xs">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-700" />
                      {kep.titleRole || `Pimpinan Eksekutif ${import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}`}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Wewenang: Memantau ketercapaian mutu kelulusan, persetujuan modul dan ujian, laporan eksekutif GPA & statistik sekolah.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{kep.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{kep.phoneNumber || '081198765405'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-emerald-700 font-bold">Status Akun: Aktif (Verified Eksekutif)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserForBio(kep)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-200 flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Biodata
                    </button>
                    <button
                      onClick={() => handleOpenEditUser(kep)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      title="Edit Data Akun Kepsek"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Akun
                    </button>
                  </div>

                  <button
                    onClick={() => setUserToDelete(kep)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Akun Kepsek"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AKUN KURIKULUM (BIODATA & LIST)                                   */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kurikulum' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
                Manajemen Akademik & Kurikulum
              </span>
              <span className="px-3 py-1 bg-white/10 text-slate-200 text-xs font-bold rounded-full border border-white/10">
                {registeredKurikulum.length} Akun Terdaftar
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Direktori & Biodata Akun Tim Kurikulum
            </h2>
            <p className="text-xs text-blue-200">
              Hak akses pengawasan kurikulum merdeka (CP/TP/ATP), penjadwalan ulangan, validasi asesmen, dan rekap capaian belajar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredKurikulum.map((kur) => (
              <div
                key={kur.id}
                className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50 rounded-full pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={kur.avatar}
                        alt={kur.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                          Waka Kurikulum
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">
                          {kur.name}
                        </h3>
                        <div className="text-xs font-mono font-bold text-slate-600">
                          NIP: {kur.nip || '197603152002122003'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2 text-xs">
                    <div className="font-bold text-blue-950 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      {kur.titleRole || 'Koordinator Akademik & Kurikulum Merdeka'}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Wewenang: Merancang kalender asesmen, audit modul ajar seluruh guru, supervisi ujian sekolah, dan verifikasi nilai rapor.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{kur.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{kur.phoneNumber || '081198765404'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-emerald-700 font-bold">Status Akun: Aktif (Verified Kurikulum)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserForBio(kur)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-200 flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Biodata
                    </button>
                    <button
                      onClick={() => handleOpenEditUser(kur)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      title="Edit Data Akun Kurikulum"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Akun
                    </button>
                  </div>

                  <button
                    onClick={() => setUserToDelete(kur)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Akun Kurikulum"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AKUN ADMINISTRATOR IT (BIODATA & LIST)                           */}
      {/* ========================================================================= */}
      {activeAdminTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                Divisi Administrator & Database IT
              </span>
              <span className="px-3 py-1 bg-white/10 text-slate-200 text-xs font-bold rounded-full border border-white/10">
                {registeredAdmins.length} Akun Terdaftar
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Direktori & Biodata Akun Administrator IT
            </h2>
            <p className="text-xs text-purple-200">
              Hak akses superuser untuk registrasi seluruh civitas akademika, pengelolaan kelas & jurusan, serta audit status sistem sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAdmins.map((ad) => (
              <div
                key={ad.id}
                className="bg-white p-6 rounded-3xl border-2 border-purple-200 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-50 rounded-full pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={ad.avatar}
                        alt={ad.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                          Administrator IT
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">
                          {ad.name}
                        </h3>
                        <div className="text-xs font-mono font-bold text-slate-600">
                          NIP / ID: {ad.nip || '199001012015041001'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2 text-xs">
                    <div className="font-bold text-purple-950 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-700" />
                      {ad.titleRole || 'Tim Pengembang IT & Database Administrator'}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Wewenang: Registrasi akun seluruh civitas (Siswa, Guru, Kepsek, Kurikulum, Admin), pembuatan rombel kelas, dan audit server sekolah.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{ad.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{ad.phoneNumber || '081198765401'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="text-purple-700 font-bold">Akses: Superuser / IT Controller (Aktif)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserForBio(ad)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-200 flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Biodata
                    </button>
                    <button
                      onClick={() => handleOpenEditUser(ad)}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      title="Edit Data Akun Admin"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Akun
                    </button>
                  </div>

                  <button
                    onClick={() => setUserToDelete(ad)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Akun Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: DATABASE & SERVER HEALTH                                          */}
      {/* ========================================================================= */}
      {activeAdminTab === 'server' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Status Database & Server Backend
              </h3>
              <button
                onClick={onRefreshDbStatus}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Koneksi Driver</div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {dbStatus?.database.isMongoConnected ? 'Mongoose 8.x (Atlas Connected)' : 'Express Memory Ready'}
                </div>
                <div className="text-slate-500">Auto Reconnect Enabled</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Total Koleksi Skema</div>
                <div className="font-extrabold text-indigo-600 text-sm">8 Koleksi Terdefinisi</div>
                <div className="text-slate-500">classes, users, exams, tasks, dll.</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Engine Runtime</div>
                <div className="font-extrabold text-slate-900 text-sm">Node.js LTS (v22)</div>
                <div className="text-slate-500">Port 3000 • Host 0.0.0.0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BIODATA LENGKAP PENGGUNA                                           */}
      {/* ========================================================================= */}
      {selectedUserForBio && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Kartu Biodata Resmi Pengguna
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForBio(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img
                src={selectedUserForBio.avatar}
                alt={selectedUserForBio.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
              />
              <div className="space-y-1 text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                  {selectedUserForBio.role}
                </span>
                <h4 className="font-black text-base text-slate-900">
                  {selectedUserForBio.name}
                </h4>
                <div className="text-xs text-indigo-700 font-bold">
                  {selectedUserForBio.titleRole || selectedUserForBio.class}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  {selectedUserForBio.role === 'student' ? 'NISN (10 Digit)' : 'NIP / Kode Pegawai'}
                </span>
                <div className="font-mono font-black text-slate-900 mt-0.5">
                  {selectedUserForBio.role === 'student' ? selectedUserForBio.nisn : (selectedUserForBio.nip || '-')}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Jenis Kelamin</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selectedUserForBio.gender || 'Laki-laki'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Email Sekolah</span>
                <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  {selectedUserForBio.email}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nomor Kontak / WA</span>
                <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {selectedUserForBio.phoneNumber || '0812345678xx'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Status Akun</span>
                <div className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {selectedUserForBio.status || 'Aktif'}
                </div>
              </div>

              {selectedUserForBio.role === 'teacher' && selectedUserForBio.subjectTaught && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 col-span-2">
                  <span className="text-[10px] text-indigo-600 uppercase font-bold">Mata Pelajaran yang Diampu</span>
                  <div className="font-extrabold text-indigo-950 mt-0.5">
                    {selectedUserForBio.subjectTaught}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  const target = selectedUserForBio;
                  setSelectedUserForBio(null);
                  handleOpenEditUser(target);
                }}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Edit Akun Ini
              </button>

              <button
                onClick={() => setSelectedUserForBio(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup Biodata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT DATA PENGGUNA TERDAFTAR                                       */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Edit Data Akun Pengguna
                  </h3>
                  <p className="text-xs text-slate-500">
                    Memperbarui data akun untuk <strong>{editingUser.name}</strong> ({editingUser.role.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {editErrorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama lengkap civitas..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Resmi Sekolah *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="nama@smktb.sch.id"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Kata Sandi Baru (Password)</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Kosongkan jika tak diubah</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Masukkan password baru..."
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition"
                      tabIndex={-1}
                    >
                      {showEditPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hak Akses / Peran Akun *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="student">Siswa (Peserta Didik)</option>
                    <option value="teacher">Guru (Tenaga Pendidik)</option>
                    <option value="kepalasekolah">Kepala Sekolah (Eksekutif)</option>
                    <option value="kurikulum">Tim Kurikulum / Akademik</option>
                    <option value="admin">Administrator IT</option>
                  </select>
                </div>

                {editRole === 'student' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NISN Siswa (10 Digit Angka) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editNisn}
                      onChange={(e) => setEditNisn(e.target.value)}
                      placeholder="Contoh: 0071234567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NIP / Kode Pegawai *
                    </label>
                    <input
                      type="text"
                      value={editNip}
                      onChange={(e) => setEditNip(e.target.value)}
                      placeholder="198501012010011001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                    />
                  </div>
                )}

                {editRole === 'student' && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Penempatan Rombel Kelas *
                      </label>
                      <select
                        value={editClass}
                        onChange={(e) => setEditClass(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} - {c.majorName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {editRole === 'teacher' && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Mata Pelajaran yang Diampu</span>
                      <span className="text-[10px] text-amber-600 font-semibold">Pilih dari Master Mapel</span>
                    </label>
                    <input
                      type="text"
                      list="registered-subjects-datalist"
                      value={editSubjectTaught}
                      onChange={(e) => setEditSubjectTaught(e.target.value)}
                      placeholder="Contoh: Pemrograman Web (PWPB) / IPA"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                )}

                {editRole !== 'student' && editRole !== 'teacher' && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Jabatan / Gelar Posisi
                    </label>
                    <input
                      type="text"
                      value={editTitleRole}
                      onChange={(e) => setEditTitleRole(e.target.value)}
                      placeholder="Contoh: Kepala Sekolah / Waka Kurikulum"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0812345678xx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition shadow-md shadow-amber-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmittingEdit ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POP-UP KONFIRMASI / BATAL HAPUS DATA PENGGUNA                      */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Konfirmasi Hapus Data Akun?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-slate-800 font-bold">{userToDelete.name}</strong>{' '}
                ({userToDelete.role === 'student' ? `Siswa ${userToDelete.class || ''}` : userToDelete.role === 'teacher' ? `Guru ${userToDelete.subjectTaught || ''}` : userToDelete.role === 'kepalasekolah' ? 'Kepala Sekolah' : userToDelete.role === 'kurikulum' ? 'Kurikulum' : 'Admin IT'})?
              </p>
              <div className="bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-xl text-[11px] text-left mt-2">
                ⚠️ <strong>Perhatian:</strong> Data akun, profil, dan riwayat yang terkait akan dihapus dari server secara permanen.
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingUser ? (
                  'Menghapus...'
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Ya, Hapus Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
