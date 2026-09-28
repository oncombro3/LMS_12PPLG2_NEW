import React, { useState } from 'react';
import {
  Award,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Save,
  X,
  Palette,
  GraduationCap,
  School,
  Briefcase,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { MajorItem, User, ClassRoom } from '../types';

interface AdminMajorsTabProps {
  majors: MajorItem[];
  users?: User[];
  classes?: ClassRoom[];
  onCreateMajor?: (data: Partial<MajorItem>) => Promise<void>;
  onUpdateMajor?: (id: string, updates: Partial<MajorItem>) => Promise<void>;
  onDeleteMajor?: (id: string) => Promise<void>;
}

const COLOR_MAP: Record<
  string,
  { bgBadge: string; textBadge: string; borderCard: string; dot: string; lightBg: string; gradient: string }
> = {
  indigo: {
    bgBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    textBadge: 'text-indigo-700',
    borderCard: 'border-indigo-200/80 hover:border-indigo-400',
    dot: 'bg-indigo-600',
    lightBg: 'bg-indigo-50/50',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  blue: {
    bgBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    textBadge: 'text-blue-700',
    borderCard: 'border-blue-200/80 hover:border-blue-400',
    dot: 'bg-blue-600',
    lightBg: 'bg-blue-50/50',
    gradient: 'from-blue-500 to-blue-600',
  },
  emerald: {
    bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    textBadge: 'text-emerald-700',
    borderCard: 'border-emerald-200/80 hover:border-emerald-400',
    dot: 'bg-emerald-600',
    lightBg: 'bg-emerald-50/50',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  amber: {
    bgBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    textBadge: 'text-amber-700',
    borderCard: 'border-amber-200/80 hover:border-amber-400',
    dot: 'bg-amber-600',
    lightBg: 'bg-amber-50/50',
    gradient: 'from-amber-500 to-amber-600',
  },
  rose: {
    bgBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    textBadge: 'text-rose-700',
    borderCard: 'border-rose-200/80 hover:border-rose-400',
    dot: 'bg-rose-600',
    lightBg: 'bg-rose-50/50',
    gradient: 'from-rose-500 to-rose-600',
  },
  purple: {
    bgBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    textBadge: 'text-purple-700',
    borderCard: 'border-purple-200/80 hover:border-purple-400',
    dot: 'bg-purple-600',
    lightBg: 'bg-purple-50/50',
    gradient: 'from-purple-500 to-purple-600',
  },
  teal: {
    bgBadge: 'bg-teal-100 text-teal-800 border-teal-200',
    textBadge: 'text-teal-700',
    borderCard: 'border-teal-200/80 hover:border-teal-400',
    dot: 'bg-teal-600',
    lightBg: 'bg-teal-50/50',
    gradient: 'from-teal-500 to-teal-600',
  },
  cyan: {
    bgBadge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    textBadge: 'text-cyan-700',
    borderCard: 'border-cyan-200/80 hover:border-cyan-400',
    dot: 'bg-cyan-600',
    lightBg: 'bg-cyan-50/50',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  orange: {
    bgBadge: 'bg-orange-100 text-orange-800 border-orange-200',
    textBadge: 'text-orange-700',
    borderCard: 'border-orange-200/80 hover:border-orange-400',
    dot: 'bg-orange-600',
    lightBg: 'bg-orange-50/50',
    gradient: 'from-orange-500 to-orange-600',
  },
};

const MAJOR_PRESETS = [
  {
    code: 'PPLG',
    name: 'Pengembangan Perangkat Lunak & Gim',
    category: 'Teknologi Informasi & Software',
    color: 'indigo',
    headOfDepartment: 'Hendra Setiawan, S.Kom., M.Kom.',
    description: 'Fokus pada rekayasa perangkat lunak modern, web full-stack, mobile apps, game development, dan cloud architecture.',
    skills: 'Web Full-Stack, Mobile Apps, Game Dev (Unity), Database & REST API, Cloud DevOps',
    careerProspects: 'Software Engineer, Fullstack Developer, Mobile App Developer, Game Programmer',
  },
  {
    code: 'TJKT',
    name: 'Teknik Jaringan Komputer dan Telekomunikasi',
    category: 'Teknologi Jaringan & Sistem',
    color: 'blue',
    headOfDepartment: 'Ahmad Fauzi, S.T.',
    description: 'Perancangan topologi jaringan, konfigurasi router/switch enterprise, sistem serat optik, server Linux, dan keamanan siber.',
    skills: 'MikroTik & Cisco CCNA, Linux Server Admin, Fiber Optic Splicing, Cybersecurity, Cloud Networking',
    careerProspects: 'Network Engineer, System Administrator, Cybersecurity Analyst, Cloud Support Specialist',
  },
  {
    code: 'DKV',
    name: 'Desain Komunikasi Visual',
    category: 'Seni Kreatif & Multimedia',
    color: 'purple',
    headOfDepartment: 'Raden Bayu Pratama, S.Sn.',
    description: 'Visual branding, ilustrasi digital, UI/UX design, motion graphics, videografi sinematik, dan pemodelan 3D.',
    skills: 'Brand Identity & Logo, UI/UX Design (Figma), Motion Graphics, Video Production, 3D Asset Modelling',
    careerProspects: 'Graphic Designer, UI/UX Designer, Motion Animator, Video Content Creator',
  },
  {
    code: 'PM',
    name: 'Pemasaran',
    category: 'Bisnis & Manajemen Retail',
    color: 'amber',
    headOfDepartment: 'Rini Astuti, S.E., M.M.',
    description: 'Pemasaran digital komprehensif, operasional e-commerce marketplace, copywriting, social media ads, dan ritel modern.',
    skills: 'Digital Marketing, E-Commerce Operations, SEO & Performance Ads, Copywriting, Business Negotiation',
    careerProspects: 'Digital Marketer, E-Commerce Specialist, Social Media Strategist, Retail Store Manager',
  },
  {
    code: 'PH',
    name: 'Perhotelan',
    category: 'Pariwisata & Hospitality',
    color: 'rose',
    headOfDepartment: 'Siska Amelia, S.Tr.Par.',
    description: 'Operasional hotel berbintang, front office management, housekeeping prima, food & beverage service, dan customer relation.',
    skills: 'Front Office PMS, Professional Housekeeping, Food & Beverage Service, Hospitality Communication',
    careerProspects: 'Front Office Officer, Executive Housekeeper, F&B Supervisor, Hotel Operations Staff',
  },
  {
    code: 'MPLB',
    name: 'Manajemen Perkantoran dan Layanan Bisnis',
    category: 'Administrasi & Bisnis',
    color: 'emerald',
    headOfDepartment: 'Fitria Handayani, S.Pd.',
    description: 'Administrasi kantor digital, korespondensi resmi, paperless office automation, arsip cloud, dan protokol bisnis.',
    skills: 'Digital Office Automation, Business Correspondence, Cloud Records Management, Event & Meeting Protocol',
    careerProspects: 'Executive Secretary, Office Administrator, Document Controller, Virtual Assistant',
  },
  {
    code: 'AKL',
    name: 'Akuntansi dan Keuangan Lembaga',
    category: 'Keuangan & Perbankan',
    color: 'teal',
    headOfDepartment: 'Dra. Sri Wahyuni, M.Ak.',
    description: 'Siklus akuntansi manual & berbasis komputer (MYOB/Accurate), perpajakan, audit pembukuan, dan perbankan syariah/konvensional.',
    skills: 'Akuntansi Keuangan, MYOB / Accurate Software, Perpajakan (PPh/PPN), Spreadsheet Keuangan',
    careerProspects: 'Staff Akuntansi, Junior Auditor, Tax Consultant Assistant, Teller Perbankan',
  },
  {
    code: 'TKRO',
    name: 'Teknik Kendaraan Ringan Otomotif',
    category: 'Teknik Otomotif & Mekatronika',
    color: 'orange',
    headOfDepartment: 'Bambang Sugeng, S.Pd.',
    description: 'Diagnosa sistem EFI mobil modern, overhaul mesin, kelistrikan bodi otomotif, chasis suspensi, dan servis berkala bersertifikasi.',
    skills: 'Engine EFI Diagnosis & Scanner, Electrical Chassis, Overhaul Transmisi, Servis AC & Rem ABS',
    careerProspects: 'Mekanik Teknisi Mobil, Service Advisor, Teknisi Uji Emisi, Wirausaha Bengkel Mandiri',
  },
];

export const AdminMajorsTab: React.FC<AdminMajorsTabProps> = ({
  majors,
  users = [],
  classes = [],
  onCreateMajor,
  onUpdateMajor,
  onDeleteMajor,
}) => {
  // Form State: Tambah Jurusan Baru
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Teknologi Informasi & Software');
  const [color, setColor] = useState('indigo');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [careerStr, setCareerStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & View mode
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit Modal State
  const [editingMajor, setEditingMajor] = useState<MajorItem | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('indigo');
  const [editHead, setEditHead] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSkillsStr, setEditSkillsStr] = useState('');
  const [editCareerStr, setEditCareerStr] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Delete Modal State
  const [deletingMajor, setDeletingMajor] = useState<MajorItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper count active students for a given major
  const getActiveStudentsCount = (majorItem: MajorItem) => {
    return users.filter((u) => {
      if (u.role !== 'student') return false;
      const codeMatch = u.majorCode && u.majorCode.toUpperCase() === majorItem.code.toUpperCase();
      const nameMatch =
        (u.jurusan && u.jurusan.toLowerCase() === majorItem.name.toLowerCase()) ||
        (u.majorName && u.majorName.toLowerCase() === majorItem.name.toLowerCase());
      const classMatch = classes.some(
        (c) => c.name === u.class && c.majorCode?.toUpperCase() === majorItem.code.toUpperCase()
      );
      return codeMatch || nameMatch || classMatch;
    }).length;
  };

  // Helper count classes for a given major
  const getMajorClassesCount = (majorItem: MajorItem) => {
    return classes.filter(
      (c) =>
        (c.majorCode && c.majorCode.toUpperCase() === majorItem.code.toUpperCase()) ||
        (c.majorName && c.majorName.toLowerCase() === majorItem.name.toLowerCase())
    ).length;
  };

  // Apply Quick Preset
  const handleApplyPreset = (preset: typeof MAJOR_PRESETS[0]) => {
    setCode(preset.code);
    setName(preset.name);
    setCategory(preset.category);
    setColor(preset.color);
    setHeadOfDepartment(preset.headOfDepartment);
    setDescription(preset.description);
    setSkillsStr(preset.skills);
    setCareerStr(preset.careerProspects);
    setSuccessMsg(`Preset "${preset.code} - ${preset.name}" diterapkan ke formulir.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handle Form Submit: Create Major
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama jurusan wajib diisi');
      return;
    }
    const cleanCode = (code || 'JURUSAN').trim().toUpperCase();

    // Check duplicate code
    if (majors.some((m) => m.code.toUpperCase() === cleanCode)) {
      setErrorMsg(`Kode jurusan "${cleanCode}" sudah digunakan. Gunakan kode unik.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const skillsArray = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const careerArray = careerStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      if (onCreateMajor) {
        await onCreateMajor({
          code: cleanCode,
          name: name.trim(),
          category: category.trim() || 'Teknologi Informasi & Software',
          color,
          headOfDepartment: headOfDepartment.trim() || 'Belum Ditugaskan',
          description: description.trim(),
          skills: skillsArray,
          careerProspects: careerArray,
          badgeClass: `bg-${color}-100 text-${color}-800 border-${color}-200`,
        });
      }

      setSuccessMsg(`Program Keahlian ${cleanCode} - ${name} berhasil dibuat!`);
      setCode('');
      setName('');
      setDescription('');
      setHeadOfDepartment('');
      setSkillsStr('');
      setCareerStr('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gagal menyimpan data jurusan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (m: MajorItem) => {
    setEditingMajor(m);
    setEditCode(m.code);
    setEditName(m.name);
    setEditCategory(m.category || 'Teknologi Informasi & Software');
    setEditColor(m.color || 'indigo');
    setEditHead(m.headOfDepartment || '');
    setEditDesc(m.description || '');
    setEditSkillsStr((m.skills || []).join(', '));
    setEditCareerStr((m.careerProspects || []).join(', '));
    setEditErrorMsg('');
  };

  // Submit Edit Major
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMajor || !editName.trim()) return;
    setIsSubmittingEdit(true);
    setEditErrorMsg('');

    try {
      const skillsArray = editSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const careerArray = editCareerStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      if (onUpdateMajor) {
        await onUpdateMajor(editingMajor.id, {
          code: editCode.trim().toUpperCase(),
          name: editName.trim(),
          category: editCategory.trim(),
          color: editColor,
          headOfDepartment: editHead.trim() || 'Belum Ditugaskan',
          description: editDesc.trim(),
          skills: skillsArray,
          careerProspects: careerArray,
          badgeClass: `bg-${editColor}-100 text-${editColor}-800 border-${editColor}-200`,
        });
      }
      setEditingMajor(null);
    } catch (err: any) {
      console.error(err);
      setEditErrorMsg(err?.message || 'Gagal memperbarui jurusan.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit Delete Major
  const handleConfirmDelete = async () => {
    if (!deletingMajor) return;
    setIsDeleting(true);
    try {
      if (onDeleteMajor) {
        await onDeleteMajor(deletingMajor.id);
      }
      setDeletingMajor(null);
    } catch (err) {
      console.error('Failed to delete major:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredMajors = majors.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      (m.headOfDepartment && m.headOfDepartment.toLowerCase().includes(q))
    );
  });

  const totalStudentsInMajors = majors.reduce((sum, m) => sum + getActiveStudentsCount(m), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-black flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              Master Data Program Keahlian
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-full text-[11px] font-bold">
              Tersinkron Landing Page & Akun Siswa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Manajemen Jurusan & Kompetensi Keahlian
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Data jurusan yang dibuat di sini akan menjadi pilihan biodata resmi pada saat admin membuat akun siswa,
            serta otomatis mengupdate statistik jumlah <strong>Siswa Aktif</strong> pada kartu Program Keahlian Unggulan di landing page!
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 shrink-0 relative z-10 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-emerald-200 font-semibold">Total Jurusan</div>
            <div className="text-xl sm:text-2xl font-black text-white">{majors.length}</div>
          </div>
          <div className="border-x border-white/15 px-3">
            <div className="text-[10px] sm:text-xs text-emerald-200 font-semibold">Siswa Aktif</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">{totalStudentsInMajors}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-emerald-200 font-semibold">Total Rombel</div>
            <div className="text-xl sm:text-2xl font-black text-white">{classes.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Buat Jurusan Baru + List Jurusan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Tambah Jurusan (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Tambah Program Keahlian</h3>
                <p className="text-xs text-slate-500 font-medium">Buat jurusan baru untuk akun siswa</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Form Admin
            </span>
          </div>

          {/* Quick Presets Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Pilih Cepat Preset SMK:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {MAJOR_PRESETS.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition"
                >
                  +{preset.code} ({preset.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Alert Messages */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Jurusan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPLG / TJKT"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Warna Tema
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 capitalize"
                >
                  {Object.keys(COLOR_MAP).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lengkap Program Keahlian *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pengembangan Perangkat Lunak & Gim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori / Bidang Keahlian
              </label>
              <input
                type="text"
                placeholder="Contoh: Teknologi Informasi & Software"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kepala Program Keahlian (Kaprog)
              </label>
              <input
                type="text"
                placeholder="Contoh: Hendra Setiawan, S.Kom., M.Kom."
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Deskripsi Singkat Program
              </label>
              <textarea
                rows={2}
                placeholder="Penjelasan ringkas fokus kurikulum jurusan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Kompetensi Inti / Skills (Pisahkan dengan koma)</span>
                <span className="text-[10px] text-slate-400">Contoh: React, Mobile, DevOps</span>
              </label>
              <input
                type="text"
                placeholder="Web Full-Stack, Flutter, Game Dev, Database"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Prospek Karir Lulusan (Pisahkan dengan koma)</span>
                <span className="text-[10px] text-slate-400">Contoh: Software Engineer, Fullstack</span>
              </label>
              <input
                type="text"
                placeholder="Software Engineer, Mobile Developer, Game Programmer"
                value={careerStr}
                onChange={(e) => setCareerStr(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Badge Preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Preview Badge Landing Page:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${COLOR_MAP[color]?.bgBadge || 'bg-indigo-100 text-indigo-800'}`}>
                {code || 'KODE'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan Jurusan...' : 'Simpan & Publikasikan Jurusan'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Daftar Jurusan & Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode, nama, atau kaprog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-xs font-bold text-slate-500 mr-2">
                Menampilkan <strong>{filteredMajors.length}</strong> Program Keahlian
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Grid Card"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* List or Empty State */}
          {filteredMajors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Tidak ada jurusan ditemukan</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan tambah program keahlian baru menggunakan formulir di sebelah kiri.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMajors.map((m) => {
                const colorInfo = COLOR_MAP[m.color || 'indigo'] || COLOR_MAP.indigo;
                const activeStudentsCount = getActiveStudentsCount(m);
                const classCount = getMajorClassesCount(m);

                return (
                  <div
                    key={m.id}
                    className={`bg-white rounded-2xl border ${colorInfo.borderCard} p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-3">
                      {/* Header Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black border ${colorInfo.bgBadge}`}
                          >
                            {m.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            {m.category}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Jurusan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingMajor(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Jurusan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {m.name}
                        </h4>
                        {m.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {m.description}
                          </p>
                        )}
                      </div>

                      {/* Head of Dept */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block leading-none mb-0.5">Kaprog:</span>
                          <strong className="text-slate-800">{m.headOfDepartment || 'Belum Ditugaskan'}</strong>
                        </div>
                      </div>

                      {/* Skills Preview */}
                      {m.skills && m.skills.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Kompetensi Keahlian:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.skills.slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                              >
                                ✓ {sk}
                              </span>
                            ))}
                            {m.skills.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                                +{m.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Stats: Siswa Aktif & Rombel */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>
                          <strong className="text-emerald-700">{activeStudentsCount}</strong> Siswa Aktif
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                        <School className="w-3.5 h-3.5" />
                        <span>{classCount} Rombel</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Kode & Nama Jurusan</th>
                      <th className="py-3.5 px-4">Kategori Bidang</th>
                      <th className="py-3.5 px-4">Kepala Program (Kaprog)</th>
                      <th className="py-3.5 px-4 text-center">Siswa Aktif</th>
                      <th className="py-3.5 px-4 text-center">Rombel</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMajors.map((m) => {
                      const colorInfo = COLOR_MAP[m.color || 'indigo'] || COLOR_MAP.indigo;
                      const activeStudentsCount = getActiveStudentsCount(m);
                      const classCount = getMajorClassesCount(m);

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-black border ${colorInfo.bgBadge}`}
                              >
                                {m.code}
                              </span>
                              <div>
                                <div className="font-black text-slate-900">{m.name}</div>
                                <div className="text-[10px] text-slate-400">ID: {m.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{m.category}</td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            {m.headOfDepartment || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {activeStudentsCount} Siswa
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 font-bold">
                            {classCount}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(m)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit Jurusan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingMajor(m)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Jurusan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Major Modal */}
      {editingMajor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Edit Program Keahlian</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Perbarui data kurikulum jurusan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMajor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Jurusan *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warna Tema</label>
                  <select
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 capitalize"
                  >
                    {Object.keys(COLOR_MAP).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Jurusan *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori / Bidang Keahlian</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepala Program Keahlian (Kaprog)</label>
                <input
                  type="text"
                  value={editHead}
                  onChange={(e) => setEditHead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kompetensi Keahlian (Pisahkan koma)</label>
                <input
                  type="text"
                  value={editSkillsStr}
                  onChange={(e) => setEditSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prospek Karir Lulusan (Pisahkan koma)</label>
                <input
                  type="text"
                  value={editCareerStr}
                  onChange={(e) => setEditCareerStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMajor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingEdit ? 'Menyimpan...' : 'Perbarui Jurusan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMajor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Hapus Program Keahlian?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus program keahlian{' '}
                <strong className="text-slate-800">
                  {deletingMajor.code} - {deletingMajor.name}
                </strong>
                ?
              </p>
            </div>

            {getActiveStudentsCount(deletingMajor) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-bold text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Perhatian: Terdapat <strong>{getActiveStudentsCount(deletingMajor)} siswa aktif</strong> yang terdaftar di jurusan ini.
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMajor(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
