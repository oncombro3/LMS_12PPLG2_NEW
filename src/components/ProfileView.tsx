import React, { useState } from 'react';
import {
  User as UserIcon,
  Camera,
  ShieldCheck,
  Shield,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  BookOpen,
  Award,
  Flame,
  Clock,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  School,
  Building2,
  Users,
  Image as ImageIcon,
  Check,
  Info,
} from 'lucide-react';
import { User, ClassRoom, UserRole } from '../types';

interface ProfileViewProps {
  currentUser: User;
  classes: ClassRoom[];
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void> | void;
}

// Koleksi Avatar Preset Karakter Kartun Berkualitas Tinggi (DiceBear Edition)
const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4' },
  { id: 'av-2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aditya&backgroundColor=c0aede' },
  { id: 'av-3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bintang&backgroundColor=d1d4f9' },
  { id: 'av-4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dimas&backgroundColor=ffdfbf' },
  { id: 'av-5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bayu&backgroundColor=bbf7d0' },
  { id: 'av-6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rendy&backgroundColor=ffd5dc' },
  { id: 'av-7', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kevin&backgroundColor=fed7aa' },
  { id: 'av-8', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Reza&backgroundColor=e9d5ff' },
  { id: 'av-9', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rafi&backgroundColor=b6e3f4' },
  { id: 'av-10', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dani&backgroundColor=c0aede' },
  { id: 'av-11', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gilang&backgroundColor=d1d4f9' },
  { id: 'av-12', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fajar&backgroundColor=ffdfbf' },
  { id: 'av-13', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anisa&backgroundColor=ffd5dc' },
  { id: 'av-14', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Citra&backgroundColor=ffd5dc' },
  { id: 'av-15', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dina&backgroundColor=c0aede' },
  { id: 'av-16', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fatimah&backgroundColor=b6e3f4' },
  { id: 'av-17', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zahra&backgroundColor=fed7aa' },
  { id: 'av-18', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Naila&backgroundColor=e9d5ff' },
  { id: 'av-19', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Putri&backgroundColor=bbf7d0' },
  { id: 'av-20', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maya&backgroundColor=d1d4f9' },
  { id: 'av-21', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah&backgroundColor=ffd5dc' },
  { id: 'av-22', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tiara&backgroundColor=b6e3f4' },
  { id: 'av-23', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella&backgroundColor=c0aede' },
  { id: 'av-24', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Salma&backgroundColor=ffdfbf' },
  { id: 'av-25', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HendraTeacher&backgroundColor=b6e3f4' },
  { id: 'av-26', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DewiTeacher&backgroundColor=ffd5dc' },
  { id: 'av-27', url: 'https://api.dicebear.com/7.x/micah/svg?seed=ProfAris&backgroundColor=ffd5dc' },
  { id: 'av-28', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=RatnaTeacher&backgroundColor=d1d4f9' },
  { id: 'av-29', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FauziTeacher&backgroundColor=c0aede' },
  { id: 'av-30', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SitiTeacher&backgroundColor=ffd5dc' },
  { id: 'av-31', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WahyuTeacher&backgroundColor=b6e3f4' },
  { id: 'av-32', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MayaTeacher&backgroundColor=fed7aa' },
  { id: 'av-33', url: 'https://api.dicebear.com/7.x/micah/svg?seed=AgusTeacher&backgroundColor=bbf7d0' },
  { id: 'av-34', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IndahTeacher&backgroundColor=e9d5ff' },
  { id: 'av-35', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FarhanTech&backgroundColor=b6e3f4' },
  { id: 'av-36', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot&backgroundColor=c0aede' },
  { id: 'av-37', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelBot&backgroundColor=ffd5dc' },
  { id: 'av-38', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=d1d4f9' },
  { id: 'av-39', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonCoder&backgroundColor=ffdfbf' },
  { id: 'av-40', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoboHelper&backgroundColor=bbf7d0' },
  { id: 'av-41', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlphaBot&backgroundColor=fed7aa' },
  { id: 'av-42', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurboDroid&backgroundColor=e9d5ff' },
  { id: 'av-43', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum&backgroundColor=b6e3f4' },
  { id: 'av-44', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Byte&backgroundColor=c0aede' },
  { id: 'av-45', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=c0aede' },
  { id: 'av-46', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc' },
  { id: 'av-47', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia&backgroundColor=d1d4f9' },
  { id: 'av-48', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=b6e3f4' },
  { id: 'av-49', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=fed7aa' },
  { id: 'av-50', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=bbf7d0' },
  { id: 'av-51', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=ffd5dc' },
  { id: 'av-52', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe&backgroundColor=e9d5ff' },
  { id: 'av-53', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=ffdfbf' },
  { id: 'av-54', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy&backgroundColor=b6e3f4' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  classes,
  onUpdateUser,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'biodata' | 'avatar' | 'security'>('biodata');

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phoneNumber: currentUser.phoneNumber || '',
    bio: currentUser.bio || '',
    address: currentUser.address || '',
    birthPlace: currentUser.birthPlace || '',
    birthDate: currentUser.birthDate || '',
    religion: currentUser.religion || 'Islam',
    guardianName: currentUser.guardianName || '',
    guardianPhone: currentUser.guardianPhone || '',
    // Locked / Admin editable fields
    role: currentUser.role,
    nisn: currentUser.nisn || '',
    nip: currentUser.nip || '',
    class: currentUser.class || '',
    gender: currentUser.gender || 'Laki-laki',
    status: currentUser.status || 'Aktif',
    subjectTaught: currentUser.subjectTaught || '',
  });

  // Avatar Management State
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar);

  // Security / Password State
  const [passwordState, setPasswordState] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setSaveErrorMsg(msg);
      setSaveSuccessMsg(null);
      setTimeout(() => setSaveErrorMsg(null), 4000);
    } else {
      setSaveSuccessMsg(msg);
      setSaveErrorMsg(null);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Biodata Updates
  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: Partial<User> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        bio: formData.bio.trim(),
        address: formData.address.trim(),
        birthPlace: formData.birthPlace.trim(),
        birthDate: formData.birthDate,
        religion: formData.religion,
        guardianName: formData.guardianName.trim(),
        guardianPhone: formData.guardianPhone.trim(),
      };

      // Jika user adalah ADMIN, mereka dapat merubah biodata fiks kelembagaan
      if (isAdmin) {
        updates.role = formData.role as UserRole;
        updates.nisn = formData.nisn.trim();
        updates.nip = formData.nip.trim();
        updates.class = formData.class;
        updates.gender = formData.gender;
        updates.status = formData.status as 'Aktif' | 'Nonaktif';
        updates.subjectTaught = formData.subjectTaught.trim();
      }

      await onUpdateUser(currentUser.id, updates);
      showNotification('✅ Biodata profil berhasil diperbarui dan tersimpan ke sistem!');
    } catch (err: any) {
      showNotification('Gagal memperbarui biodata: ' + (err?.message || 'Terjadi kesalahan'), true);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Avatar Update
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      await onUpdateUser(currentUser.id, { avatar: selectedAvatar });
      showNotification('✅ Avatar kartun profil berhasil diperbarui!');
    } catch (err: any) {
      showNotification('Gagal memperbarui avatar: ' + (err?.message || 'Terjadi kesalahan'), true);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.newPassword) {
      showNotification('Kata sandi baru tidak boleh kosong', true);
      return;
    }
    if (passwordState.newPassword.length < 6) {
      showNotification('Kata sandi minimal 6 karakter demi keamanan akun', true);
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      showNotification('Konfirmasi kata sandi tidak cocok dengan kata sandi baru', true);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateUser(currentUser.id, { password: passwordState.newPassword });
      setPasswordState({ newPassword: '', confirmPassword: '' });
      showNotification('✅ Kata sandi akun berhasil diperbarui secara aman!');
    } catch (err: any) {
      showNotification('Gagal memperbarui kata sandi: ' + (err?.message || 'Terjadi kesalahan'), true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback Notification */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-bold flex-1">{saveSuccessMsg}</p>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl flex items-center gap-3 shadow-xs animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs sm:text-sm font-bold flex-1">{saveErrorMsg}</p>
        </div>
      )}

      {/* Profile Hero Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover Background */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-extrabold rounded-xl border border-white/20">
              {currentUser.role === 'student'
                ? 'Akun Siswa'
                : currentUser.role === 'teacher'
                ? 'Akun Guru'
                : currentUser.role === 'kurikulum'
                ? 'Akun Kurikulum'
                : currentUser.role === 'kepalasekolah'
                ? 'Akun Kepala Sekolah'
                : 'Akun Administrator IT'}
            </span>
          </div>
        </div>

        {/* Profile Card Content */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar with Camera Button */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-white">
                <img
                  src={selectedAvatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Quick Camera Trigger */}
              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg ring-2 ring-white transition transform hover:scale-105"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => setActiveTab('avatar')}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200/80"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ganti Foto Profil</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ganti Sandi</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentUser.status === 'Nonaktif'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentUser.status || 'Aktif'}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 flex flex-wrap items-center gap-2">
              <span>{currentUser.titleRole || (currentUser.role === 'student' ? `Siswa ${currentUser.class}` : 'Civitas Akademika')}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">
                {currentUser.role === 'student' ? `NISN: ${currentUser.nisn || '-'}` : `NIP: ${currentUser.nip || '-'}`}
              </span>
              {currentUser.class && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-bold">{currentUser.class}</span>
                </>
              )}
            </p>

            {currentUser.bio && (
              <p className="text-xs text-slate-500 pt-1 italic max-w-2xl">
                "{currentUser.bio}"
              </p>
            )}
          </div>

          {/* Academic Info & Status Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Status Akun</span>
              </div>
              <p className="text-base sm:text-lg font-black text-emerald-600 font-mono mt-0.5">
                {currentUser.status || 'Aktif'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Peran Sistem</span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5 capitalize">
                {currentUser.role === 'student' ? 'Siswa / Siswi' : currentUser.role}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span>Rombel / Penugasan</span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                {currentUser.class || currentUser.subjectTaught || 'PPLG'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <School className="w-4 h-4 text-blue-500" />
                <span>Tahun Ajaran</span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                2025/2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('biodata')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
            activeTab === 'biodata'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Biodata Lengkap</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
            activeTab === 'avatar'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Ganti Avatar Kartun</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Sandi</span>
        </button>
      </div>

      {/* TAB 1: BIODATA & INFORMASI AKUN */}
      {activeTab === 'biodata' && (
        <form onSubmit={handleSaveBiodata} className="space-y-6">
          {/* Policy / Role Access Alert Banner */}
          {!isAdmin ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-3xl flex items-start gap-3.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-extrabold text-amber-900">
                  Proteksi Data Resmi Sekolah (Mode Terbatas)
                </h4>
                <p className="text-amber-800/90 leading-relaxed text-xs">
                  Anda dapat mengubah data profil umum, kontak, dan alamat. Namun data registrasi resmi seperti{' '}
                  <strong className="font-bold underline">
                    {currentUser.role === 'student'
                      ? 'Peran Akun, NISN (10 Digit), Penempatan Rombel Kelas, Jenis Kelamin, dan Status Akun'
                      : 'Peran Akun, NIP, Mapel/Penugasan, Jenis Kelamin, dan Status Akun'}
                  </strong>{' '}
                  bersifat <strong>TERKUNCI</strong> demi validitas data kelembagaan sekolah. Perubahan data resmi hanya dapat dilakukan melalui Administrator IT.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-3xl flex items-start gap-3.5">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-extrabold text-purple-900">
                  Hak Akses Penuh Administrator IT
                </h4>
                <p className="text-purple-800 text-xs">
                  Sebagai Administrator IT, Anda memiliki wewenang penuh untuk mengubah semua parameter biodata, termasuk peranan sistem, NISN/NIP, rombel kelas, jenis kelamin, serta status akun.
                </p>
              </div>
            </div>
          )}

          {/* Section A: Biodata Umum yang Dapat Diubah */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>Biodata Pribadi & Kontak</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Informasi ini dapat Anda perbarui secara mandiri kapan saja.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                Dapat Diubah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Sesuai Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Muhammad Farhan Ramadhan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Sekolah / Pribadi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="nama@smktb.sch.id"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Nomor Telepon / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor HP / WhatsApp Aktif
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Agama
                </label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta / Depok"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Lahir
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Alamat Domisili */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Tempat Tinggal / Domisili
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Alamat lengkap jalan, RT/RW, kelurahan, kecamatan..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bio / Motto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bio / Motto Belajar / Catatan Profil
              </label>
              <textarea
                name="bio"
                rows={2}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tuliskan motto atau deskripsi singkat mengenai diri Anda..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Khusus Siswa: Data Orang Tua / Wali */}
            {currentUser.role === 'student' && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Data Orang Tua / Wali Siswa:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      placeholder="Nama lengkap ayah / ibu / wali"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      No. WhatsApp Orang Tua / Wali
                    </label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section B: Data Kelembagaan & Registrasi Resmi (TERKUNCI untuk Non-Admin, EDITABLE untuk Admin) */}
          <div className={`bg-white rounded-3xl border p-6 shadow-xs space-y-5 ${
            isAdmin ? 'border-purple-200 ring-2 ring-purple-100' : 'border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-purple-600' : 'text-slate-500'}`} />
                  <span>Data Registrasi & Kelembagaan Resmi</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? 'Mode Admin Aktif: Anda memiliki akses penuh untuk merubah kolom berikut.'
                    : 'Data di bawah ini dikunci oleh sistem dan hanya dapat diubah oleh Administrator IT.'}
                </p>
              </div>

              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin Full Akses</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Terkunci Resmi</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Peran / Hak Akses Akun */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Hak Akses / Peran Akun
                  </label>
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                {isAdmin ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="student">Siswa</option>
                    <option value="teacher">Guru</option>
                    <option value="kurikulum">Kurikulum</option>
                    <option value="kepalasekolah">Kepala Sekolah</option>
                    <option value="admin">Admin IT</option>
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                    <span>
                      {currentUser.role === 'student'
                        ? 'Siswa (Peserta Didik)'
                        : currentUser.role === 'teacher'
                        ? 'Guru (Tenaga Pendidik)'
                        : currentUser.role === 'kurikulum'
                        ? 'Staf Kurikulum'
                        : currentUser.role === 'kepalasekolah'
                        ? 'Kepala Sekolah'
                        : 'Administrator IT'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* NISN (Siswa) atau NIP (Guru/Staf) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {currentUser.role === 'student' ? 'NISN Siswa (10 Digit)' : 'NIP / NUPTK'}
                  </label>
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                {isAdmin ? (
                  <input
                    type="text"
                    name={currentUser.role === 'student' ? 'nisn' : 'nip'}
                    value={currentUser.role === 'student' ? formData.nisn : formData.nip}
                    onChange={handleChange}
                    placeholder={currentUser.role === 'student' ? '10 Digit NISN' : '18 Digit NIP'}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                    <span>{currentUser.role === 'student' ? (currentUser.nisn || '-') : (currentUser.nip || '-')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Penempatan Rombel Kelas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Penempatan Rombel Kelas
                  </label>
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                {isAdmin ? (
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name} ({cls.majorName})
                      </option>
                    ))}
                    <option value="Guru Pengampu">Guru Pengampu Semua Kelas</option>
                    <option value="Staf Kurikulum">Staf Kurikulum</option>
                    <option value="Pimpinan Sekolah">Pimpinan Sekolah</option>
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                    <span>{currentUser.class || 'Belum Ditentukan'}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Jenis Kelamin
                  </label>
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                {isAdmin ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                    <span>{currentUser.gender || 'Laki-laki'}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Status Akun */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Status Akun
                  </label>
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                {isAdmin ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {currentUser.status || 'Aktif'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Locked
                    </span>
                  </div>
                )}
              </div>

              {/* Mata Pelajaran Diampu (Khusus Guru) */}
              {(currentUser.role === 'teacher' || isAdmin) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Mata Pelajaran Diampu
                    </label>
                    {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                  </div>

                  {isAdmin ? (
                    <input
                      type="text"
                      name="subjectTaught"
                      value={formData.subjectTaught}
                      onChange={handleChange}
                      placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-semibold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between cursor-not-allowed">
                      <span className="truncate">{currentUser.subjectTaught || 'Produktif Kejuruan'}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded shrink-0">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-200 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Biodata</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: GANTI FOTO PROFIL & AVATAR */}
      {activeTab === 'avatar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Pilih Avatar Kartun Profil</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih karakter avatar kartun favorit Anda dari koleksi lengkap di bawah ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSaving || selectedAvatar === currentUser.avatar}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-200 transition disabled:opacity-40"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Terapkan Avatar Ini</span>
              </button>
            </div>
          </div>

          {/* Current vs Selected Avatar Preview */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-purple-50/60 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-indigo-600 shadow-xl bg-white flex items-center justify-center">
                  <img
                    src={selectedAvatar}
                    alt="Preview Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow">
                  Preview
                </span>
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Avatar Kartun Terpilih:
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedAvatar === currentUser.avatar
                    ? 'Ini adalah avatar profil Anda saat ini.'
                    : 'Avatar baru belum disimpan. Klik "Terapkan Avatar Ini" untuk menyimpan ke profil.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAvatar(currentUser.avatar)}
                className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 transition"
              >
                Reset ke Avatar Asal
              </button>
            </div>
          </div>

          {/* Galeri Avatar Preset Karakter Kartun */}
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Pilih Foto Avatar Kartun ({PRESET_AVATARS.length} Pilihan)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik salah satu gambar avatar kartun di bawah ini untuk menggunakannya sebagai foto profil.
              </p>
            </div>

            {/* Grid Preset Kartun Tanpa Nama & Kategori */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
              {PRESET_AVATARS.map((item) => {
                const isSelected = selectedAvatar === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvatar(item.url)}
                    className={`relative p-2 rounded-2xl border transition flex items-center justify-center group aspect-square ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600 shadow-md scale-105'
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 hover:scale-105 hover:shadow-xs'
                    }`}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                      <img
                        src={item.url}
                        alt="Avatar Kartun"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Save Reminder */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSaving || selectedAvatar === currentUser.avatar}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-200 transition disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Avatar Kartun</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: KEAMANAN & KATA SANDI */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Ganti Kata Sandi Akun</span>
            </h3>
            <p className="text-xs text-slate-500">
              Perbarui kata sandi secara berkala untuk menjaga kerahasiaan ujian dan data pembelajaran Anda.
            </p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  placeholder="Minimal 6 karakter..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                placeholder="Ulangi kata sandi baru..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tips Kata Sandi yang Kuat:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pt-1">
                <li>Gunakan kombinasi huruf besar, huruf kecil, dan angka.</li>
                <li>Hindari menggunakan tanggal lahir atau nama depan saja.</li>
                <li>Jangan bagikan kata sandi akun Anda kepada orang lain.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-200 transition disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
