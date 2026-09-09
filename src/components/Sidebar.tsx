import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  ListTodo,
  Sparkles,
  BookOpen,
  HelpCircle,
  CalendarCheck2,
  BarChart3,
  Server,
  Building2,
  FileSpreadsheet,
  Layers,
  Award,
  UserPlus,
  School,
  Users,
  GraduationCap,
  Eye,
  ShieldCheck,
  Megaphone,
  LogOut,
  User,
} from 'lucide-react';
import { UserRole, TabType } from '../types';

export type { TabType };

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: UserRole;
  activeExamsCount?: number;
  pendingTasksCount?: number;
  classesCount?: number;
  subjectsCount?: number;
  studentsCount?: number;
  teachersCount?: number;
  kepsekCount?: number;
  kurikulumCount?: number;
  adminsCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  activeExamsCount = 1,
  pendingTasksCount = 2,
  classesCount = 5,
  subjectsCount = 10,
  studentsCount = 10,
  teachersCount = 6,
  kepsekCount = 1,
  kurikulumCount = 1,
  adminsCount = 1,
  onLogout,
}) => {
  const getNavItems = () => {
    // 1. ROLE ADMIN (Pusat Registrasi Akun & Rombel Kelas)
    if (userRole === 'admin') {
      return [
        {
          id: 'admin_panel' as TabType,
          label: 'Master Registrasi & Kelas',
          icon: Server,
          badge: 'Admin IT',
          badgeColor: 'bg-purple-600 text-white',
        },
        {
          id: 'admin_subjects' as TabType,
          label: 'Mata Pelajaran (Mapel)',
          icon: BookOpen,
          badge: `${subjectsCount} Mapel`,
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'profile' as TabType,
          label: 'Profil Saya & Biodata',
          icon: User,
          badge: 'Full Akses',
          badgeColor: 'bg-slate-600 text-white',
        },
        {
          id: 'admin_students' as TabType,
          label: 'Akun Siswa',
          icon: GraduationCap,
          badge: `${studentsCount} Siswa`,
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'admin_teachers' as TabType,
          label: 'Akun Guru',
          icon: Users,
          badge: `${teachersCount} Guru`,
          badgeColor: 'bg-emerald-600 text-white',
        },
        {
          id: 'admin_kepsek' as TabType,
          label: 'Akun Kepala Sekolah',
          icon: Award,
          badge: `${kepsekCount} Kepsek`,
          badgeColor: 'bg-amber-600 text-white',
        },
        {
          id: 'admin_kurikulum' as TabType,
          label: 'Akun Kurikulum',
          icon: Layers,
          badge: `${kurikulumCount} Akun`,
          badgeColor: 'bg-blue-600 text-white',
        },
        {
          id: 'admin_admins' as TabType,
          label: 'Akun Admin IT',
          icon: ShieldCheck,
          badge: `${adminsCount} Admin`,
          badgeColor: 'bg-purple-700 text-white',
        },
      ];
    }

    // 2. ROLE KURIKULUM & KEPALA SEKOLAH (Fokus: Data Siswa & Guru Terdaftar, Pantau Ulangan Siswa, Pengumuman, Profil)
    if (userRole === 'kurikulum' || userRole === 'kepalasekolah') {
      return [
        {
          id: 'monitoring_kurikulum_kepsek' as TabType,
          label: 'Data Siswa & Guru Terdaftar',
          icon: Users,
          badge: `${studentsCount + teachersCount} Akun`,
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'profile' as TabType,
          label: 'Profil Saya & Biodata',
          icon: User,
          badge: 'Foto & Bio',
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'exams' as TabType,
          label: 'Pantau Ulangan Siswa',
          icon: FileCheck2,
          badge: `${activeExamsCount} CBT`,
          badgeColor: 'bg-emerald-600 text-white',
        },
        {
          id: 'announcements' as TabType,
          label: 'Pengumuman Sekolah',
          icon: Megaphone,
          badge: null,
        },
      ];
    }

    // 3. ROLE GURU (Bisa Buat Tugas, Ulangan CBT PG/Esai, Kuis, Asesmen, Materi + Kelola Rombel & Profil)
    if (userRole === 'teacher') {
      return [
        {
          id: 'dashboard' as TabType,
          label: 'Beranda Guru',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'profile' as TabType,
          label: 'Profil Pendidik & Biodata',
          icon: User,
          badge: 'Foto & Bio',
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'announcements' as TabType,
          label: 'Buat & Kelola Pengumuman',
          icon: Megaphone,
          badge: 'Papan Info',
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'exams' as TabType,
          label: 'Buat & Kelola Ulangan (CBT)',
          icon: FileCheck2,
          badge: 'PG & Esai',
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'tasks' as TabType,
          label: 'Buat & Kelola Tugas Harian',
          icon: ListTodo,
          badge: 'Tugas',
          badgeColor: 'bg-indigo-500 text-white',
        },
        {
          id: 'quizzes' as TabType,
          label: 'Buat Kuis & Latihan Soal',
          icon: HelpCircle,
          badge: 'Kuis',
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'assessments' as TabType,
          label: 'Kelola Asesmen Siswa',
          icon: Award,
          badge: null,
        },
        {
          id: 'materials' as TabType,
          label: 'Materi & Modul Pembelajaran',
          icon: BookOpen,
          badge: null,
        },
        {
          id: 'teacher_roster' as TabType,
          label: 'Daftar Kelas & Guru',
          icon: Users,
          badge: 'Rombel',
          badgeColor: 'bg-emerald-600 text-white',
        },
      ];
    }

    // 4. ROLE SISWA (Mengerjakan Tugas, CBT, Lihat Kelas Sendiri, Profil Saya)
    return [
      {
        id: 'dashboard' as TabType,
        label: 'Beranda & Jadwal Belajar',
        icon: LayoutDashboard,
        badge: null,
      },
      {
        id: 'profile' as TabType,
        label: 'Profil Saya & Biodata',
        icon: User,
        badge: 'Foto & Bio',
        badgeColor: 'bg-indigo-600 text-white',
      },
      {
        id: 'announcements' as TabType,
        label: 'Papan Pengumuman',
        icon: Megaphone,
        badge: null,
      },
      {
        id: 'my_class' as TabType,
        label: 'Kelas Saya & Teman Sekelas',
        icon: School,
        badge: 'Rombel',
        badgeColor: 'bg-indigo-600 text-white',
      },
      {
        id: 'exams' as TabType,
        label: 'Ulangan Online (CBT)',
        icon: FileCheck2,
        badge: activeExamsCount > 0 ? `${activeExamsCount} Aktif` : null,
        badgeColor: 'bg-rose-500 text-white animate-pulse',
      },
      {
        id: 'tasks' as TabType,
        label: 'Tugas Harian & Koding',
        icon: ListTodo,
        badge: pendingTasksCount > 0 ? `${pendingTasksCount} Baru` : null,
        badgeColor: 'bg-indigo-500 text-white',
      },
      {
        id: 'assessments' as TabType,
        label: 'Asesmen & Capaian',
        icon: Award,
        badge: null,
      },
      {
        id: 'materials' as TabType,
        label: 'Materi & Modul Belajar',
        icon: BookOpen,
        badge: null,
      },
      {
        id: 'quizzes' as TabType,
        label: 'Kuis Latihan Interaktif',
        icon: HelpCircle,
        badge: null,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-4 sticky top-24">
        {/* Navigation Category Label */}
        <div className="px-3 pt-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {userRole === 'admin'
              ? 'Menu Administrator'
              : userRole === 'teacher'
              ? 'Menu Pengajar (Guru)'
              : userRole === 'kurikulum'
              ? 'Menu Kurikulum'
              : userRole === 'kepalasekolah'
              ? 'Menu Kepala Sekolah'
              : 'Navigasi Siswa'}
          </span>
        </div>

        {/* Navigation Item Buttons */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Server & Data Status Indicator */}
        <div className="pt-3 border-t border-slate-100 px-2 space-y-2">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistem Terhubung
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                Aktif
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {classesCount} Rombel Terdaftar
            </p>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 hover:border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Portal Pengunjung</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
