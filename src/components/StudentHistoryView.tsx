import React, { useState, useMemo } from 'react';
import {
  History,
  FileCheck2,
  ListTodo,
  Award,
  HelpCircle,
  CheckCircle2,
  Clock,
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
  GraduationCap,
  Download,
  X,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Building2,
  Lock,
  Megaphone,
  Eye,
  Check,
  CheckSquare,
  XCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import {
  User,
  DailyTask,
  OnlineExam,
  InteractiveQuiz,
  AssessmentItem,
  Subject,
  TabType,
  ClassRoom,
  ExamResult
} from '../types';
import { INITIAL_USERS_ROSTER } from '../data/schoolData';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getSignatoriesInfo,
  getCachedPrintLocation,
  detectPrintLocation,
  setManualPrintLocation
} from '../utils/locationHelper';

export interface StudentHistoryItem {
  id: string;
  sourceId: string;
  type: 'task' | 'exam' | 'quiz' | 'assessment';
  typeLabel: string;
  title: string;
  subject: string;
  teacher?: string;
  targetClass?: string;
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  submittedAt: string;
  dueDate?: string;
  score?: number;
  maxScore: number;
  passingScore?: number;
  isPassed?: boolean;
  isScoreAnnounced?: boolean; // Apakah guru sudah memberikan akses nilai ke siswa
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
  rawAnswers?: Record<string, any>;
  examRef?: OnlineExam;
}

interface StudentHistoryViewProps {
  currentUser: User;
  tasks: DailyTask[];
  exams: OnlineExam[];
  quizzes: InteractiveQuiz[];
  assessments: AssessmentItem[];
  subjects: Subject[];
  classes?: ClassRoom[];
  onNavigateTab: (tab: TabType) => void;
  onUpdateExam?: (examId: string, updates: Partial<OnlineExam>) => Promise<void>;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({
  currentUser,
  tasks,
  exams,
  quizzes,
  assessments,
  subjects,
  classes = [],
  onNavigateTab,
  onUpdateExam,
}) => {
  const isTeacher =
    currentUser.role === 'teacher' ||
    currentUser.role === 'kurikulum' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'kepalasekolah';

  // State untuk Siswa
  const [studentCategory, setStudentCategory] = useState<'all' | 'task' | 'exam' | 'quiz' | 'assessment'>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSubjectFilter, setStudentSubjectFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'graded' | 'submitted'>('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState<StudentHistoryItem | null>(null);

  // State untuk Guru (Rekap Nilai Siswa per Rombel & Export Excel)
  const [teacherSelectedClass, setTeacherSelectedClass] = useState<string>('all');
  const [teacherCategoryFilter, setTeacherCategoryFilter] = useState<'all' | 'exam' | 'task' | 'assessment'>('all');
  const [teacherAnnounceFilter, setTeacherAnnounceFilter] = useState<'all' | 'announced' | 'unannounced'>('all');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState<string>('');
  const [teacherGroupByClass, setTeacherGroupByClass] = useState<boolean>(true);
  const [teacherActionMessage, setTeacherActionMessage] = useState<{ type: 'success' | 'info'; title: string; desc: string } | null>(null);
  const [viewingStudentAnswer, setViewingStudentAnswer] = useState<{
    item: StudentHistoryItem;
    exam?: OnlineExam;
  } | null>(null);
  const [answerReviewFilter, setAnswerReviewFilter] = useState<'all' | 'mc' | 'essay' | 'wrong'>('all');

  // State untuk Cetak Lembar Rekap Nilai PDF Resmi Guru
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printClassFilter, setPrintClassFilter] = useState<string>('all');
  const [printCategoryFilter, setPrintCategoryFilter] = useState<'all' | 'exam' | 'task' | 'assessment'>('all');

  // Lokasi Pencetak Dokumen (Dinamis sesuai lokasi pengguna / reverse geocode)
  const [printLocation, setPrintLocation] = useState<string>(getCachedPrintLocation());
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);

  React.useEffect(() => {
    detectPrintLocation().then((loc) => {
      if (loc) setPrintLocation(loc);
    });
  }, []);

