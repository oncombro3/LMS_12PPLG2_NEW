import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  Award,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Database,
  Code2,
  Lock,
  Flame,
  FileCheck2,
  HelpCircle,
  Megaphone,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Zap,
  Laptop,
  Network,
  ShoppingBag,
  Hotel,
  Palette,
  Briefcase,
  Search
} from 'lucide-react';
import { ClassRoom, User, OnlineExam, Announcement, UserRole } from '../types';
import { OFFICIAL_MAJORS, MajorDefinition, USERS } from '../data/schoolData';
import { DbServerStatus } from '../services/api';

interface VisitorLandingViewProps {
  classes: ClassRoom[];
  usersRoster: User[];
  exams: OnlineExam[];
  announcements: Announcement[];
  dbStatus: DbServerStatus | null;
  onOpenLogin: (role?: UserRole) => void;
}

export const VisitorLandingView: React.FC<VisitorLandingViewProps> = ({
  classes,
  usersRoster,
  exams,
  announcements,
  dbStatus,
  onOpenLogin,
}) => {
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic calculations
  const totalStudents = usersRoster.filter((u) => u.role === 'student').length;
  const totalTeachers = usersRoster.filter((u) => u.role === 'teacher').length;
  const totalClassesCount = classes.length;
  const totalExamsCount = exams.length;

  // Major specific enriched metadata
  const majorDetailsMap: Record<
    string,
    {
      icon: any;
      description: string;
      skills: string[];
      careerProspects: string[];
      tools: string[];
      colorTheme: {
        bg: string;
        border: string;
        text: string;
        badge: string;
        accent: string;
      };
    }
  > = {
    PPLG: {
      icon: Laptop,
      description:
        'Fokus pada rekayasa perangkat lunak modern, pengembangan web full-stack, aplikasi mobile Android/iOS, pembuatan game, dan arsitektur database cloud terpadu.',
      skills: ['Web Full-Stack (React/Node.js)', 'Mobile Apps (Flutter/React Native)', 'Game Dev (Unity/Godot)', 'Database & REST API', 'Cloud & DevOps'],
      careerProspects: ['Software Engineer', 'Fullstack Developer', 'Mobile App Developer', 'Game Programmer', 'Database Administrator'],
      tools: ['VS Code', 'Node.js', 'MongoDB', 'React', 'Python', 'Git/GitHub'],
      colorTheme: {
        bg: 'bg-indigo-50/70',
        border: 'border-indigo-200',
        text: 'text-indigo-900',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        accent: 'from-indigo-600 to-indigo-800',
      },
    },
    TJKT: {
      icon: Network,
      description:
        'Mempelajari perancangan topologi jaringan skala besar, konfigurasi router/switch enterprise, sistem telekomunikasi serat optik, server Linux, dan keamanan siber.',
      skills: ['Computer Network Routing & Switching', 'Fiber Optic Splicing', 'Linux/Windows Server Admin', 'MikroTik & Cisco Networking', 'Cybersecurity Fundamentals'],
      careerProspects: ['Network Engineer', 'System Administrator', 'Cybersecurity Analyst', 'Fiber Optic Technician', 'Cloud Infrastructure Tech'],
      tools: ['Cisco Packet Tracer', 'Winbox MikroTik', 'Wireshark', 'Ubuntu Server', 'Debian'],
      colorTheme: {
        bg: 'bg-blue-50/70',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        accent: 'from-blue-600 to-blue-800',
      },
    },
    PM: {
      icon: ShoppingBag,
      description:
        'Mempersiapkan tenaga profesional di bidang digital marketing, e-commerce branding, pengelolaan retail modern, copywriting promosi, dan analisis tren penjualan.',
      skills: ['Digital Marketing & Social Media Ads', 'E-Commerce Marketplace Strategy', 'Retail Business Management', 'Content & Copywriting', 'Visual Merchandising'],
      careerProspects: ['Digital Marketing Specialist', 'E-Commerce Operations Manager', 'Retail Store Manager', 'Social Media Strategist', 'Sales Executive'],
      tools: ['Meta Business Suite', 'TikTok Shop Ads', 'Google Ads', 'Canva Pro', 'POS System'],
      colorTheme: {
        bg: 'bg-amber-50/70',
        border: 'border-amber-200',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        accent: 'from-amber-600 to-amber-800',
      },
    },
    PH: {
      icon: Hotel,
      description:
        'Keahlian komprehensif di bidang perhotelan dan pariwisata internasional, mencakup operasional Front Office, tata graha (Housekeeping), Food & Beverage, dan pelayanan prima.',
      skills: ['Front Office & Guest Reservation', 'Professional Housekeeping', 'Food & Beverage Service', 'Barista & Mocktail Crafting', 'Hospitality English Communication'],
      careerProspects: ['Hotel Front Desk Officer', 'Executive Housekeeper', 'Food & Beverage Supervisor', 'Guest Relations Officer', 'Cruise Ship Crew'],
      tools: ['Hotel PMS (VHP / Opera)', 'Reservation Software', 'Barista Equipment', 'POS Restaurant'],
      colorTheme: {
        bg: 'bg-rose-50/70',
        border: 'border-rose-200',
        text: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        accent: 'from-rose-600 to-rose-800',
      },
    },
    DKV: {
      icon: Palette,
      description:
        'Mengembangkan bakat kreatif visual melalui desain grafis, ilustrasi digital, animasi 2D/3D, fotografi studio, videografi sinematik, serta UI/UX perancangan aplikasi.',
      skills: ['Graphic & Brand Identity Design', 'UI/UX Interface Prototyping', '2D/3D Motion Animation', 'Commercial Photography & Videography', 'Digital Illustration'],
      careerProspects: ['Graphic Designer', 'UI/UX Designer', 'Motion Graphic Artist', 'Creative Director', 'Photographer & Video Editor'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Adobe Premiere / After Effects', 'Blender 3D'],
      colorTheme: {
        bg: 'bg-purple-50/70',
        border: 'border-purple-200',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        accent: 'from-purple-600 to-purple-800',
      },
    },
    MPLB: {
      icon: Briefcase,
      description:
        'Keahlian tata kelola manajemen perkantoran modern, digital archiving, korespondensi bisnis multilingual, public relations, dan administrasi keuangan kantor berbasis IT.',
      skills: ['Digital Office Automation', 'Electronic Record & Archiving System', 'Business Correspondence & English', 'Public Relations & Protocol', 'Spreadsheet & Finance Admin'],
      careerProspects: ['Office Administrative Specialist', 'Executive Secretary', 'Public Relations Assistant', 'Archivist & Records Manager', 'Human Resource Admin'],
      tools: ['Microsoft Office 365', 'Google Workspace Enterprise', 'Digital Archive App', 'Speed Typing Tools'],
      colorTheme: {
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        accent: 'from-emerald-600 to-emerald-800',
      },
    },
  };

  const featurePillars = [
    {
      icon: Lock,
      title: 'Ujian CBT Online Anti-Cheat',
      description:
        'Sistem ujian berbasis komputer dengan keamanan berlapis: lockdown layar penuh, deteksi pergantian tab (tab-switching penalty), token ujian berkala, dan acak nomor/pilihan otomatis.',
      badge: 'CBT Engine v2.4',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      icon: FileCheck2,
      title: 'Asesmen Kurikulum Merdeka',
      description:
        'Mendukung Asesmen Diagnostik Awal, Formatif Berkala, Sumatif Semester, hingga rubrik penilaian Projek Penguatan Profil Pelajar Pancasila (P5) berbasis capaian pembelajaran.',
      badge: 'Kurikulum Merdeka',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: Code2,
      title: 'Live Code Playground & Sandbox',
      description:
        'Editor kode interaktif langsung di browser untuk latihan HTML, CSS, JavaScript, dan Python tanpa perlu instalasi tools tambahan di komputer siswa.',
      badge: 'Vokasi Coding',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      icon: BookOpen,
      title: 'Modul Pembelajaran & E-Book Kejuruan',
      description:
        'Akses materi pelajaran terstruktur, silabus kejuruan, rangkuman materi interaktif, serta panduan praktikum keahlian vokasi yang lengkap dan mudah dipahami.',
      badge: 'E-Learning Modul',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      icon: Users,
      title: 'Manajemen Direktori Rombel Terpadu',
      description:
        'Kelola direktori siswa per rombel kelas dengan pencarian NISN, filter jenis kelamin, data identitas peserta didik, dan penataan rombel terstruktur.',
      badge: 'Rombel Management',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      icon: Building2,
      title: 'Executive Analytics 5-Role',
      description:
        'Dashboard terpisah yang dipersonalisasi untuk Siswa, Guru Mapel, Tim Kurikulum, Kepala Sekolah, dan Administrator IT dengan sinkronisasi data sekolah terpadu.',
      badge: 'Multi-Role Portal',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const roleHighlights: {
    role: UserRole;
    title: string;
    targetUser: string;
    description: string;
    icon: any;
    color: string;
    badge: string;
  }[] = [
    {
      role: 'student',
      title: 'Siswa Peserta Didik',
      targetUser: USERS.student.name,
      description: 'Mengerjakan ujian CBT, mengumpulkan tugas harian, belajar modul materi, coding di sandbox, dan memantau transkrip nilai akademik.',
      icon: GraduationCap,
      color: 'bg-indigo-600 text-white',
      badge: 'Akses Siswa',
    },
    {
      role: 'teacher',
      title: 'Guru Pengampu Mata Pelajaran',
      targetUser: USERS.teacher.name,
      description: 'Membuat bank soal ulangan & token, menilai tugas siswa, upload modul pembelajaran, serta mengatur struktur organisasi rombel binaan.',
      icon: BookOpen,
      color: 'bg-emerald-600 text-white',
      badge: 'Akses Pendidik',
    },
    {
      role: 'kurikulum',
      title: 'Tim Pengembang Kurikulum',
      targetUser: USERS.kurikulum.name,
      description: 'Melihat data siswa & guru yang telah terdaftar, pantau ulangan siswa (CBT), serta pengumuman sekolah.',
      icon: FileSpreadsheet,
      color: 'bg-cyan-600 text-white',
      badge: 'Akses Kurikulum',
    },
    {
      role: 'kepalasekolah',
      title: 'Kepala Sekolah',
      targetUser: USERS.kepalasekolah.name,
      description: 'Melihat data siswa & guru yang telah terdaftar, pantau ulangan siswa (CBT), serta pengumuman sekolah.',
      icon: Building2,
      color: 'bg-amber-600 text-white',
      badge: 'Akses Pimpinan',
    },
    {
      role: 'admin',
      title: 'Administrator IT & Server',
      targetUser: USERS.admin.name,
      description: 'Master registrasi akun pengguna (Siswa, Guru, Tendik), manajemen rombel kelas, serta pemantauan status database sekolah.',
      icon: ShieldAlert,
      color: 'bg-purple-600 text-white',
      badge: 'Akses IT',
    },
  ];

  const filteredMajors = OFFICIAL_MAJORS.filter((m) => {
    if (selectedMajorFilter !== 'ALL' && m.code !== selectedMajorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Visitor Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & School Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}
                  </span>
                  <span className="hidden md:inline-flex px-2.5 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full">
                    Akreditasi A
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Sistem Informasi Pembelajaran & Ujian CBT Terpadu
                </p>
              </div>
            </div>

            {/* Quick Links for Desktop */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
              <a href="#stats" className="hover:text-indigo-600 transition">
                Statistik
              </a>
              <a href="#jurusan" className="hover:text-indigo-600 transition">
                6 Program Keahlian
              </a>
              <a href="#fitur" className="hover:text-indigo-600 transition">
                Fitur Unggulan
              </a>
              <a href="#roles" className="hover:text-indigo-600 transition">
                Hak Akses 5-Role
              </a>
              <a href="#pengumuman" className="hover:text-indigo-600 transition">
                Pengumuman
              </a>
            </nav>

            {/* CTA Login Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="btn-visitor-login"
                onClick={() => onOpenLogin()}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-lg shadow-indigo-200 flex items-center gap-2 group hover:scale-[1.02] active:scale-95"
              >
                <KeyRound className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                <span>Masuk ke Portal LMS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 border-b border-slate-200/80 pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Decorative subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-200 rounded-full shadow-2xs text-xs font-extrabold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Platform CBT & E-Learning Terpadu Generasi Kurikulum Merdeka</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Membangun Keahlian Vokasi Digital dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">LMS & CBT Berstandar Industri</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ekosistem pendidikan kejuruan modern yang memadukan ujian online anti-curang, live code editor, asesmen kurikulum merdeka, manajemen rombel, dan monitoring 5 peran akademik secara real-time.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenLogin()}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2.5 group hover:scale-[1.02] active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk Portal LMS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#jurusan"
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-extrabold transition shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Jelajahi 6 Program Keahlian</span>
            </a>
          </div>

          {/* Live Quick Counters Strip */}
          <div id="stats" className="pt-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalStudents > 0 ? totalStudents : 36}+
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Terdaftar di Sistem</p>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rombel Kelas</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalClassesCount} Kelas
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Tingkat X, XI, XII</p>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jurusan Vokasi</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                6 Jurusan
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Berbasis Industri</p>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ujian Online</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalExamsCount > 0 ? totalExamsCount : 5} Paket
              </div>
              <p className="text-[11px] text-slate-500 font-medium">CBT Anti-Cheat Aktif</p>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Program Keahlian (6 Jurusan Lengkap) */}
      <section id="jurusan" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold mb-2">
                <Award className="w-3.5 h-3.5" />
                6 Program Keahlian Unggulan
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Eksplorasi Jurusan & Kompetensi Siswa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Setiap program keahlian dirancang selaras dengan standar kompetensi industri dan dilengkapi kurikulum mutakhir.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari jurusan atau keahlian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedMajorFilter}
                onChange={(e) => setSelectedMajorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Jurusan (6)</option>
                {OFFICIAL_MAJORS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of 6 Majors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMajors.map((major) => {
              const meta = majorDetailsMap[major.code] || majorDetailsMap.PPLG;
              const Icon = meta.icon;
              
              // Calculate classes and students for this major
              const majorClasses = classes.filter((c) => c.majorCode === major.code);
              const majorTotalStudents = majorClasses.reduce(
                (sum, c) => sum + (c.totalStudents || 36),
                0
              );

              return (
                <div
                  key={major.code}
                  className={`rounded-3xl border ${meta.colorTheme.border} ${meta.colorTheme.bg} p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-xl hover:scale-[1.01] transition-all group`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.colorTheme.accent} text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:rotate-6 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${meta.colorTheme.badge}`}>
                          {major.code}
                        </span>
                        <div className="text-[10px] text-slate-500 font-bold mt-1">
                          {majorClasses.length} Rombel Terdaftar
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {major.name}
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {major.category}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {meta.description}
                    </p>

                    {/* Competency Skills */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Kompetensi Inti:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.skills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Career Prospects */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Prospek Karir Lulusan:
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {meta.careerProspects.slice(0, 3).join(' • ')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Card: Classes available & Login trigger */}
                  <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500">
                      <strong>{majorTotalStudents}</strong> Siswa Aktif
                    </div>
                    <button
                      onClick={() => onOpenLogin('student')}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-800 rounded-xl text-xs font-extrabold transition border border-slate-200/80 flex items-center gap-1 shadow-2xs"
                    >
                      <span>Masuk Kelas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 3: Fitur-Fitur Unggulan Platform */}
      <section id="fitur" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 rounded-full text-xs font-extrabold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Arsitektur & Fitur Pembelajaran
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Fitur Lengkap untuk Sekolah Digital Masa Depan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Didesain khusus untuk memenuhi kebutuhan teknis SMK modern dengan kehandalan tinggi, keamanan ujian komprehensif, dan antarmuka responsif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featurePillars.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500 transition-all hover:bg-slate-800 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {feat.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teruji & Terintegrasi Penuh</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 4: Hak Akses 5 Peran (Multi-Persona Portal) */}
      <section id="roles" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-extrabold">
              <Users className="w-3.5 h-3.5" />
              Satu Sistem, 5 Hak Akses Khusus
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Portal Terpersonalisasi Sesuai Peran
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Setiap pemangku kepentingan memiliki menu kerja dan dashboard yang disesuaikan secara presisi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roleHighlights.map((rh) => {
              const Icon = rh.icon;
              return (
                <div
                  key={rh.role}
                  className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all"
                >
                  <div className="space-y-3">
                    <div className={`w-11 h-11 rounded-2xl ${rh.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {rh.badge}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1.5">
                        {rh.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">
                        {rh.targetUser}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rh.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenLogin(rh.role)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-extrabold transition border border-slate-200 flex items-center justify-center gap-1.5 group"
                  >
                    <span>Masuk {rh.badge.replace('Akses ', '')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 5: Pengumuman Terkini Sekolah */}
      {announcements.length > 0 && (
        <section id="pengumuman" className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-extrabold mb-1">
                  <Megaphone className="w-3.5 h-3.5" />
                  Papan Informasi Resmi
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Pengumuman & Agenda Akademik
                </h2>
              </div>
              <button
                onClick={() => onOpenLogin()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 w-fit"
              >
                <span>Lihat Selengkapnya di Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-200/60">
                    Oleh: {item.author}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5 text-white font-black text-base">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>{import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}</span>
              </div>
              <p className="text-slate-400 max-w-md text-xs leading-relaxed">
                Pusat keunggulan pendidikan vokasi berbasis teknologi digital terapan. Berkomitmen melahirkan lulusan berkompeten, berdaya saing global, dan berintegritas tinggi.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span>Sistem Terintegrasi CBT & LMS</span>
                <span>•</span>
                <span>Tahun Ajaran 2025/2026</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Navigasi Utama</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#stats" className="hover:text-white transition">Statistik Sekolah</a></li>
                <li><a href="#jurusan" className="hover:text-white transition">6 Program Keahlian</a></li>
                <li><a href="#fitur" className="hover:text-white transition">Fitur Unggulan CBT</a></li>
                <li><a href="#roles" className="hover:text-white transition">Hak Akses 5-Role</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">Akses Masuk</div>
              <p className="text-slate-400 text-xs">
                Gunakan NISN / NIP Anda untuk masuk ke sistem manajemen pembelajaran.
              </p>
              <button
                onClick={() => onOpenLogin()}
                className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Buka Formulir Login</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2025/2026 {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}. Seluruh hak cipta dilindungi.
            </div>
            <div className="flex items-center gap-4">
              <span>Kurikulum Merdeka</span>
              <span>•</span>
              <span>CBT Anti-Cheat v2.4</span>
              <span>•</span>
              <span>Sistem Aktif</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
