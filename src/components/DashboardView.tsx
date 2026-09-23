import React from 'react';
import {
  FileCheck2,
  ListTodo,
  Award,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  KeyRound,
  CheckCircle2,
  Flame,
  Building2,
  ShieldAlert,
  BarChart3,
  Users,
  ShieldCheck,
  Megaphone,
  Pin,
  Plus,
  History,
} from 'lucide-react';
import {
  User,
  OnlineExam,
  DailyTask,
  AssessmentItem,
  LearningMaterial,
  InteractiveQuiz,
  Announcement,
} from '../types';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  currentUser: User;
  exams: OnlineExam[];
  tasks: DailyTask[];
  assessments: AssessmentItem[];
  materials: LearningMaterial[];
  quizzes: InteractiveQuiz[];
  announcements: Announcement[];
  onSelectTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  exams,
  tasks,
  assessments,
  materials,
  quizzes,
  announcements,
  onSelectTab,
}) => {
  const activeExams = exams.filter((e) => e.status === 'active');
  const pendingTasks = tasks.filter((t) => !t.mySubmission);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              {currentUser.titleRole || 'CITRA NEGARA LMS'}
            </span>
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat Datang, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            {currentUser.role === 'student'
              ? 'Siap mengikuti ulangan online CBT hari ini? Pastikan cek jadwal dan persiapkan token ujian dari guru pengawas.'
              : currentUser.role === 'teacher'
              ? 'Kelola bank soal ujian, periksa tugas harian siswa, dan publikasikan materi pembelajaran digital.'
              : currentUser.role === 'kurikulum'
              ? 'Pantau distribusi jadwal asesmen kurikulum merdeka dan rekap capaian nilai rapor seluruh kelas.'
              : currentUser.role === 'kepalasekolah'
              ? 'Pantau ringkasan mutu akademik, tingkat kelulusan KKM, dan partisipasi belajar mengajar sekolah.'
              : 'Pantau status server dan kesehatan data sistem terpadu.'}
          </p>
        </div>

        {/* Quick Shortcut Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0 space-y-3">
          <div className="text-xs font-bold text-indigo-200">Aksi Cepat:</div>
          <button
            onClick={() => onSelectTab('exams')}
            className="w-full px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              {currentUser.role === 'student' ? 'Masuk Portal Ulangan CBT' : 'Kelola Bank Soal CBT'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {currentUser.role === 'student' && (
            <button
              onClick={() => onSelectTab('student_history')}
              className="w-full px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition flex items-center justify-between gap-3 border border-white/20"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-300" />
                <span>Riwayat Pengumpulan & Nilai</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onSelectTab('exams')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition text-left space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Ulangan CBT</span>
            <FileCheck2 className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900">{exams.length} Ujian</div>
          <div className="text-[11px] text-rose-600 font-bold">{activeExams.length} Sesi Aktif</div>
        </button>

        <button
          onClick={() => onSelectTab('tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition text-left space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Tugas Harian</span>
            <ListTodo className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900">{tasks.length} Tugas</div>
          <div className="text-[11px] text-indigo-600 font-bold">
            {currentUser.role === 'student' ? `${pendingTasks.length} Belum Kumpul` : 'Semua Aktif'}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('assessments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition text-left space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Asesmen</span>
            <Award className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900">{assessments.length} Modul</div>
          <div className="text-[11px] text-amber-600 font-bold">Kurikulum Merdeka</div>
        </button>

        <button
          onClick={() => onSelectTab('materials')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition text-left space-y-1 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Materi Belajar</span>
            <BookOpen className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900">{materials.length} Bab</div>
          <div className="text-[11px] text-emerald-600 font-bold">Modul Digital & Lab</div>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Exams & Daily Tasks (Col 1-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Online Exam Alert Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Jadwal Ulangan Online CBT Terdekat
              </h2>
              <button
                onClick={() => onSelectTab('exams')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {exams.slice(0, 2).map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {exam.examType}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{exam.subject}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{exam.title}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Durasi: <strong>{exam.durationMinutes} Menit</strong></span>
                      <span>KKM: <strong>{exam.passingScore}</strong></span>
                      <span className="text-indigo-600 font-mono font-bold">Token: {exam.token}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTab('exams')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-100 shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Buka Ujian
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Tasks List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600" />
                Tugas Harian & Proyek Koding
              </h2>
              <button
                onClick={() => onSelectTab('tasks')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Semua Tugas &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {t.subject}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{t.title}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Tenggat: {t.dueDate}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTab('tasks')}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: CBT Info & Announcements (Col 3) */}
        <div className="space-y-6">
          {/* Anti-Cheat & Info CBT Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Integritas & Sistem CBT
            </h3>
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-950">
                <span>Lockdown & Anti-Curang</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ujian online dilengkapi deteksi perpindahan tab otomatis, pengacakan soal & opsi, serta penguncian layar penuh.
              </p>
            </div>
          </div>

          {/* Pengumuman Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Pengumuman Terbaru
              </h3>
              <button
                onClick={() => onSelectTab('announcements')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
              >
                Lihat Semua ({announcements.length}) &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onSelectTab('announcements')}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 cursor-pointer transition hover:scale-[1.01] ${
                    ann.pinned
                      ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                      : ann.priority === 'urgent'
                      ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {ann.pinned && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5 fill-current" /> Pin
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ann.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {ann.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 line-clamp-1">{ann.title}</h4>
                  <p className="text-slate-500 line-clamp-2 text-[11px] leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium pt-0.5">
                    Oleh: <strong className="text-slate-600">{ann.author}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Button for Teachers */}
            {(currentUser.role === 'teacher' ||
              currentUser.role === 'admin' ||
              currentUser.role === 'kurikulum') && (
              <button
                onClick={() => onSelectTab('announcements')}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                Buat Pengumuman Baru
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
