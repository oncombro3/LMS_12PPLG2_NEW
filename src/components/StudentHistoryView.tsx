import React, { useState, useMemo } from 'react';
import {
  History,
  FileCheck2,
  ListTodo,
  Award,
  HelpCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Code,
  FileText,
  ShieldCheck,
  Calendar,
  MessageSquare,
  GraduationCap,
  Download,
  X,
  Layers,
  TrendingUp,
  Percent
} from 'lucide-react';
import {
  User,
  DailyTask,
  OnlineExam,
  InteractiveQuiz,
  AssessmentItem,
  Subject,
  TabType
} from '../types';

export interface StudentHistoryItem {
  id: string;
  sourceId: string;
  type: 'task' | 'exam' | 'quiz' | 'assessment';
  typeLabel: string;
  title: string;
  subject: string;
  teacher?: string;
  targetClass?: string;
  submittedAt: string;
  dueDate?: string;
  score?: number;
  maxScore: number;
  passingScore?: number;
  isPassed?: boolean;
  status: 'graded' | 'submitted' | 'completed';
  statusLabel: string;
  feedback?: string;
  workContent?: string;
  githubUrl?: string;
  fileAttachment?: string;
  predicate?: string;
  teacherNotes?: string;
  violationsCount?: number;
  totalQuestions?: number;
}

