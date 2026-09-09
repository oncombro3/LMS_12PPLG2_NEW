import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  GraduationCap,
  BookOpen,
  ArrowRight,
  KeyRound,
  UserCheck,
  AlertCircle,
  Hash,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, user?: User) => void;
  initialRole?: UserRole;
  usersRoster?: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'student',
  usersRoster = [],
}) => {
  const [loginTab, setLoginTab] = useState<'student_nisn' | 'staff_nip'>(
    initialRole === 'student' ? 'student_nisn' : 'staff_nip'
  );
  
  // Student Form State: Nama Lengkap & NISN (kosongkan secara default)
  const [studentFullName, setStudentFullName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Staff Form State: Nama Lengkap & NIP/Email (kosongkan secara default)
  const [staffFullName, setStaffFullName] = useState('');
  const [staffNip, setStaffNip] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>(
    initialRole !== 'student' ? initialRole : 'teacher'
  );
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const roleDisplayName: Record<UserRole, string> = {
    student: 'Siswa',
    teacher: 'Guru Pendidik',
    kurikulum: 'Kurikulum',
    kepalasekolah: 'Kepala Sekolah',
    admin: 'Admin IT',
  };

  useEffect(() => {
    if (initialRole === 'student') {
      setLoginTab('student_nisn');
    } else {
      setLoginTab('staff_nip');
      setStaffRole(initialRole);
    }
    setErrorMsg('');
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  // Student Login using Nama Lengkap, NISN & Password
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = studentFullName.trim();
    const cleanNisn = studentNisn.trim();
    const cleanPassword = studentPassword;

    if (!cleanName) {
      setErrorMsg('Harap masukkan Nama Lengkap Siswa.');
      return;
    }
    if (!cleanNisn) {
      setErrorMsg('Harap masukkan Nomor Induk Siswa Nasional (NISN).');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Harap masukkan Kata Sandi akun Siswa.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Search student in users roster
      const matchedStudent = usersRoster.find(
        (u) =>
          u.role === 'student' &&
          u.nisn.trim() === cleanNisn &&
          u.name.trim().toLowerCase() === cleanName.toLowerCase()
      );

      if (!matchedStudent) {
        // Detailed troubleshooting error
        const studentByNisn = usersRoster.find(
          (u) => u.role === 'student' && u.nisn.trim() === cleanNisn
        );
        if (studentByNisn) {
          setErrorMsg(`Nama Lengkap tidak cocok dengan data NISN ${cleanNisn} yang terdaftar di sistem.`);
          return;
        }

        const studentByName = usersRoster.find(
          (u) => u.role === 'student' && u.name.trim().toLowerCase() === cleanName.toLowerCase()
        );
        if (studentByName) {
          setErrorMsg(`NISN yang Anda masukkan tidak cocok dengan data siswa atas nama "${studentByName.name}".`);
          return;
        }

        setErrorMsg('Data Siswa tidak terdaftar! Pastikan Nama Lengkap dan NISN sesuai dengan data yang telah didaftarkan oleh Administrator.');
        return;
      }

      // Check status
      if (matchedStudent.status === 'Nonaktif') {
        setErrorMsg(`Akun siswa atas nama ${matchedStudent.name} sedang berstatus Nonaktif. Silakan hubungi Administrator sekolah.`);
        return;
      }

      // Check password
      const expectedPassword = matchedStudent.password || 'password123';
      if (cleanPassword !== expectedPassword) {
        setErrorMsg('Kata sandi salah! Silakan periksa kembali kata sandi akun Anda.');
        return;
      }

      // Success
      onLoginSuccess('student', matchedStudent);
      onClose();
    }, 350);
  };

  // Staff / Guru / Kurikulum / Kepsek / Admin Login
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = staffFullName.trim();
    const cleanNip = staffNip.trim();
    const cleanPassword = staffPassword;

    if (!cleanName) {
      setErrorMsg(`Harap masukkan Nama Lengkap ${roleDisplayName[staffRole]}.`);
      return;
    }
    if (!cleanNip) {
      setErrorMsg('Harap masukkan NIP atau Email Resmi.');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Harap masukkan Kata Sandi akun.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Search matching staff in roster
      const matchedStaff = usersRoster.find((u) => {
        const matchesRole = u.role === staffRole;
        const matchesNipOrEmail =
          (u.nip && u.nip.trim() === cleanNip) ||
          (u.email && u.email.trim().toLowerCase() === cleanNip.toLowerCase());
        const matchesName = u.name.trim().toLowerCase() === cleanName.toLowerCase();
        return matchesRole && matchesNipOrEmail && matchesName;
      });

      if (!matchedStaff) {
        // Detailed troubleshooting error
        const staffByNipOrEmail = usersRoster.find(
          (u) =>
            (u.nip && u.nip.trim() === cleanNip) ||
            (u.email && u.email.trim().toLowerCase() === cleanNip.toLowerCase())
        );

        if (staffByNipOrEmail) {
          if (staffByNipOrEmail.role !== staffRole) {
            setErrorMsg(
              `Akun dengan NIP/Email ${cleanNip} (${staffByNipOrEmail.name}) terdaftar sebagai peran ${roleDisplayName[staffByNipOrEmail.role]}, bukan ${roleDisplayName[staffRole]}. Silakan pilih peran yang sesuai.`
            );
            return;
          }
          if (staffByNipOrEmail.name.trim().toLowerCase() !== cleanName.toLowerCase()) {
            setErrorMsg(
              `Nama Lengkap tidak cocok dengan data NIP/Email ${cleanNip} yang terdaftar di sistem.`
            );
            return;
          }
        }

        const staffByName = usersRoster.find(
          (u) =>
            u.role === staffRole &&
            u.name.trim().toLowerCase() === cleanName.toLowerCase()
        );
        if (staffByName) {
          setErrorMsg(
            `NIP/Email yang Anda masukkan tidak cocok dengan data atas nama "${staffByName.name}".`
          );
          return;
        }

        setErrorMsg(
          `Data akun ${roleDisplayName[staffRole]} tidak terdaftar! Pastikan Nama, NIP/Email, dan Peran sesuai dengan data yang telah dibuat oleh Administrator.`
        );
        return;
      }

      // Check status
      if (matchedStaff.status === 'Nonaktif') {
        setErrorMsg(`Akun (${matchedStaff.name}) sedang berstatus Nonaktif. Silakan hubungi Administrator.`);
        return;
      }

      // Check password
      const expectedPassword = matchedStaff.password || 'password123';
      if (cleanPassword !== expectedPassword) {
        setErrorMsg('Kata sandi salah! Silakan periksa kembali kata sandi akun Anda.');
        return;
      }

      // Success
      onLoginSuccess(staffRole, matchedStaff);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <KeyRound className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight">Masuk ke Portal LMS</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Autentikasi akun resmi dengan <strong>Nama</strong>, <strong>Nomor Induk</strong> & <strong>Kata Sandi</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Login Siswa vs Guru/Staff */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-full">
            <button
              onClick={() => {
                setLoginTab('student_nisn');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                loginTab === 'student_nisn'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Login Siswa (Nama + NISN)</span>
            </button>

            <button
              onClick={() => {
                setLoginTab('staff_nip');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                loginTab === 'staff_nip'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guru / Staf (Nama + NIP)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN SISWA (NAMA LENGKAP, NISN & PASSWORD) */}
          {loginTab === 'student_nisn' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-xs text-indigo-950">
                  <strong className="font-extrabold block">Autentikasi Akun Siswa</strong>
                  Masukkan <strong>Nama Lengkap</strong>, <strong>NISN</strong>, dan <strong>Kata Sandi</strong> yang telah terdaftar di database sekolah.
                </div>
              </div>

              {/* Input 1: Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap sesuai data admin"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Input 2: NISN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Induk Siswa Nasional (NISN) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan 10 digit NISN yang terdaftar"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Input 3: Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun Anda"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showStudentPassword ? 'Sembunyikan' : 'Lihat Sandi'}
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memverifikasi Akun Siswa...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Masuk Sebagai Siswa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LOGIN GURU & STAF (ROLE, NAMA, NIP & PASSWORD) */}
          {loginTab === 'staff_nip' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Peran Tenaga Pendidik / Staf:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: 'teacher' as UserRole, label: 'Guru Pendidik' },
                    { role: 'kurikulum' as UserRole, label: 'Kurikulum' },
                    { role: 'kepalasekolah' as UserRole, label: 'Kepala Sekolah' },
                    { role: 'admin' as UserRole, label: 'Admin IT' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.role}
                      onClick={() => {
                        setStaffRole(r.role);
                        setErrorMsg('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition text-xs font-bold ${
                        staffRole === r.role
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap Staff */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap ({roleDisplayName[staffRole]}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap sesuai data admin"
                    value={staffFullName}
                    onChange={(e) => setStaffFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* NIP / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Induk Pegawai (NIP) / Email Resmi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIP atau Email resmi terdaftar"
                    value={staffNip}
                    onChange={(e) => setStaffNip(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showStaffPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun Anda"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showStaffPassword ? 'Sembunyikan' : 'Lihat Sandi'}
                  >
                    {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memverifikasi Akun {roleDisplayName[staffRole]}...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Masuk Sebagai {roleDisplayName[staffRole]}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Validasi Ketat: <strong>Nama + Nomor Induk + Kata Sandi</strong></span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold"
          >
            Batal & Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