  // ==========================================
  // 1. DATA SISWA: NORMALISASI RIWAYAT PRIBADI
  // ==========================================
  const studentHistoryItems: StudentHistoryItem[] = useMemo(() => {
    if (isTeacher) return [];

    const items: StudentHistoryItem[] = [];

    // 1. Tugas Harian
    tasks.forEach((task) => {
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
          studentName: currentUser.name,
          studentClass: currentUser.class || 'XII PPLG 2',
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: task.dueDate,
          score: isGraded ? sub.score : undefined,
          maxScore: task.maxScore || 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          isScoreAnnounced: isGraded,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'tugas terkirim menunggu guru mengumumkan nilai',
          feedback: sub.feedback,
          workContent: sub.workContent,
          githubUrl: sub.githubUrl,
          fileAttachment: sub.attachmentUrl,
        });
      }
    });

    // 2. Ulangan Online CBT
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
        const isAnnounced = Boolean(exam.isScoreAnnounced);

        // Hitung skor murni Pilihan Ganda (PG)
        const mcQuestions = (exam.questions || []).filter(
          (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
        );
        let correctCount = 0;
        mcQuestions.forEach((q) => {
          if (result.answers && result.answers[q.id] !== undefined && Number(result.answers[q.id]) === Number(q.correctIndex)) {
            correctCount++;
          }
        });
        const purePgScore = mcQuestions.length > 0
          ? Math.round((correctCount / mcQuestions.length) * 100)
          : (result.score ?? 100);

        items.push({
          id: `exam-${exam.id}`,
          sourceId: exam.id,
          type: 'exam',
          typeLabel: exam.examType || 'Ulangan Online CBT',
          title: exam.title,
          subject: exam.subject,
          teacher: exam.teacher,
          targetClass: exam.targetClass,
          studentName: currentUser.name,
          studentClass: result.studentClass || currentUser.class || exam.targetClass || 'XII PPLG 2',
          submittedAt: result.finishedAt || result.startedAt || 'Selesai Ujian',
          dueDate: exam.endDate,
          score: isAnnounced ? purePgScore : undefined,
          maxScore: result.maxScore || 100,
          passingScore: exam.passingScore || 75,
          isPassed: isAnnounced ? purePgScore >= (exam.passingScore || 75) : undefined,
          isScoreAnnounced: isAnnounced,
          status: isAnnounced ? 'graded' : 'submitted',
          statusLabel: isAnnounced ? 'Nilai Otomatis CBT' : 'tugas terkirim menunggu guru mengumumkan nilai',
          violationsCount: result.violationsCount || 0,
          totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
          rawAnswers: result.answers,
          examRef: exam,
        });
      }
    });

    // 3. Kuis Interaktif
    quizzes.forEach((quiz) => {
      const quizCompletion =
        quiz.completedStudents?.find(
          (s) =>
            s.studentId === currentUser.id ||
            (s.studentName && s.studentName.toLowerCase() === currentUser.name.toLowerCase())
        ) ||
        (quiz.isCompleted && currentUser.id === 'std-1201'
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
          studentName: currentUser.name,
          studentClass: currentUser.class || 'XII PPLG 2',
          submittedAt: quizCompletion.completedAt || 'Baru Saja',
          score: score,
          maxScore: 100,
          passingScore: passScore,
          isPassed: score >= passScore,
          isScoreAnnounced: true,
          status: 'graded',
          statusLabel: 'Kuis Diselesaikan',
          totalQuestions: quiz.totalQuestions || quiz.questions?.length || 0,
        });
      }
    });

    // 4. Asesmen Kurikulum
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
          studentName: currentUser.name,
          studentClass: currentUser.class || 'XII PPLG 2',
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: ass.deadline,
          score: isGraded ? sub.score : undefined,
          maxScore: 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          isScoreAnnounced: isGraded,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'tugas terkirim menunggu guru mengumumkan nilai',
          predicate: sub.predicate,
          teacherNotes: sub.teacherNotes,
          workContent: sub.content,
          fileAttachment: sub.fileUrl,
        });
      }
    });

    return items;
  }, [currentUser, tasks, exams, quizzes, assessments, isTeacher]);

  // Filter Data Siswa Pribadi
  const filteredStudentItems = useMemo(() => {
    return studentHistoryItems.filter((item) => {
      if (studentCategory !== 'all' && item.type !== studentCategory) return false;
      if (studentSubjectFilter !== 'all' && item.subject !== studentSubjectFilter) return false;
      if (studentStatusFilter !== 'all' && item.status !== studentStatusFilter) return false;
      if (studentSearchQuery.trim() !== '') {
        const q = studentSearchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchTeacher = item.teacher?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchSubject && !matchTeacher) return false;
      }
      return true;
    });
  }, [studentHistoryItems, studentCategory, studentSubjectFilter, studentStatusFilter, studentSearchQuery]);

  // Statistik Ringkasan Siswa Pribadi (Hanya menghitung nilai yang sudah diumumkan guru)
  const studentStats = useMemo(() => {
    const totalSubmitted = studentHistoryItems.length;
    const announcedGradedItems = studentHistoryItems.filter(
      (i) => i.score !== undefined && i.isScoreAnnounced === true
    );
    const totalScore = announcedGradedItems.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = announcedGradedItems.length > 0 ? (totalScore / announcedGradedItems.length).toFixed(1) : '-';
    const passedCount = announcedGradedItems.filter((i) => i.isPassed === true).length;
    const passRate = announcedGradedItems.length > 0 ? Math.round((passedCount / announcedGradedItems.length) * 100) : 100;
    const pendingAnnouncementCount = studentHistoryItems.filter((i) => i.isScoreAnnounced === false).length;

    return {
      totalSubmitted,
      gradedCount: announcedGradedItems.length,
      pendingAnnouncementCount,
      avgScore,
      passRate,
    };
  }, [studentHistoryItems]);

  // ==============================================================
  // 2. DATA GURU: REKAPITULASI SELURUH SISWA (MULTI-ROMBEL & EXCEL)
  // ==============================================================
  const allTeacherRecapRows: StudentHistoryItem[] = useMemo(() => {
    if (!isTeacher) return [];

    const rows: StudentHistoryItem[] = [];

    // 1. Dari Ulangan Online CBT (Semua Siswa & Kelas)
    exams.forEach((exam) => {
      const mcQuestions = (exam.questions || []).filter(
        (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
      );
      const isAnnounced = Boolean(exam.isScoreAnnounced);

      (exam.results || []).forEach((res) => {
        let correctCount = 0;
        mcQuestions.forEach((q) => {
          if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
            correctCount++;
          }
        });
        const purePgScore = mcQuestions.length > 0
          ? Math.round((correctCount / mcQuestions.length) * 100)
          : (res.score ?? 100);
        const isPassed = purePgScore >= (exam.passingScore || 75);

        rows.push({
          id: `exam-${exam.id}-${res.studentId}`,
          sourceId: exam.id,
          type: 'exam',
          typeLabel: exam.examType || 'Ulangan Online CBT',
          title: exam.title,
          subject: exam.subject,
          teacher: exam.teacher,
          targetClass: exam.targetClass,
          studentId: res.studentId,
          studentName: res.studentName,
          studentClass: res.studentClass || exam.targetClass || 'XII PPLG 2',
          submittedAt: res.finishedAt || res.startedAt || 'Selesai Ujian',
          dueDate: exam.endDate,
          score: purePgScore,
          maxScore: res.maxScore || 100,
          passingScore: exam.passingScore || 75,
          isPassed,
          isScoreAnnounced: isAnnounced,
          status: 'graded',
          statusLabel: isAnnounced ? 'Sudah Diumumkan' : 'Belum Diumumkan (Menunggu Guru)',
          violationsCount: res.violationsCount || 0,
          totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
          rawAnswers: res.answers,
          examRef: exam,
        });
      });
    });

    // 2. Dari Tugas Harian (Semua Submissions Siswa)
    tasks.forEach((task) => {
      (task.submissions || []).forEach((sub) => {
        const isGraded = sub.status === 'graded' && sub.score !== undefined;
        rows.push({
          id: `task-${task.id}-${sub.studentId}`,
          sourceId: task.id,
          type: 'task',
          typeLabel: 'Tugas Harian',
          title: task.title,
          subject: task.subject,
          teacher: task.teacher,
          targetClass: task.targetClass,
          studentId: sub.studentId,
          studentName: sub.studentName,
          studentClass: (sub as any).studentClass || task.targetClass || 'XII PPLG 2',
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: task.dueDate,
          score: sub.score,
          maxScore: task.maxScore || 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          isScoreAnnounced: isGraded,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'Menunggu Penilaian Guru',
          feedback: sub.feedback,
          workContent: sub.workContent,
          githubUrl: sub.githubUrl,
          fileAttachment: sub.attachmentUrl,
        });
      });
    });

    // 3. Dari Asesmen
    assessments.forEach((ass) => {
      (ass.submissions || []).forEach((sub) => {
        const isGraded = sub.score !== undefined;
        rows.push({
          id: `ass-${ass.id}-${sub.studentId}`,
          sourceId: ass.id,
          type: 'assessment',
          typeLabel: `Asesmen ${ass.type || 'Kurikulum'}`,
          title: ass.title,
          subject: ass.subject,
          teacher: ass.teacher,
          targetClass: ass.targetClass,
          studentId: sub.studentId,
          studentName: sub.studentName,
          studentClass: (sub as any).studentClass || ass.targetClass || 'XII PPLG 2',
          submittedAt: sub.submittedAt || 'Telah dikumpulkan',
          dueDate: ass.deadline,
          score: sub.score,
          maxScore: 100,
          passingScore: 75,
          isPassed: sub.score !== undefined ? sub.score >= 75 : undefined,
          isScoreAnnounced: isGraded,
          status: isGraded ? 'graded' : 'submitted',
          statusLabel: isGraded ? 'Sudah Dinilai' : 'Menunggu Review Rubrik',
          predicate: sub.predicate,
          teacherNotes: sub.teacherNotes,
          workContent: sub.content,
          fileAttachment: sub.fileUrl,
        });
      });
    });

    return rows;
  }, [exams, tasks, assessments, isTeacher]);

  // Daftar Kelas Unik yang Tersedia (Untuk Fitur Pemisahan Kelas)
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();

    // Ambil dari prop classes
    classes.forEach((c) => {
      if (c.name && c.name.trim()) classSet.add(c.name.trim());
    });

    // Ambil dari targetClass & studentClass riwayat data
    allTeacherRecapRows.forEach((r) => {
      if (r.studentClass && r.studentClass.trim()) classSet.add(r.studentClass.trim());
      if (r.targetClass && r.targetClass.trim()) classSet.add(r.targetClass.trim());
    });

    // Fallback default jika belum ada
    if (classSet.size === 0) {
      classSet.add('XII PPLG 1');
      classSet.add('XII PPLG 2');
      classSet.add('10 TJKT 1');
      classSet.add('10 DKV 1');
    }

    return Array.from(classSet).sort();
  }, [classes, allTeacherRecapRows]);

  // Filter Data Rekap Guru Berdasarkan Pemisahan Kelas & Kategori
  const filteredTeacherRows = useMemo(() => {
    return allTeacherRecapRows.filter((row) => {
      // 1. Pemisahan Kelas
      if (teacherSelectedClass !== 'all') {
        const rowCls = (row.studentClass || '').trim().toLowerCase();
        const targetCls = teacherSelectedClass.trim().toLowerCase();
        if (rowCls !== targetCls) return false;
      }

      // 2. Kategori Evaluasi
      if (teacherCategoryFilter !== 'all' && row.type !== teacherCategoryFilter) {
        return false;
      }

      // 3. Status Pengumuman Nilai
      if (teacherAnnounceFilter === 'announced' && !row.isScoreAnnounced) return false;
      if (teacherAnnounceFilter === 'unannounced' && row.isScoreAnnounced) return false;

      // 4. Pencarian Teks
      if (teacherSearchQuery.trim() !== '') {
        const q = teacherSearchQuery.toLowerCase();
        const matchName = (row.studentName || '').toLowerCase().includes(q);
        const matchId = (row.studentId || '').toLowerCase().includes(q);
        const matchTitle = row.title.toLowerCase().includes(q);
        const matchSubject = row.subject.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchTitle && !matchSubject) return false;
      }

      return true;
    });
  }, [allTeacherRecapRows, teacherSelectedClass, teacherCategoryFilter, teacherAnnounceFilter, teacherSearchQuery]);

  // Statistik Ringkasan Guru
  const teacherStats = useMemo(() => {
    const totalEntries = filteredTeacherRows.length;
    const gradedEntries = filteredTeacherRows.filter((r) => r.score !== undefined);
    const totalSum = gradedEntries.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = gradedEntries.length > 0 ? (totalSum / gradedEntries.length).toFixed(1) : '0';
    const passedCount = gradedEntries.filter((r) => r.isPassed === true).length;
    const passRate = gradedEntries.length > 0 ? Math.round((passedCount / gradedEntries.length) * 100) : 0;
    const announcedCount = filteredTeacherRows.filter((r) => r.isScoreAnnounced).length;

    return {
      totalEntries,
      avgScore,
      passedCount,
      passRate,
      announcedCount,
      unannouncedCount: totalEntries - announcedCount,
    };
  }, [filteredTeacherRows]);

  // Kelompokkan Data per Rombel / Kelas (Group by Class)
  const groupedTeacherRows = useMemo(() => {
    const groups: Record<string, StudentHistoryItem[]> = {};
    filteredTeacherRows.forEach((row) => {
      const cls = row.studentClass || row.targetClass || 'Tanpa Kelas';
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(row);
    });
    return groups;
  }, [filteredTeacherRows]);

  const getStudentNis = (studentId?: string, studentName?: string) => {
    const found = INITIAL_USERS_ROSTER.find(
      (s: any) => (studentId && s.id === studentId) || (studentName && s.name.toLowerCase() === studentName.toLowerCase())
    );
    if (found?.nisn && found.nisn !== '-') return found.nisn;
    if (studentId) {
      const num = studentId.replace(/\D/g, '');
      return num ? `0068${num.padStart(6, '0')}` : studentId;
    }
    return '-';
  };

  // =======================================================
  // 3. FITUR EXPORT NILAI ULANGAN SISWA KE EXCEL (.XLSX)
  // =======================================================
  const handleExportTeacherRecapToExcel = (targetClass: string = 'all') => {
    const rowsToExport = filteredTeacherRows;

    if (rowsToExport.length === 0) {
      alert('Tidak ada data nilai siswa untuk diekspor pada filter ini.');
      return;
    }

    // Header Kolom Excel (A1 = NIS, B1 = ID Siswa, C1 = Nama Lengkap Siswa, dst.)
    const headers = [
      'NIS',
      'ID Siswa',
      'Nama Lengkap Siswa',
      'Kelas / Rombel',
      'Mata Pelajaran',
      'Judul Ulangan',
      'Kode Ulangan',
      'Standar KKM',
      'Nilai Ulangan (PG)',
      'Status KKM',
      'Soal PG Benar',
      'Total PG',
      'Total Esai',
      'Pelanggaran Tab Switch',
      'Waktu Pengumpulan',
      'Status Pengumuman Nilai'
    ];

    const dataRows = rowsToExport.map((row) => {
      const nisValue = getStudentNis(row.studentId, row.studentName);
      const isExam = row.type === 'exam' && row.examRef;

      let correctCount: any = '-';
      let totalMc: any = '-';
      let essayCount: any = '-';
      let examCode = '-';

      if (isExam && row.examRef) {
        examCode = row.examRef.code || '-';
        const mcQuestions = (row.examRef.questions || []).filter(
          (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
        );
        totalMc = mcQuestions.length;
        essayCount = (row.examRef.questions || []).filter((q) => q.type === 'essay').length;

        let cCount = 0;
        mcQuestions.forEach((q) => {
          if (row.rawAnswers && row.rawAnswers[q.id] !== undefined && Number(row.rawAnswers[q.id]) === Number(q.correctIndex)) {
            cCount++;
          }
        });
        correctCount = cCount;
      }

      const displayScore = row.score !== undefined ? row.score : '-';
      const statusPassed =
        row.isPassed !== undefined
          ? row.isPassed
            ? 'TUNTAS KKM'
            : 'REMEDIAL'
          : 'BELUM DINILAI';
      const announceStatus = row.isScoreAnnounced ? 'Sudah Diumumkan' : 'Belum Diumumkan';

      return [
        nisValue,
        row.studentId || '-',
        row.studentName || '-',
        row.studentClass || row.targetClass || '-',
        row.subject,
        row.title,
        examCode,
        row.passingScore || 75,
        displayScore,
        statusPassed,
        correctCount,
        totalMc,
        essayCount,
        row.violationsCount || 0,
        row.submittedAt,
        announceStatus
      ];
    });

    // Buat worksheet dan workbook Excel (.xlsx) murni data tabel (hanya header dan isi data siswa sesuai permintaan)
    const wsData = [
      headers,
      ...dataRows
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Atur lebar kolom (auto-fit columns width)
    ws['!cols'] = [
      { wch: 16 }, // A: NIS
      { wch: 14 }, // B: ID Siswa
      { wch: 32 }, // C: Nama Lengkap Siswa
      { wch: 16 }, // D: Kelas / Rombel
      { wch: 28 }, // E: Mata Pelajaran
      { wch: 35 }, // F: Judul Ulangan
      { wch: 16 }, // G: Kode Ulangan
      { wch: 14 }, // H: Standar KKM
      { wch: 20 }, // I: Nilai Ulangan (PG)
      { wch: 15 }, // J: Status KKM
      { wch: 15 }, // K: Soal PG Benar
      { wch: 12 }, // L: Total PG
      { wch: 12 }, // M: Total Esai
      { wch: 22 }, // N: Pelanggaran Tab Switch
      { wch: 25 }, // O: Waktu Pengumpulan
      { wch: 24 }, // P: Status Pengumuman Nilai
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai Siswa');

    const safeClass = targetClass === 'all' ? 'Semua_Rombel' : targetClass.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Rekap_Nilai_Siswa_${safeClass}_${dateStr}.xlsx`;

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTeacherActionMessage({
      type: 'success',
      title: 'File Excel (.xlsx) Berhasil Diunduh',
      desc: `Rekap nilai siswa untuk ${targetClass === 'all' ? 'semua kelas' : `kelas ${targetClass}`} berhasil diekspor (${rowsToExport.length} data) dalam format tabel Excel terpisah (A1=NIS, B1=ID Siswa, dst.).`,
    });
  };

  // Toggle Akses Pengumuman Nilai Ulangan CBT oleh Guru
  const handleToggleAnnounceExamScore = async (examId: string, currentState: boolean) => {
    if (!onUpdateExam) {
      alert('Fungsi update ujian belum terpasang.');
      return;
    }
    const nextState = !currentState;
    try {
      await onUpdateExam(examId, { isScoreAnnounced: nextState });
      const targetExam = exams.find((e) => e.id === examId);
      const title = targetExam?.title || 'Ulangan CBT';

      setTeacherActionMessage({
        type: 'success',
        title: nextState ? 'Akses Nilai Diberikan ke Siswa' : 'Akses Nilai Ditutup Kembali',
        desc: nextState
          ? `Siswa sekarang dapat melihat perolehan nilai dan evaluasi untuk "${title}" di menu Riwayat Nilai.`
          : `Nilai "${title}" dirahasiakan kembali. Pada akun siswa tampil: "tugas terkirim menunggu guru mengumumkan nilai".`,
      });
    } catch (err) {
      console.error('Gagal memperbarui status pengumuman nilai:', err);
    }
  };

  // Data Baris untuk Dokumen Cetak / PDF
  const rowsToPrint = useMemo(() => {
    return allTeacherRecapRows.filter((row) => {
      if (printClassFilter !== 'all') {
        const rowCls = (row.studentClass || '').trim().toLowerCase();
        const targetCls = printClassFilter.trim().toLowerCase();
        if (rowCls !== targetCls) return false;
      }
      if (printCategoryFilter !== 'all' && row.type !== printCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [allTeacherRecapRows, printClassFilter, printCategoryFilter]);

  // Statistik untuk Dokumen Cetak / PDF
  const printStats = useMemo(() => {
    const total = rowsToPrint.length;
    const graded = rowsToPrint.filter((r) => r.score !== undefined);
    const sum = graded.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avg = graded.length > 0 ? (sum / graded.length).toFixed(1) : '0';
    const passed = rowsToPrint.filter((r) => r.isPassed).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, avg, passed, passRate };
  }, [rowsToPrint]);

  // Download Dokumen PDF Resmi Guru via jsPDF
  const handleDownloadTeacherRecapPdf = () => {
    if (rowsToPrint.length === 0) {
      alert('Tidak ada data nilai siswa untuk diunduh dalam filter ini.');
      return;
    }

    const signatories = getSignatoriesInfo(currentUser, printLocation);
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // 1. KOP SURAT RESMI SMK CITRA NEGARA
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('PEMERINTAH DAERAH PROVINSI JAWA BARAT', 148, 12, { align: 'center' });
    doc.text('DINAS PENDIDIKAN CABANG DINAS WILAYAH VII', 148, 17, { align: 'center' });
    doc.setFontSize(13);
    doc.text(`${signatories.schoolName} KOTA DEPOK`, 148, 23, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('Kompetensi Keahlian: Rekayasa Perangkat Lunak & Gim (PPLG) • TJKT • DKV • MPLB • Akuntansi', 148, 27, { align: 'center' });
    doc.text(`${signatories.schoolAddress} | Telp: ${signatories.schoolPhone} | NPSN: ${signatories.schoolNpsn}`, 148, 31, { align: 'center' });

    // Garis Kop Surat
    doc.setLineWidth(0.8);
    doc.line(14, 33, 283, 33);
    doc.setLineWidth(0.3);
    doc.line(14, 34, 283, 34);

    // 2. JUDUL DOKUMEN
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('LEMBAR REKAPITULASI NILAI SISWA & EVALUASI AKADEMIK', 148, 40, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text('Tahun Ajaran 2025/2026 — Semester Ganjil', 148, 44, { align: 'center' });

    // 3. METADATA & STATISTIK
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    const classLabel = printClassFilter === 'all' ? 'Seluruh Rombel' : printClassFilter;
    const catLabel =
      printCategoryFilter === 'all'
        ? 'Semua Evaluasi (Ulangan CBT, Tugas, Asesmen)'
        : printCategoryFilter === 'exam'
        ? 'Ulangan CBT'
        : printCategoryFilter === 'task'
        ? 'Tugas Harian'
        : 'Asesmen & Proyek';

    doc.text(`Rombel / Kelas : ${classLabel}`, 14, 50);
    doc.text(`Kategori : ${catLabel}`, 14, 54);
    doc.text(`Dicetak Oleh : ${signatories.guru.name}`, 180, 50);
    doc.text(`Lokasi & Tanggal : ${signatories.printLocation}, ${signatories.printDateIndo}`, 180, 54);

    // Ringkasan Statistik
    doc.setFont('times', 'bold');
    doc.text(
      `Statistik: Total Data: ${printStats.total} Siswa | Rata-rata Nilai: ${printStats.avg}/100 | Tuntas KKM: ${printStats.passed} Siswa (${printStats.passRate}%) | Belum Tuntas: ${printStats.total - printStats.passed} Siswa`,
      14,
      60
    );

    // 4. TABEL REKAP NILAI
    const tableHeaders = [
      ['No', 'NIS', 'ID Siswa', 'Nama Lengkap Siswa', 'Rombel', 'Mata Pelajaran', 'Judul Evaluasi', 'KKM', 'Nilai', 'Status', 'Pengumpulan']
    ];

    const tableBody = rowsToPrint.map((row, idx) => {
      const nis = getStudentNis(row.studentId, row.studentName);
      const displayScore = row.score !== undefined ? String(row.score) : '-';
      const statusText = row.isPassed !== undefined ? (row.isPassed ? 'TUNTAS' : 'REMEDIAL') : 'PROSES';

      return [
        String(idx + 1),
        nis,
        row.studentId || '-',
        row.studentName || '-',
        row.studentClass || row.targetClass || '-',
        row.subject || '-',
        row.title || '-',
        String(row.passingScore || 75),
        displayScore,
        statusText,
        row.submittedAt || '-'
      ];
    });

    const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable as any).default;
    runAutoTable(doc, {
      startY: 63,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 18 },
        3: { cellWidth: 42 },
        4: { halign: 'center', cellWidth: 22 },
        5: { cellWidth: 35 },
        6: { cellWidth: 45 },
        7: { halign: 'center', cellWidth: 14 },
        8: { halign: 'center', cellWidth: 14 },
        9: { halign: 'center', cellWidth: 20 },
        10: { cellWidth: 27 }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 9) {
          if (data.cell.raw === 'TUNTAS') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [16, 120, 60];
          } else if (data.cell.raw === 'REMEDIAL') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

    // 5. TANDA TANGAN (3 KOLOM: KEPALA SEKOLAH, KURIKULUM, GURU PENCETAK)
    const lastY = (doc as any).lastAutoTable?.finalY || 150;
    let signY = lastY + 12;
    if (signY + 32 > 195) {
      doc.addPage();
      signY = 25;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    // Kolom Kiri: Kepala Sekolah SMK CITRA NEGARA
    doc.text('Mengetahui,', 45, signY, { align: 'center' });
    doc.text(signatories.kepsek.roleLabel, 45, signY + 4, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(signatories.kepsek.name, 45, signY + 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(`NIP. ${signatories.kepsek.nip}`, 45, signY + 26, { align: 'center' });

    // Kolom Tengah: Waka. Bidang Kurikulum
    doc.text('Menyetujui / Memeriksa,', 148, signY, { align: 'center' });
    doc.text(signatories.kurikulum.roleLabel, 148, signY + 4, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(signatories.kurikulum.name, 148, signY + 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(`NIP. ${signatories.kurikulum.nip}`, 148, signY + 26, { align: 'center' });

    // Kolom Kanan: Lokasi Pencetak & Guru Yang Mencetak
    doc.text(`${signatories.printLocation}, ${signatories.printDateIndo}`, 245, signY, { align: 'center' });
    doc.text(signatories.guru.roleLabel, 245, signY + 4, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(signatories.guru.name, 245, signY + 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(`NIP/ID. ${signatories.guru.nip}`, 245, signY + 26, { align: 'center' });

    const safeClass = printClassFilter === 'all' ? 'Semua_Rombel' : printClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rekap_Nilai_Siswa_${safeClass}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    setTeacherActionMessage({
      type: 'success',
      title: 'File PDF Resmi Berhasil Diunduh',
      desc: `Dokumen Rekapitulasi Nilai Siswa (${rowsToPrint.length} data) berhasil dibuat dan diunduh: ${filename}`,
    });
  };

  // Eksekusi Cetak Dokumen PDF Resmi
  const handleExecutePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Native window.print() error, triggering direct PDF download instead:', e);
      handleDownloadTeacherRecapPdf();
    }
  };

  // Unduh Transkrip Nilai Siswa via jsPDF
  const handleDownloadStudentTranscriptPdf = () => {
    const todayDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const studentNis = getStudentNis(currentUser.id, currentUser.name);

    const doc = new jsPDF('portrait', 'mm', 'a4');

    // 1. KOP SURAT
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('PEMERINTAH DAERAH PROVINSI JAWA BARAT', 105, 12, { align: 'center' });
    doc.text('DINAS PENDIDIKAN CABANG DINAS WILAYAH VII', 105, 17, { align: 'center' });
    doc.setFontSize(13);
    doc.text('SMK CITRA NEGARA KOTA DEPOK', 105, 23, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('Jl. Tanah Baru No. 100, Beji, Kota Depok | Telp: (021) 7721-3344 | NPSN: 20268845', 105, 27, { align: 'center' });

    doc.setLineWidth(0.8);
    doc.line(14, 29, 196, 29);
    doc.setLineWidth(0.3);
    doc.line(14, 30, 196, 30);

    // 2. JUDUL
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('TRANSKRIP RIWAYAT PENGERJAAN & NILAI SISWA', 105, 36, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text('Semester Ganjil - Tahun Ajaran 2025/2026', 105, 40, { align: 'center' });

    // 3. METADATA
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Nama Siswa   : ${currentUser.name}`, 14, 46);
    doc.text(`NIS / NISN   : ${studentNis}`, 14, 50);
    doc.text(`Kelas / Rombel : ${currentUser.class || 'XII PPLG 2'}`, 120, 46);
    doc.text(`Rata-rata Nilai: ${studentStats.avgScore} / 100`, 120, 50);

    // 4. TABEL
    const headers = [['No', 'Judul Tugas / Ulangan', 'Mata Pelajaran', 'Kategori', 'KKM', 'Nilai', 'Status', 'Waktu Kirim']];
    const body = filteredStudentItems.map((item, idx) => {
      const isAnnounced = item.isScoreAnnounced === true;
      const scoreText = !isAnnounced ? 'Menunggu Pengumuman' : item.score !== undefined ? String(item.score) : '-';
      const statusText = !isAnnounced ? 'Tugas Terkirim' : item.isPassed !== undefined ? (item.isPassed ? 'LULUS KKM' : 'REMEDIAL') : '-';

      return [
        String(idx + 1),
        item.title,
        item.subject,
        item.typeLabel,
        String(item.passingScore || 75),
        scoreText,
        statusText,
        item.submittedAt
      ];
    });

    autoTable(doc, {
      startY: 54,
      head: headers,
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [0, 0, 0]
      },
      margin: { left: 14, right: 14 }
    });

    const safeName = currentUser.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Transkrip_Nilai_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Eksekusi Cetak Transkrip Nilai Siswa (PDF / Hardcopy)
  const handleExecuteStudentPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Native window.print() error, triggering direct student PDF download:', e);
      handleDownloadStudentTranscriptPdf();
    }
  };

  // ==========================================
  // RENDER UNTUK MODE GURU (REKAP NILAI SISWA)
  // ==========================================
  if (isTeacher) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header Rekap Nilai Guru */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Rekapitulasi Nilai Siswa
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Pemisahan Rombel & Export Excel
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Rekap Nilai Siswa (Untuk Guru & Pendidik)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Pantau seluruh capaian nilai ulangan CBT, tugas harian, dan asesmen siswa per rombel/kelas. Guru dapat memberikan atau menutup akses pengumuman nilai ke siswa serta mengekspor data ke lembar kerja Excel.
              </p>
            </div>

            {/* Lokasi Pencetak Dinamis & Action Buttons: Export Excel & Print */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition border border-white/20 px-3 py-2.5 rounded-2xl text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="text-[11px] text-slate-300">Lokasi:</span>
                {isEditingLocation ? (
                  <input
                    type="text"
                    value={printLocation}
                    onChange={(e) => {
                      setPrintLocation(e.target.value);
                      setManualPrintLocation(e.target.value);
                    }}
                    onBlur={() => setIsEditingLocation(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingLocation(false)}
                    autoFocus
                    className="px-2 py-0.5 bg-slate-900 text-white rounded-lg text-xs border border-emerald-400 focus:outline-none w-28"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation(true)}
                    className="font-bold underline decoration-dashed hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                    title="Klik untuk mengubah lokasi pencetak dokumen (otomatis tersimpan & sinkron ke Excel/PDF)"
                  >
                    {printLocation}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleExportTeacherRecapToExcel(teacherSelectedClass)}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer border border-emerald-400/30"
                title="Download lembar rekap nilai siswa dalam format Excel (.xlsx) lengkap dengan tanda tangan pengesahan"
              >
                <Download className="w-4 h-4" />
                <span>Export Nilai ke Excel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintClassFilter(teacherSelectedClass);
                  setPrintCategoryFilter(teacherCategoryFilter);
                  setShowPrintModal(true);
                }}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition border border-white/20 backdrop-blur-xs flex items-center gap-2 cursor-pointer shadow-sm"
                title="Cetak atau unduh dokumen rekapitulasi nilai siswa dalam format PDF resmi"
              >
                <Printer className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Message Banner */}
        {teacherActionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between gap-3 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-extrabold text-sm text-emerald-900">{teacherActionMessage.title}</h4>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">{teacherActionMessage.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setTeacherActionMessage(null)}
              className="text-emerald-500 hover:text-emerald-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Cards Ringkasan Nilai Guru */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Nilai Terdata</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{teacherStats.totalEntries}</div>
            <div className="text-[11px] text-slate-500">
              {teacherSelectedClass === 'all' ? 'Seluruh rombel siswa' : `Rombel: ${teacherSelectedClass}`}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Rata-rata Nilai</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {teacherStats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500">Nilai murni Pilihan Ganda CBT & Tugas</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Ketuntasan KKM</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700">
              {teacherStats.passRate}%
            </div>
            <div className="text-[11px] text-slate-500">
              {teacherStats.passedCount} dari {teacherStats.totalEntries} tuntas standar KKM
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Status Pengumuman</span>
              <Megaphone className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              <span className="text-emerald-600">{teacherStats.announcedCount}</span>
              <span className="text-slate-300 text-lg"> / </span>
              <span className="text-amber-600">{teacherStats.unannouncedCount}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {teacherStats.announcedCount} diumumkan • {teacherStats.unannouncedCount} dirahasiakan
            </div>
          </div>
        </div>

        {/* 1. FITUR PEMISAHAN KELAS (ROMBEL SELECTOR TABS) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                <span>Fitur Pemisahan Kelas (Rombel)</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Pilih Rombel / Kelas Sasaran
              </h3>
              <p className="text-xs text-slate-500">
                Klik salah satu tab rombel di bawah untuk memisahkan rekap nilai per kelas, atau pilih semua kelas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 select-none hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={teacherGroupByClass}
                  onChange={(e) => setTeacherGroupByClass(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Kelompokkan per Rombel</span>
              </label>

              <button
                type="button"
                onClick={() => handleExportTeacherRecapToExcel(teacherSelectedClass)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                title="Download Excel rekap kelas ini"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export Excel Kelas Ini</span>
              </button>
            </div>
          </div>

          {/* Tab Pemisahan Kelas */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTeacherSelectedClass('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                teacherSelectedClass === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Semua Rombel / Kelas</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                teacherSelectedClass === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {allTeacherRecapRows.length}
              </span>
            </button>

            {availableClasses.map((cls) => {
              const countInClass = allTeacherRecapRows.filter(
                (r) => (r.studentClass || '').trim().toLowerCase() === cls.toLowerCase()
              ).length;

              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setTeacherSelectedClass(cls)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    teacherSelectedClass === cls
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{cls}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    teacherSelectedClass === cls ? 'bg-white/20 text-white' : 'bg-indigo-200/80 text-indigo-900'
                  }`}>
                    {countInClass}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bar Filter Kategori, Status Pengumuman, & Pencarian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Kategori Evaluasi:
              </label>
              <select
                value={teacherCategoryFilter}
                onChange={(e) => setTeacherCategoryFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori (Ulangan CBT, Tugas, Asesmen)</option>
                <option value="exam">Hanya Ulangan Online CBT</option>
                <option value="task">Hanya Tugas Harian & Koding</option>
                <option value="assessment">Hanya Asesmen Kurikulum</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Akses Pengumuman Nilai ke Siswa:
              </label>
              <select
                value={teacherAnnounceFilter}
                onChange={(e) => setTeacherAnnounceFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status Pengumuman</option>
                <option value="announced">Sudah Diumumkan ke Siswa</option>
                <option value="unannounced">Belum Diumumkan (Tugas Terkirim Menunggu Guru)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Cari Siswa / Judul Ulangan:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama siswa, NIS, atau ulangan..."
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. TABEL REKAPITULASI NILAI SISWA (MENDUKUNG PENGELOMPOKKAN KELAS & EXPORT EXCEL) */}
        {filteredTeacherRows.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ditemukan Data Rekap Nilai</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada data nilai siswa untuk kombinasi filter kelas "{teacherSelectedClass}", kategori, atau kata kunci tersebut.
            </p>
            <button
              onClick={() => {
                setTeacherSelectedClass('all');
                setTeacherCategoryFilter('all');
                setTeacherAnnounceFilter('all');
                setTeacherSearchQuery('');
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : teacherGroupByClass && teacherSelectedClass === 'all' ? (
          // Mode Pengelompokkan per Rombel
          <div className="space-y-6">
            {Object.keys(groupedTeacherRows).map((className) => {
              const rowsInGroup = groupedTeacherRows[className];
              const groupSum = rowsInGroup.reduce((acc, c) => acc + (c.score || 0), 0);
              const groupAvg = rowsInGroup.length > 0 ? (groupSum / rowsInGroup.length).toFixed(1) : '0';
              const groupPassed = rowsInGroup.filter((r) => r.isPassed).length;

              return (
                <div key={className} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          Rombel: {className}
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {rowsInGroup.length} Nilai Terdata
                          </span>
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Rata-rata: <strong>{groupAvg}</strong> • Tuntas KKM: <strong>{groupPassed}/{rowsInGroup.length}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleExportTeacherRecapToExcel(className)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title={`Export nilai khusus kelas ${className} ke Excel (.xlsx)`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Excel ({className})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPrintClassFilter(className);
                          setPrintCategoryFilter(teacherCategoryFilter);
                          setShowPrintModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title={`Cetak rekap PDF resmi untuk kelas ${className}`}
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cetak PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 text-slate-700 font-black border-b border-slate-200 text-[11px]">
                          <th className="py-3 px-3.5 w-12 text-center">No</th>
                          <th className="py-3 px-3.5">Nama Siswa</th>
                          <th className="py-3 px-3.5">Paket Ulangan / Tugas</th>
                          <th className="py-3 px-3.5 text-center">KKM</th>
                          <th className="py-3 px-3.5 text-center">Nilai (PG)</th>
                          <th className="py-3 px-3.5 text-center">Status KKM</th>
                          <th className="py-3 px-3.5">Akses Pengumuman Nilai</th>
                          <th className="py-3 px-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {rowsInGroup.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3.5 font-bold text-slate-900">
                              <div>{row.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                NIS: {row.studentId || '-'}
                              </div>
                              {row.violationsCount && row.violationsCount > 0 ? (
                                <span className="text-[10px] text-rose-600 font-semibold block">
                                  ⚠️ {row.violationsCount}x tab switch
                                </span>
                              ) : null}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-800 line-clamp-1">{row.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {row.subject} • <span className="text-indigo-600 font-semibold">{row.typeLabel}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-center font-bold text-slate-500">
                              {row.passingScore || 75}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              {row.score !== undefined ? (
                                <span className="font-black text-sm text-indigo-700">{row.score}</span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Belum Dinilai</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              {row.isPassed !== undefined ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    row.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.isPassed ? 'LULUS' : 'REMEDIAL'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold inline-flex items-center gap-1 border ${
                                    row.isScoreAnnounced
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {row.isScoreAnnounced ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Diumumkan ke Siswa
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      Belum Diumumkan
                                    </>
                                  )}
                                </span>

                                {row.type === 'exam' && onUpdateExam && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAnnounceExamScore(row.sourceId, Boolean(row.isScoreAnnounced))}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                      row.isScoreAnnounced
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                                    }`}
                                    title={
                                      row.isScoreAnnounced
                                        ? 'Tutup kembali akses nilai agar siswa tidak dapat melihat'
                                        : 'Beri akses ke siswa agar nilai dapat dilihat di menu Riwayat Nilai'
                                    }
                                  >
                                    {row.isScoreAnnounced ? 'Tutup Akses' : 'Beri Akses Nilai'}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => setViewingStudentAnswer({ item: row, exam: row.examRef })}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Jawaban</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Tabel Standar (Untuk Satu Rombel Tertentu atau Non-Grouped)
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  Daftar Rekapitulasi Nilai Siswa
                  {teacherSelectedClass !== 'all' && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Kelas: {teacherSelectedClass}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  Menampilkan <strong>{filteredTeacherRows.length}</strong> data hasil evaluasi siswa
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExportTeacherRecapToExcel(teacherSelectedClass)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Spreadsheet Excel (.xlsx)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 font-black border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-3.5 w-12 text-center">No</th>
                    <th className="py-3 px-3.5">Nama Siswa</th>
                    <th className="py-3 px-3.5">Rombel / Kelas</th>
                    <th className="py-3 px-3.5">Paket Ulangan / Tugas</th>
                    <th className="py-3 px-3.5 text-center">KKM</th>
                    <th className="py-3 px-3.5 text-center">Nilai (PG)</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5">Akses Pengumuman Nilai</th>
                    <th className="py-3 px-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTeacherRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        <div>{row.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NIS: {row.studentId || '-'}
                        </div>
                        {row.violationsCount && row.violationsCount > 0 ? (
                          <span className="text-[10px] text-rose-600 font-semibold block">
                            ⚠️ {row.violationsCount}x tab switch
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-indigo-600">
                        <span className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {row.studentClass}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800 line-clamp-1">{row.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {row.subject} • <span className="text-indigo-600 font-semibold">{row.typeLabel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-slate-500">
                        {row.passingScore || 75}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {row.score !== undefined ? (
                          <span className="font-black text-sm text-indigo-700">{row.score}</span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Belum Dinilai</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {row.isPassed !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              row.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {row.isPassed ? 'LULUS' : 'REMEDIAL'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold inline-flex items-center gap-1 border ${
                              row.isScoreAnnounced
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {row.isScoreAnnounced ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Diumumkan ke Siswa
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                Belum Diumumkan
                              </>
                            )}
                          </span>

                          {row.type === 'exam' && onUpdateExam && (
                            <button
                              type="button"
                              onClick={() => handleToggleAnnounceExamScore(row.sourceId, Boolean(row.isScoreAnnounced))}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                row.isScoreAnnounced
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                              }`}
                              title={
                                row.isScoreAnnounced
                                  ? 'Tutup kembali akses nilai agar siswa tidak dapat melihat'
                                  : 'Beri akses ke siswa agar nilai dapat dilihat di menu Riwayat Nilai'
                              }
                            >
                              {row.isScoreAnnounced ? 'Tutup Akses' : 'Beri Akses Nilai'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingStudentAnswer({ item: row, exam: row.examRef })}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Jawaban</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL LIHAT LEMBAR JAWABAN SISWA UNTUK GURU */}
        {viewingStudentAnswer && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {viewingStudentAnswer.item.studentClass}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      NIS: {viewingStudentAnswer.item.studentId || '-'}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Lembar Jawaban Siswa: {viewingStudentAnswer.item.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ulangan: <strong>{viewingStudentAnswer.item.title}</strong> • Mapel: <strong>{viewingStudentAnswer.item.subject}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setViewingStudentAnswer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rincian Skor & Filter Jawaban */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase block">Nilai Ulangan (PG)</span>
                    <span className="text-xl font-black text-indigo-700">
                      {viewingStudentAnswer.item.score !== undefined ? viewingStudentAnswer.item.score : '-'}
                      <span className="text-xs text-indigo-400 font-normal"> / 100</span>
                    </span>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Status KKM</span>
                    <span className={`text-xs font-black ${viewingStudentAnswer.item.isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {viewingStudentAnswer.item.isPassed ? 'LULUS STANDAR KKM' : 'REMEDIAL'}
                    </span>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Akses Siswa</span>
                    <span className={`text-xs font-black ${viewingStudentAnswer.item.isScoreAnnounced ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {viewingStudentAnswer.item.isScoreAnnounced ? 'Diumumkan ke Siswa' : 'Menunggu Pengumuman'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setAnswerReviewFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      answerReviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setAnswerReviewFilter('mc')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      answerReviewFilter === 'mc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pilihan Ganda
                  </button>
                  <button
                    onClick={() => setAnswerReviewFilter('essay')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      answerReviewFilter === 'essay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Esai
                  </button>
                </div>
              </div>

              {/* Daftar Butir Soal & Jawaban Siswa */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
                {viewingStudentAnswer.exam && viewingStudentAnswer.exam.questions ? (
                  viewingStudentAnswer.exam.questions
                    .filter((q) => {
                      if (answerReviewFilter === 'mc') return q.type !== 'essay';
                      if (answerReviewFilter === 'essay') return q.type === 'essay';
                      return true;
                    })
                    .map((q, idx) => {
                      const studentAns = viewingStudentAnswer.item.rawAnswers?.[q.id];
                      const isEssay = q.type === 'essay';
                      const isCorrect = !isEssay && studentAns !== undefined && Number(studentAns) === Number(q.correctIndex);

                      return (
                        <div key={q.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                              Soal #{idx + 1} • {isEssay ? 'Esai / Uraian' : 'Pilihan Ganda (PG)'}
                            </span>
                            {!isEssay && (
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {isCorrect ? 'Jawaban Benar (+20)' : 'Jawaban Salah (0)'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                            {q.question}
                          </p>

                          {q.codeSnippet && (
                            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
                              <code>{q.codeSnippet}</code>
                            </pre>
                          )}

                          {isEssay ? (
                            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                              <span className="font-bold text-slate-600 block">Jawaban yang Ditulis Siswa:</span>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                                {studentAns || <span className="italic text-slate-400">(Siswa tidak mengisi jawaban esai)</span>}
                              </div>
                              {q.essayAnswerKey && (
                                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-950 space-y-0.5">
                                  <span className="font-bold text-emerald-800 block text-[11px]">Kunci Pedoman / Penjelasan Guru:</span>
                                  <p className="text-[11px] leading-relaxed">{q.essayAnswerKey}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                              {q.options?.map((opt, optIdx) => {
                                const isChosen = studentAns !== undefined && Number(studentAns) === optIdx;
                                const isKey = Number(q.correctIndex) === optIdx;

                                let borderBgClass = 'border-slate-200 bg-white text-slate-700';
                                if (isKey) {
                                  borderBgClass = 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-bold';
                                } else if (isChosen && !isKey) {
                                  borderBgClass = 'border-rose-300 bg-rose-50 text-rose-950 font-bold';
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${borderBgClass}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px]">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>

                                    {isChosen && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                                        Pilihan Siswa
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              {q.explanation && (
                                <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-950 text-[11px] mt-2">
                                  <strong>Pembahasan:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Tidak ada butir soal yang dapat ditampilkan untuk ulangan ini.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {viewingStudentAnswer.item.studentName} ({viewingStudentAnswer.item.studentClass})
                </span>
                <button
                  type="button"
                  onClick={() => setViewingStudentAnswer(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Tutup Lembar Jawaban
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PRATINJAU CETAK DOKUMEN REKAP NILAI RESMI UNTUK GURU */}
        {showPrintModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-slate-100 rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              {/* Toolbar Kontrol Cetak */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5" />
                      Format Dokumen Cetak A4
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Pratinjau PDF & Hardcopy
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Pratinjau Cetak / Unduh Dokumen PDF Rekap Nilai Siswa
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
                    <span className="text-[11px] font-bold text-slate-500 pl-2">Rombel:</span>
                    <select
                      value={printClassFilter}
                      onChange={(e) => setPrintClassFilter(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Semua Rombel ({allTeacherRecapRows.length})</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
                    <span className="text-[11px] font-bold text-slate-500 pl-2">Jenis:</span>
                    <select
                      value={printCategoryFilter}
                      onChange={(e) => setPrintCategoryFilter(e.target.value as any)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="exam">Ulangan CBT Saja</option>
                      <option value="task">Tugas Harian</option>
                      <option value="assessment">Asesmen</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 pl-1" />
                    <span className="text-[11px] font-bold text-slate-500">Lokasi:</span>
                    <input
                      type="text"
                      value={printLocation}
                      onChange={(e) => {
                        setPrintLocation(e.target.value);
                        setManualPrintLocation(e.target.value);
                      }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 w-28"
                      title="Ubah lokasi pencetakan"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTeacherRecapPdf}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm shadow-emerald-200 cursor-pointer"
                    title="Unduh langsung berkas dokumen PDF resmi (.pdf)"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cetak / Unduh PDF (.pdf)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Area Kertas Simulasi A4 */}
              <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-300/80 flex justify-center">
                <div
                  id="printable-official-recap"
                  className="bg-white w-full max-w-[850px] min-h-[1100px] p-8 sm:p-12 shadow-2xl border border-slate-300 text-black text-xs space-y-4 rounded-xs"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  {/* 1. KOP SURAT RESMI SMK CITRA NEGARA */}
                  <div className="border-b-[3px] border-black pb-2 text-center">
                    <div className="border-b border-black pb-1 mb-1">
                      <h3 className="font-bold text-sm tracking-wide uppercase m-0 leading-tight">
                        PEMERINTAH DAERAH PROVINSI JAWA BARAT
                      </h3>
                      <h2 className="font-black text-base tracking-wider uppercase m-0 leading-tight">
                        DINAS PENDIDIKAN CABANG DINAS WILAYAH VII
                      </h2>
                      <h1 className="font-black text-xl tracking-wide uppercase m-0 leading-tight mt-1 text-slate-900">
                        SMK CITRA NEGARA KOTA DEPOK
                      </h1>
                      <p className="text-[11px] font-medium text-slate-800 m-0 mt-1">
                        Kompetensi Keahlian: Rekayasa Perangkat Lunak & Gim (PPLG) • Teknik Komputer & Jaringan (TJKT) • DKV • MPLB • Akuntansi
                      </p>
                      <p className="text-[10px] text-slate-600 m-0">
                        Jl. Tanah Baru No. 100, Beji, Kota Depok, Jawa Barat 16421 | Telp: (021) 7721-3344
                      </p>
                      <p className="text-[10px] text-slate-600 m-0">
                        NPSN: 20268845 | NSS: 402026501099 | Website: www.smkcitranegara.sch.id | Email: info@smkcitranegara.sch.id
                      </p>
                    </div>
                  </div>

                  {/* 2. JUDUL DOKUMEN */}
                  <div className="text-center pt-1 pb-1">
                    <h3 className="font-bold text-base uppercase tracking-wide underline underline-offset-4 m-0">
                      LEMBAR REKAPITULASI NILAI & CAPAIAN KOMPETENSI SISWA
                    </h3>
                    <p className="text-xs italic text-slate-700 mt-1 font-semibold">
                      Tahun Ajaran 2025/2026 — Semester Ganjil
                    </p>
                  </div>

                  {/* 3. METADATA INFORMASI */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border border-slate-300 p-2.5 bg-slate-50/60 rounded">
                    <div className="space-y-0.5">
                      <div>
                        <span className="font-bold inline-block w-36">Satuan Pendidikan</span>
                        <span>: SMK CITRA NEGARA</span>
                      </div>
                      <div>
                        <span className="font-bold inline-block w-36">Rombel / Kelas</span>
                        <span>: <strong>{printClassFilter === 'all' ? 'Seluruh Rombel Terdata' : printClassFilter}</strong></span>
                      </div>
                      <div>
                        <span className="font-bold inline-block w-36">Program Keahlian</span>
                        <span>: Pengembangan Perangkat Lunak & Gim (PPLG)</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div>
                        <span className="font-bold inline-block w-36">Guru Pengampu</span>
                        <span>: <strong>{currentUser.name}</strong></span>
                      </div>
                      <div>
                        <span className="font-bold inline-block w-36">Standar Kelulusan (KKM)</span>
                        <span>: <strong>75</strong></span>
                      </div>
                      <div>
                        <span className="font-bold inline-block w-36">Lokasi & Tanggal</span>
                        <span>: <strong>{printLocation}</strong>, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. STATISTIK KELAS */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs border border-black p-2 bg-slate-50">
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase">Total Data Terdata</span>
                      <strong className="text-sm font-bold">{printStats.total} Siswa</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase">Rata-rata Nilai</span>
                      <strong className="text-sm font-bold">{printStats.avg} / 100</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase">Jumlah Tuntas KKM</span>
                      <strong className="text-sm font-bold">{printStats.passed} Siswa</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase">Persentase Ketuntasan</span>
                      <strong className="text-sm font-bold">{printStats.passRate}%</strong>
                    </div>
                  </div>

                  {/* 5. TABEL NILAI SISWA RESMI */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse border border-black">
                      <thead>
                        <tr className="bg-slate-200/90 text-black font-bold border-b border-black text-[10px]">
                          <th className="border border-black py-1.5 px-2 text-center w-8">No</th>
                          <th className="border border-black py-1.5 px-2 text-center w-24">NIS / NISN</th>
                          <th className="border border-black py-1.5 px-2">Nama Lengkap Siswa</th>
                          <th className="border border-black py-1.5 px-2 text-center w-20">Kelas</th>
                          <th className="border border-black py-1.5 px-2">Mata Pelajaran</th>
                          <th className="border border-black py-1.5 px-2">Judul Evaluasi / Ulangan</th>
                          <th className="border border-black py-1.5 px-2 text-center w-12">KKM</th>
                          <th className="border border-black py-1.5 px-2 text-center w-14">Nilai</th>
                          <th className="border border-black py-1.5 px-2 text-center w-20">Status KKM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black text-[10px]">
                        {rowsToPrint.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="border border-black py-6 text-center text-slate-500 italic">
                              Tidak ada data nilai siswa untuk filter rombel dan kategori ini.
                            </td>
                          </tr>
                        ) : (
                          rowsToPrint.map((row, idx) => (
                            <tr key={row.id} className="border-b border-black/80">
                              <td className="border border-black py-1 px-2 text-center font-bold">{idx + 1}</td>
                              <td className="border border-black py-1 px-2 text-center font-mono">
                                {getStudentNis(row.studentId, row.studentName)}
                              </td>
                              <td className="border border-black py-1 px-2 font-bold">{row.studentName}</td>
                              <td className="border border-black py-1 px-2 text-center">{row.studentClass}</td>
                              <td className="border border-black py-1 px-2">{row.subject}</td>
                              <td className="border border-black py-1 px-2">{row.title}</td>
                              <td className="border border-black py-1 px-2 text-center">{row.passingScore || 75}</td>
                              <td className="border border-black py-1 px-2 text-center font-bold text-xs">
                                {row.score !== undefined ? row.score : '-'}
                              </td>
                              <td className="border border-black py-1 px-2 text-center font-bold">
                                {row.isPassed !== undefined
                                  ? row.isPassed
                                    ? 'LULUS'
                                    : 'REMEDIAL'
                                  : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 6. LEMBAR PENGESAHAN & TANDA TANGAN 3 PIHAK: KEPALA SEKOLAH, KURIKULUM, GURU */}
                  {(() => {
                    const sigs = getSignatoriesInfo(currentUser, printLocation);
                    return (
                      <div className="pt-4 page-break-inside-avoid">
                        <table className="w-full text-xs text-center border-none">
                          <tbody>
                            <tr>
                              <td className="w-1/3 align-top pb-1 border-none">
                                <p className="m-0 text-slate-700">Mengetahui,</p>
                                <p className="m-0 font-bold">{sigs.kepsek.roleLabel}</p>
                                <div className="h-16" />
                                <p className="m-0 font-bold underline text-sm">{sigs.kepsek.name}</p>
                                <p className="m-0 text-[11px] text-slate-600">NIP. {sigs.kepsek.nip}</p>
                              </td>
                              <td className="w-1/3 align-top pb-1 border-none">
                                <p className="m-0 text-slate-700">Menyetujui / Memeriksa,</p>
                                <p className="m-0 font-bold">{sigs.kurikulum.roleLabel}</p>
                                <div className="h-16" />
                                <p className="m-0 font-bold underline text-sm">{sigs.kurikulum.name}</p>
                                <p className="m-0 text-[11px] text-slate-600">NIP. {sigs.kurikulum.nip}</p>
                              </td>
                              <td className="w-1/3 align-top pb-1 border-none">
                                <p className="m-0 text-slate-700">
                                  {sigs.printLocation}, {sigs.printDateIndo}
                                </p>
                                <p className="m-0 font-bold">{sigs.guru.roleLabel}</p>
                                <div className="h-16" />
                                <p className="m-0 font-bold underline text-sm">{sigs.guru.name}</p>
                                <p className="m-0 text-[11px] text-slate-600">NIP/ID. {sigs.guru.nip}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Siap dicetak: <strong>{rowsToPrint.length}</strong> data nilai siswa
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Batal / Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTeacherRecapPdf}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm shadow-emerald-200 cursor-pointer"
                    title="Unduh langsung lembar rekap PDF resmi"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cetak / Unduh Dokumen PDF (.pdf)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER UNTUK MODE SISWA (RIWAYAT PRIBADI)
  // ==========================================
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
                Rekapitulasi berkas tugas, ulangan CBT, kuis interaktif, dan asesmen yang telah diserahkan oleh{' '}
                <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.class || 'XII PPLG 2'}).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Cetak Rekapitulasi */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecuteStudentPrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
            title="Cetak Transkrip Riwayat Pengerjaan Siswa (PDF)"
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
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{studentStats.totalSubmitted}</span>
            <span className="text-xs font-bold text-slate-400">Berkas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Tugas, CBT & Kuis</p>
        </div>

        {/* Sudah Diumumkan / Dinilai */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Nilai Terbit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{studentStats.gradedCount}</span>
            <span className="text-xs font-bold text-slate-400">Tuntas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Diumumkan oleh guru</p>
        </div>

        {/* Rata-Rata Nilai */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rata-Rata Nilai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{studentStats.avgScore}</span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Dari tugas yang diumumkan</p>
        </div>

        {/* Menunggu Pengumuman Nilai */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Menunggu Pengumuman</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">{studentStats.pendingAnnouncementCount}</span>
            <span className="text-xs font-bold text-slate-400">Ujian/Tugas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Terkirim ke server</p>
        </div>
      </div>

      {/* Filter Toolbar untuk Siswa */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStudentCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studentCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Semua Evaluasi</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${studentCategory === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {studentHistoryItems.length}
            </span>
          </button>

          <button
            onClick={() => setStudentCategory('exam')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studentCategory === 'exam'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Ulangan CBT (PG)</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${studentCategory === 'exam' ? 'bg-rose-700 text-white' : 'bg-rose-200/80 text-rose-900'}`}>
              {studentHistoryItems.filter((i) => i.type === 'exam').length}
            </span>
          </button>

          <button
            onClick={() => setStudentCategory('task')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studentCategory === 'task'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tugas Harian</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${studentCategory === 'task' ? 'bg-indigo-700 text-white' : 'bg-indigo-200/80 text-indigo-900'}`}>
              {studentHistoryItems.filter((i) => i.type === 'task').length}
            </span>
          </button>

          <button
            onClick={() => setStudentCategory('quiz')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              studentCategory === 'quiz'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kuis Interaktif</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${studentCategory === 'quiz' ? 'bg-amber-700 text-white' : 'bg-amber-200/80 text-amber-900'}`}>
              {studentHistoryItems.filter((i) => i.type === 'quiz').length}
            </span>
          </button>
        </div>

        {/* Search & Secondary Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul tugas, ulangan, atau mapel..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={studentSubjectFilter}
              onChange={(e) => setStudentSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="graded">Nilai Sudah Terbit</option>
              <option value="submitted">Menunggu Pengumuman Nilai</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Kartu Riwayat Pengerjaan Siswa */}
      <div className="space-y-3">
        {filteredStudentItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Belum Ada Riwayat yang Sesuai</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan data pengumpulan untuk kategori atau kata kunci pencarian tersebut.
            </p>
            <button
              onClick={() => {
                setStudentCategory('all');
                setStudentSearchQuery('');
                setStudentSubjectFilter('all');
                setStudentStatusFilter('all');
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          filteredStudentItems.map((item) => {
            const isAnnounced = item.isScoreAnnounced === true;
            const hasScore = isAnnounced && item.score !== undefined;
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

                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.subject}
                      </span>

                      {/* STATUS PENILAIAN SISWA: JIKA BELUM DIBERI AKSES GURU, TAMPILKAN STATUS MENUNGGU PENGUMUMAN */}
                      {!isAnnounced ? (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          tugas terkirim menunggu guru mengumumkan nilai
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
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
                    {!isAnnounced ? (
                      <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-center">
                        <span className="text-xs font-extrabold text-amber-800 block">Tugas Terkirim</span>
                        <span className="text-[10px] text-amber-600 font-medium">Menunggu guru mengumumkan nilai</span>
                      </div>
                    ) : hasScore ? (
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
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Lihat Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL RINCIAN TUGAS / ULANGAN SISWA */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedDetailItem.typeLabel}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedDetailItem.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Mata Pelajaran: <strong className="text-slate-700">{selectedDetailItem.subject}</strong> | Pendidik: <strong className="text-slate-700">{selectedDetailItem.teacher || 'Guru Pengampu'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* HASIL / NILAI BOX: STATUS & PEROLEHAN NILAI */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Status & Perolehan Nilai:</span>
                <div className="flex items-baseline gap-1 mt-1">
                  {/* SEBELUM GURU MEMBERIKAN AKSES: MASIH TUGAS TERKIRIM MENUNGGU GURU MENGUMUMKAN NILAI */}
                  {selectedDetailItem.isScoreAnnounced === false ? (
                    <span className="text-xs font-black text-amber-800 bg-amber-100/90 border border-amber-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      tugas terkirim menunggu guru mengumumkan nilai
                    </span>
                  ) : selectedDetailItem.score !== undefined ? (
                    <>
                      <span className="text-2xl font-black text-emerald-600">
                        {selectedDetailItem.score}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        / {selectedDetailItem.maxScore}
                      </span>
                      <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                        selectedDetailItem.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedDetailItem.isPassed ? 'LULUS STANDAR KKM' : 'PERLU REMEDIAL'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-black text-amber-800 bg-amber-100/90 border border-amber-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      tugas terkirim menunggu guru mengumumkan nilai
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 font-bold block">Waktu Diserahkan:</span>
                <span className="text-xs font-extrabold text-slate-700">
                  {selectedDetailItem.submittedAt}
                </span>
              </div>
            </div>

            {/* Umpan Balik Guru jika sudah diumumkan */}
            {selectedDetailItem.isScoreAnnounced && (selectedDetailItem.feedback || selectedDetailItem.teacherNotes) && (
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
                  <span>Informasi Ujian Online CBT:</span>
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

                {!selectedDetailItem.isScoreAnnounced && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    💡 Lembar jawaban telah tersimpan di server. Hasil skor dan evaluasi ulangan akan ditampilkan di sini setelah guru pengampu mengumumkan nilai.
                  </div>
                )}
              </div>
            )}

            {/* Bukti Pengumpulan Siswa */}
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