interface StudentHistoryViewProps {
  currentUser: User;
  tasks: DailyTask[];
  exams: OnlineExam[];
  quizzes: InteractiveQuiz[];
  assessments: AssessmentItem[];
  subjects: Subject[];
  onNavigateTab: (tab: TabType) => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({
  currentUser,
  tasks,
  exams,
  quizzes,
  assessments,
  subjects,
  onNavigateTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'task' | 'exam' | 'quiz' | 'assessment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'submitted'>('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState<StudentHistoryItem | null>(null);

  // Normalisasi & Kompilasi seluruh riwayat pengerjaan siswa dari berbagai sumber
  const historyItems: StudentHistoryItem[] = useMemo(() => {
    const items: StudentHistoryItem[] = [];

    // 1. Tugas Harian (Daily Tasks)
    tasks.forEach((task) => {
      // Cari submission milik siswa aktif saat ini secara spesifik (berdasarkan ID atau Nama Siswa)
      const sub =
        task.submissions?.find(
          (s) =>
            s.studentId === currentUser.id ||
            (s.studentName && s.studentName.toLowerCase() === currentUser.name.toLowerCase())
        ) ||
        (task.mySubmission &&
        (task.mySubmission.studentId === currentUser.id ||
          (task.mySubmission.studentName &&
            task.mySubmission.studentName.toLowerCase() === currentUser.name.toLowerCase()))
          ? task.mySubmission
          : undefined);

      if (sub) {
        const isGraded = sub.status === 'graded' && sub.score !== undefined;
        items.push({
          id: `task-${task.id}`,
          sourceId: task.id,
          type: 'task',
          typeLabel: 'Tugas Harian / Koding',
          title: task.title,
          subject: task.subject,
          teacher: task.teacher,
          targetClass: task.targetClass,
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: task.dueDate,
          score: sub.score,
          maxScore: task.maxScore || 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'Menunggu Penilaian Guru',
          feedback: sub.feedback,
          workContent: sub.workContent,
          githubUrl: sub.githubUrl,
          fileAttachment: sub.attachmentUrl,
        });
      }
    });

    // 2. Ulangan Online CBT (Online Exams)
    exams.forEach((exam) => {
      const result =
        exam.results?.find(
          (r) =>
            r.studentId === currentUser.id ||
            (r.studentName && r.studentName.toLowerCase() === currentUser.name.toLowerCase())
        ) ||
        (exam.myResult &&
        (exam.myResult.studentId === currentUser.id ||
          (exam.myResult.studentName &&
            exam.myResult.studentName.toLowerCase() === currentUser.name.toLowerCase()))
          ? exam.myResult
          : undefined);

      if (result) {
        items.push({
          id: `exam-${exam.id}`,
          sourceId: exam.id,
          type: 'exam',
          typeLabel: exam.examType || 'Ulangan Online CBT',
          title: exam.title,
          subject: exam.subject,
          teacher: exam.teacher,
          targetClass: exam.targetClass,
          submittedAt: result.finishedAt || result.startedAt || 'Selesai Ujian',
          dueDate: exam.endDate,
          score: result.score,
          maxScore: result.maxScore || 100,
          passingScore: exam.passingScore || 75,
          isPassed: result.isPassed,
          status: 'graded',
          statusLabel: 'Nilai Otomatis CBT',
          violationsCount: result.violationsCount || 0,
          totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
        });
      }
    });

    // 3. Kuis Interaktif (Interactive Quizzes)
    quizzes.forEach((quiz) => {
      // Cari apakah siswa aktif saat ini pernah menyelesaikan kuis ini
      const quizCompletion =
        quiz.completedStudents?.find(
          (s) =>
            s.studentId === currentUser.id ||
            (s.studentName && s.studentName.toLowerCase() === currentUser.name.toLowerCase())
        ) ||
        (quiz.isCompleted && currentUser.id === 'std-1201' // Fallback hanya untuk akun default demo Farhan
          ? {
              studentId: 'std-1201',
              studentName: currentUser.name,
              score: quiz.lastScore ?? 80,
              completedAt: quiz.completedAt || '18 Agu 2026, 15:00 WIB',
            }
          : undefined);

      if (quizCompletion) {
        const score = quizCompletion.score ?? 80;
        const passScore = quiz.passingScore ?? 70;
        items.push({
          id: `quiz-${quiz.id}`,
          sourceId: quiz.id,
          type: 'quiz',
          typeLabel: 'Kuis Latihan Interaktif',
          title: quiz.title,
          subject: quiz.subject || quiz.courseTitle || 'Pemrograman Web (PWPB)',
          teacher: quiz.teacher || 'Guru Pengampu',
          submittedAt: quizCompletion.completedAt || 'Baru Saja',
          score: score,
          maxScore: 100,
          passingScore: passScore,
          isPassed: score >= passScore,
          status: 'graded',
          statusLabel: 'Kuis Diselesaikan',
          totalQuestions: quiz.totalQuestions || quiz.questions?.length || 0,
        });
      }
    });

    // 4. Asesmen Kurikulum (Assessments)
    assessments.forEach((ass) => {
      const sub = ass.submissions?.find(
        (s) =>
          s.studentId === currentUser.id ||
          (s.studentName && s.studentName.toLowerCase() === currentUser.name.toLowerCase())
      );

      if (sub) {
        const isGraded = sub.score !== undefined;
        items.push({
          id: `ass-${ass.id}`,
          sourceId: ass.id,
          type: 'assessment',
          typeLabel: `Asesmen ${ass.type || 'Kurikulum'}`,
          title: ass.title,
          subject: ass.subject,
          teacher: ass.teacher,
          targetClass: ass.targetClass,
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: ass.deadline,
          score: sub.score,
          maxScore: 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'Menunggu Review Rubrik',
          predicate: sub.predicate,
          teacherNotes: sub.teacherNotes,
          workContent: sub.content,
          fileAttachment: sub.fileUrl,
        });
      }
    });

    return items;
  }, [tasks, exams, quizzes, assessments, currentUser]);

  // Filter items berdasarkan kategori, search, mapel, status
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      // 1. Kategori
      if (activeCategory !== 'all' && item.type !== activeCategory) {
        return false;
      }
      // 2. Mata Pelajaran
      if (
        selectedSubjectFilter !== 'all' &&
        item.subject.toLowerCase() !== selectedSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      // 3. Status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchTeacher = item.teacher?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchSubject && !matchTeacher) {
          return false;
        }
      }
      return true;
    });
  }, [historyItems, activeCategory, selectedSubjectFilter, statusFilter, searchQuery]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const totalSubmitted = historyItems.length;
    const gradedItems = historyItems.filter((i) => i.score !== undefined);
    const totalScore = gradedItems.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = gradedItems.length > 0 ? (totalScore / gradedItems.length).toFixed(1) : '0';
    const passedCount = gradedItems.filter((i) => i.isPassed === true).length;
    const passRate = gradedItems.length > 0 ? Math.round((passedCount / gradedItems.length) * 100) : 100;
    const pendingCount = historyItems.filter((i) => i.status === 'submitted').length;

    return {
      totalSubmitted,
      gradedCount: gradedItems.length,
      pendingCount,
      avgScore,
      passRate,
    };
  }, [historyItems]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman Riwayat Siswa */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Riwayat Pengerjaan & Pengumpulan Tugas
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Rekapitulasi berkas tugas, ulangan CBT, kuis interaktif, dan asesmen yang telah diserahkan oleh <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.class || 'XII PPLG 2'}).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Cetak Rekapitulasi */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition"
            title="Cetak Transkrip Riwayat Pengerjaan Siswa"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ringkasan Siswa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tugas Diserahkan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Terkumpul</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.totalSubmitted}</span>
            <span className="text-xs text-slate-400 font-medium">aktivitas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.gradedCount} sudah diperiksa</span>
          </div>
        </div>

        {/* Rata-rata Nilai Perolehan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rata-rata Nilai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats.avgScore}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-500">
            Predikat: <span className="text-emerald-700 font-extrabold">{Number(stats.avgScore) >= 90 ? 'A (Sangat Mahir)' : Number(stats.avgScore) >= 80 ? 'B (Mahir)' : 'C (Cukup)'}</span>
          </div>
        </div>

        {/* Ketuntasan KKM */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ketuntasan KKM</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.passRate}%</span>
            <span className="text-xs text-slate-400 font-medium">di atas KKM</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${stats.passRate}%` }}
            />
          </div>
        </div>

        {/* Menunggu Review Guru */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Menunggu Guru</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{stats.pendingCount}</span>
            <span className="text-xs text-slate-400 font-medium">tugas/asesmen</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {stats.pendingCount === 0 ? 'Semua tugas telah dinilai' : 'Sedang dalam antrean review'}
          </div>
        </div>
      </div>

      {/* Navigasi Kategori Tab (Semua, Tugas, Ulangan, Kuis, Asesmen) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua Riwayat</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeCategory === 'all' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
            {historyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('task')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeCategory === 'task'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Tugas Harian</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeCategory === 'task' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
            {historyItems.filter((i) => i.type === 'task').length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('exam')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeCategory === 'exam'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Ulangan CBT</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeCategory === 'exam' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
            {historyItems.filter((i) => i.type === 'exam').length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('quiz')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeCategory === 'quiz'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Kuis Interaktif</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeCategory === 'quiz' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
            {historyItems.filter((i) => i.type === 'quiz').length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('assessment')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeCategory === 'assessment'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Asesmen Kurikulum</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeCategory === 'assessment' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
            {historyItems.filter((i) => i.type === 'assessment').length}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari judul tugas, mata pelajaran, atau guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Mapel */}
        <div>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Mata Pelajaran ({subjects.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status Nilai */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status Penilaian</option>
            <option value="graded">Sudah Dinilai (Nilai Tersedia)</option>
            <option value="submitted">Menunggu Penilaian Guru</option>
          </select>
        </div>
      </div>

      {/* Daftar Kartu Riwayat Pengumpulan Siswa */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Belum Ada Riwayat yang Sesuai</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan data pengumpulan untuk kategori atau kata kunci pencarian tersebut. Silakan periksa kembali filter atau kumpulkan tugas di menu Tugas Harian/Ulangan.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  setSelectedSubjectFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
              >
                Reset Filter
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasScore = item.score !== undefined;
            const isPassing = item.isPassed ?? (hasScore ? item.score! >= (item.passingScore || 75) : false);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Info Utama */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge Kategori */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                          item.type === 'task'
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.type === 'exam'
                            ? 'bg-rose-100 text-rose-800'
                            : item.type === 'quiz'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.type === 'task' && <ListTodo className="w-3 h-3" />}
                        {item.type === 'exam' && <FileCheck2 className="w-3 h-3" />}
                        {item.type === 'quiz' && <HelpCircle className="w-3 h-3" />}
                        {item.type === 'assessment' && <Award className="w-3 h-3" />}
                        {item.typeLabel}
                      </span>

                      {/* Mata Pelajaran */}
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.subject}
                      </span>

                      {/* Status Penilaian */}
                      {item.status === 'graded' ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.statusLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.statusLabel}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {item.teacher && (
                        <span>
                          Guru: <strong className="text-slate-700 font-semibold">{item.teacher}</strong>
                        </span>
                      )}
                      <span>
                        Dikumpulkan: <strong className="text-slate-700 font-semibold">{item.submittedAt}</strong>
                      </span>
                      {item.dueDate && (
                        <span className="text-slate-400">
                          (Tenggat: {item.dueDate})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge Nilai & Tombol Rincian */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    {hasScore ? (
                      <div className="text-right flex items-center sm:flex-col gap-2 sm:gap-0">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl sm:text-2xl font-black ${isPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.score}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">/{item.maxScore}</span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPassing ? 'Tuntas KKM' : 'Perlu Remedial'}
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-center">
                        <span className="text-xs font-bold text-slate-600 block">Menunggu Nilai</span>
                        <span className="text-[10px] text-slate-400">Sedang diperiksa guru</span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedDetailItem(item)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <span>Lihat Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cuplikan Catatan Ulasan Guru jika sudah dinilai */}
                {item.feedback && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">Catatan/Umpan Balik Guru: </span>
                      <span className="text-slate-600">{item.feedback}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: RINCIAN BUKTI PENGUMPULAN & EVALUASI GURU */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                  {selectedDetailItem.typeLabel}
                </span>
                <h3 className="font-black text-slate-900 text-lg">
                  {selectedDetailItem.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Mata Pelajaran: <strong className="text-slate-700">{selectedDetailItem.subject}</strong> | Pendidik: <strong className="text-slate-700">{selectedDetailItem.teacher || 'Guru Pengampu'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hasil / Nilai Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Status & Perolehan Nilai:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {selectedDetailItem.score !== undefined ? (
                    <>
                      <span className="text-2xl font-black text-emerald-600">
                        {selectedDetailItem.score}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        / {selectedDetailItem.maxScore}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-extrabold text-blue-600">
                      Menunggu Penilaian Guru
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Waktu Diserahkan:</span>
                <span className="text-xs font-extrabold text-slate-700">
                  {selectedDetailItem.submittedAt}
                </span>
              </div>
            </div>

            {/* Jika ada Umpan Balik Guru */}
            {(selectedDetailItem.feedback || selectedDetailItem.teacherNotes) && (
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Umpan Balik & Evaluasi Pendidik:</span>
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                  {selectedDetailItem.feedback || selectedDetailItem.teacherNotes}
                </p>
              </div>
            )}

            {/* Detail Khusus Ujian Online CBT */}
            {selectedDetailItem.type === 'exam' && (
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2 text-xs">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Statistik Ujian CBT:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-slate-500 block">Total Soal Dikerjakan</span>
                    <strong className="text-slate-800 text-xs">{selectedDetailItem.totalQuestions || 5} Soal</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-slate-500 block">Pelanggaran Anti-Cheat</span>
                    <strong className={`text-xs ${selectedDetailItem.violationsCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedDetailItem.violationsCount || 0} x deteksi
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Bukti Pengumpulan Siswa (Jawaban / Teks / Link Github) */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-800">Bukti Berkas & Jawaban yang Dikirim:</h4>

              {selectedDetailItem.githubUrl && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-600" />
                    <span className="font-mono text-[11px] text-slate-700 truncate max-w-[280px]">
                      {selectedDetailItem.githubUrl}
                    </span>
                  </div>
                  <a
                    href={selectedDetailItem.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    <span>Buka Repo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {selectedDetailItem.fileAttachment && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] text-slate-700 truncate max-w-[280px]">
                      {selectedDetailItem.fileAttachment}
                    </span>
                  </div>
                  <a
                    href={selectedDetailItem.fileAttachment}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    <span>Lihat File</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {selectedDetailItem.workContent && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 block text-[11px]">Teks / Catatan Jawaban Siswa:</span>
                  <div className="max-h-36 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-line">
                    {selectedDetailItem.workContent}
                  </div>
                </div>
              )}

              {!selectedDetailItem.githubUrl && !selectedDetailItem.fileAttachment && !selectedDetailItem.workContent && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-center text-xs">
                  Jawaban terekam otomatis pada sistem lembar jawaban terpusat (CBT).
                </div>
              )}
            </div>

            {/* Footer Modal Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetTab: TabType =
                    selectedDetailItem.type === 'task'
                      ? 'tasks'
                      : selectedDetailItem.type === 'exam'
                      ? 'exams'
                      : selectedDetailItem.type === 'quiz'
                      ? 'quizzes'
                      : 'assessments';
                  setSelectedDetailItem(null);
                  onNavigateTab(targetTab);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Buka Menu {selectedDetailItem.typeLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
