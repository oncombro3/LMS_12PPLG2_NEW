import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  PlusCircle,
  Users,
  Shield,
  Eye,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Lock,
  Trash2,
  FileText,
  CheckSquare,
  BarChart2,
  Calendar,
  X,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  Megaphone,
  Filter,
  Download,
  Printer,
  MapPin
} from 'lucide-react';
import { User, OnlineExam, ExamQuestion, UserRole, ExamResult, Subject, ClassRoom } from '../types';
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
import {
  getDeadlineStatus,
  getDefaultDateTimeInput,
  formatDateTimeInputToIndo,
} from '../utils/deadline';

interface OnlineExamViewProps {
  exams: OnlineExam[];
  userRole: UserRole;
  subjects?: Subject[];
  classes?: ClassRoom[];
  currentUser?: User;
  currentStudentId: string;
  currentStudentName: string;
  currentStudentClass: string;
  onCreateExam: (examData: Partial<OnlineExam>) => Promise<void>;
  onDeleteExam?: (examId: string) => Promise<void> | void;
  onUpdateExam?: (examId: string, updates: Partial<OnlineExam>) => Promise<void> | void;
  onSubmitExam: (
    examId: string,
    answers: { [key: string]: number | string },
    violationsCount: number,
    flagged: string[]
  ) => Promise<any>;
}

export const OnlineExamView: React.FC<OnlineExamViewProps> = ({
  exams,
  userRole,
  subjects = [],
  classes = [],
  currentUser,
  currentStudentId,
  currentStudentName,
  currentStudentClass,
  onCreateExam,
  onDeleteExam,
  onUpdateExam,
  onSubmitExam,
}) => {
  // Navigation & Active Test States
  const [selectedExam, setSelectedExam] = useState<OnlineExam | null>(null);
  const [inTestRoom, setInTestRoom] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [examToUnlock, setExamToUnlock] = useState<OnlineExam | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);

  // Reactivate Exam States for Teacher
  const [reactivatingExam, setReactivatingExam] = useState<OnlineExam | null>(null);
  const [reactivateEndDateInput, setReactivateEndDateInput] = useState(() => getDefaultDateTimeInput(1, 23, 59));
  const [reactivateToken, setReactivateToken] = useState('');
  const [reactivateAllowRetake, setReactivateAllowRetake] = useState(true);
  const [isSubmittingReactivate, setIsSubmittingReactivate] = useState(false);
  const [examActionMessage, setExamActionMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  // Live Exam Test Session States (For Students)
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number | string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [violationsCount, setViolationsCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<ExamResult | null>(null);

  // Teacher Modals: Question Bank Viewer & Student Results Monitor
  const [viewingQuestionsExam, setViewingQuestionsExam] = useState<OnlineExam | null>(null);
  const [viewingResultsExam, setViewingResultsExam] = useState<OnlineExam | null>(null);
  const [selectedStudentResult, setSelectedStudentResult] = useState<{ result: ExamResult; exam: OnlineExam } | null>(null);
  const [studentAnswerFilter, setStudentAnswerFilter] = useState<'all' | 'pg' | 'essay' | 'incorrect'>('all');

  // Teacher Recap: Pemisahan Kelas & Export Excel
  const [resultsClassFilter, setResultsClassFilter] = useState<string>('all');
  const [groupByClass, setGroupByClass] = useState<boolean>(true);
  const [showOverallRecapModal, setShowOverallRecapModal] = useState<boolean>(false);
  const [overallRecapExamFilter, setOverallRecapExamFilter] = useState<string>('all');
  const [overallRecapClassFilter, setOverallRecapClassFilter] = useState<string>('all');

  // Lokasi Pencetakan Rekap Ujian Dinamis
  const [printLocation, setPrintLocation] = useState<string>(getCachedPrintLocation());

  useEffect(() => {
    detectPrintLocation().then((loc) => {
      if (loc) setPrintLocation(loc);
    });
  }, []);

  // Teacher Create Exam Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Pemrograman Web (PWPB)');
  const [newExamType, setNewExamType] = useState<any>('Ulangan Harian');
  const [newTargetClass, setNewTargetClass] = useState('12 PPLG 2');
  const [newToken, setNewToken] = useState('PPLG26');
  const [newDuration, setNewDuration] = useState(45);
  const [newPassingScore, setNewPassingScore] = useState(78);
  const [newEndDateTime, setNewEndDateTime] = useState(() => getDefaultDateTimeInput(1, 9, 0));

  // Questions builder inside create modal (Supports both PG and Esai)
  const [newQuestions, setNewQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q-builder-1',
      number: 1,
      type: 'multiple_choice',
      question: 'Manakah perintah MongoDB untuk membuat indeks pencarian data?',
      options: ['db.collection.createIndex()', 'db.collection.addKey()', 'db.collection.setIndex()', 'db.collection.format()'],
      correctIndex: 0,
      scoreWeight: 50,
      explanation: 'createIndex() digunakan untuk mengindeks atribut field di MongoDB.',
    },
    {
      id: 'q-builder-2',
      number: 2,
      type: 'essay',
      question: 'Jelaskan perbedaan utama antara routing express.Router() dan routing langsung pada instance express() app!',
      essayAnswerKey: 'express.Router() merupakan middleware routing modular yang dapat dipisahkan ke file berbeda, sedangkan app.get/post terpusat di server.',
      scoreWeight: 50,
      explanation: 'Router modular membuat arsitektur kode Express lebih rapi dan terisolasi per resource endpoint.',
    },
  ]);

  // Form states for adding a question to the builder
  const [qTypeToAdd, setQTypeToAdd] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [qTextToAdd, setQTextToAdd] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qEssayKey, setQEssayKey] = useState('');
  const [qScoreWeight, setQScoreWeight] = useState(25);
  const [qExplanation, setQExplanation] = useState('');

  // Anti-Cheat Window Blur / Tab Switch Tracker (Student only)
  useEffect(() => {
    if (!inTestRoom || !selectedExam?.antiCheat.lockdownFullscreen || userRole !== 'student') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationsCount((prev) => {
          const nextVal = prev + 1;
          setShowViolationWarning(true);
          return nextVal;
        });
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [inTestRoom, selectedExam, userRole]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!inTestRoom || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inTestRoom, timeLeftSeconds]);

  const handleStartExamFlow = (exam: OnlineExam) => {
    if (userRole !== 'student') return; // Teachers do not take exams!
    const deadlineInfo = getDeadlineStatus(exam.endDate);
    if (deadlineInfo.isExpired) {
      alert(`Batas waktu ulangan online telah berakhir (${deadlineInfo.formatted}). Ujian ini telah ditutup oleh sistem.`);
      return;
    }
    setExamToUnlock(exam);
    setTokenInput('');
    setTokenError('');
    setShowTokenModal(true);
  };

  const handleVerifyTokenAndStart = () => {
    if (!examToUnlock) return;
    const deadlineInfo = getDeadlineStatus(examToUnlock.endDate);
    if (deadlineInfo.isExpired) {
      setTokenError(`Batas waktu ulangan telah berakhir (${deadlineInfo.formatted}). Ujian telah ditutup.`);
      return;
    }

    if (tokenInput.trim().toUpperCase() !== examToUnlock.token.toUpperCase()) {
      setTokenError(`Token salah! Gunakan token pengawas: ${examToUnlock.token}`);
      return;
    }

    setSelectedExam(examToUnlock);
    setShowTokenModal(false);
    setExamToUnlock(null);
    setCurrentQIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setViolationsCount(0);
    setTimeLeftSeconds(examToUnlock.durationMinutes * 60);
    setInTestRoom(true);
  };

  const handleDelete = async (examId: string) => {
    if (!onDeleteExam) return;
    try {
      await onDeleteExam(examId);
      if (selectedExam?.id === examId) {
        setSelectedExam(null);
      }
      setDeletingExamId(null);
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleAutoSubmit = async () => {
    if (!selectedExam || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await onSubmitExam(selectedExam.id, answers, violationsCount, flaggedQuestions);
      const mcQuestions = (selectedExam.questions || []).filter(
        (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
      );
      let correct = 0;
      mcQuestions.forEach((q) => {
        if (answers[q.id] !== undefined && Number(answers[q.id]) === Number(q.correctIndex)) {
          correct++;
        }
      });
      const calcScore = mcQuestions.length > 0 ? Math.round((correct / mcQuestions.length) * 100) : 100;

      setTestResult(
        res || {
          studentId: currentStudentId,
          studentName: currentStudentName,
          studentClass: currentStudentClass,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          answers,
          flaggedQuestions,
          score: calcScore,
          maxScore: 100,
          isPassed: calcScore >= (selectedExam.passingScore || 75),
          violationsCount,
        }
      );
      setInTestRoom(false);
    } catch (err) {
      console.error(err);
      setInTestRoom(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAnnounceScore = async (exam: OnlineExam) => {
    const nextState = !exam.isScoreAnnounced;
    if (onUpdateExam) {
      await onUpdateExam(exam.id, { isScoreAnnounced: nextState });
    }
    if (viewingResultsExam && viewingResultsExam.id === exam.id) {
      setViewingResultsExam({ ...viewingResultsExam, isScoreAnnounced: nextState });
    }
    setExamActionMessage({
      type: 'success',
      title: nextState ? 'Akses Nilai Diumumkan' : 'Akses Nilai Dirahasiakan Kembali',
      description: nextState
        ? `Nilai ulangan "${exam.title}" sekarang sudah dapat dilihat oleh siswa di menu Riwayat Nilai.`
        : `Nilai ulangan "${exam.title}" ditutup kembali. Di akun siswa tampil: "tugas terkirim menunggu guru mengumumkan nilai".`,
    });
  };

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

  const handleExportExamResultsToExcel = (exam: OnlineExam, targetClassFilter: string = 'all') => {
    const mcQuestions = (exam.questions || []).filter(
      (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
    );
    const essayCount = (exam.questions || []).filter((q) => q.type === 'essay').length;

    let resultsToExport = exam.results || [];
    if (targetClassFilter !== 'all') {
      resultsToExport = resultsToExport.filter(
        (r) => (r.studentClass || '').trim().toLowerCase() === targetClassFilter.trim().toLowerCase()
      );
    }

    if (resultsToExport.length === 0) {
      alert('Tidak ada data nilai siswa untuk diekspor pada filter kelas ini.');
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

    const dataRows = resultsToExport.map((res) => {
      let correctCount = 0;
      mcQuestions.forEach((q) => {
        if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });
      const displayScore = mcQuestions.length > 0
        ? Math.round((correctCount / mcQuestions.length) * 100)
        : (res.score ?? 100);
      const isPassed = displayScore >= (exam.passingScore || 75);
      const nisValue = getStudentNis(res.studentId, res.studentName);

      return [
        nisValue,
        res.studentId || '-',
        res.studentName || '-',
        res.studentClass || exam.targetClass || '-',
        exam.subject,
        exam.title,
        exam.code,
        exam.passingScore || 75,
        displayScore,
        isPassed ? 'LULUS KKM' : 'REMEDIAL',
        correctCount,
        mcQuestions.length,
        essayCount,
        res.violationsCount || 0,
        res.finishedAt || 'Selesai',
        exam.isScoreAnnounced ? 'Sudah Diumumkan' : 'Belum Diumumkan'
      ];
    });

    // Buat worksheet dan workbook Excel (.xlsx) murni data tabel (hanya header Gambar 1 dan isi data siswa)
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
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');

    const safeTitle = exam.title.replace(/[^a-zA-Z0-9]/g, '_');
    const safeClass = targetClassFilter === 'all' ? 'Semua_Kelas' : targetClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rekap_Nilai_${exam.code}_${safeClass}_${safeTitle}.xlsx`;

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
  };

  const handleExportOverallRecapToExcel = (selectedExamId: string = 'all', targetClassFilter: string = 'all') => {
    let filteredExams = exams;
    if (selectedExamId !== 'all') {
      filteredExams = exams.filter((e) => e.id === selectedExamId);
    }

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

    const allDataRows: any[][] = [];

    filteredExams.forEach((exam) => {
      const mcQuestions = (exam.questions || []).filter(
        (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
      );
      const essayCount = (exam.questions || []).filter((q) => q.type === 'essay').length;

      let results = exam.results || [];
      if (targetClassFilter !== 'all') {
        results = results.filter(
          (r) => (r.studentClass || '').trim().toLowerCase() === targetClassFilter.trim().toLowerCase()
        );
      }

      results.forEach((res) => {
        let correctCount = 0;
        mcQuestions.forEach((q) => {
          if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
            correctCount++;
          }
        });
        const displayScore = mcQuestions.length > 0
          ? Math.round((correctCount / mcQuestions.length) * 100)
          : (res.score ?? 100);
        const isPassed = displayScore >= (exam.passingScore || 75);
        const nisValue = getStudentNis(res.studentId, res.studentName);

        allDataRows.push([
          nisValue,
          res.studentId || '-',
          res.studentName || '-',
          res.studentClass || exam.targetClass || '-',
          exam.subject,
          exam.title,
          exam.code,
          exam.passingScore || 75,
          displayScore,
          isPassed ? 'LULUS KKM' : 'REMEDIAL',
          correctCount,
          mcQuestions.length,
          essayCount,
          res.violationsCount || 0,
          res.finishedAt || 'Selesai',
          exam.isScoreAnnounced ? 'Sudah Diumumkan' : 'Belum Diumumkan'
        ]);
      });
    });

    if (allDataRows.length === 0) {
      alert('Tidak ada data nilai siswa untuk diekspor pada pilihan filter ini.');
      return;
    }

    // Buat worksheet dan workbook Excel (.xlsx) murni data tabel (hanya header Gambar 1 dan isi data siswa)
    const wsData = [
      headers,
      ...allDataRows
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

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
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi CBT');

    const safeClass = targetClassFilter === 'all' ? 'Semua_Kelas' : targetClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rekapitulasi_Nilai_CBT_${safeClass}.xlsx`;

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
  };

  const handleExportExamResultsToPdf = (exam: OnlineExam, targetClassFilter: string = 'all') => {
    const mcQuestions = (exam.questions || []).filter(
      (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
    );
    let resultsToExport = exam.results || [];
    if (targetClassFilter !== 'all') {
      resultsToExport = resultsToExport.filter(
        (r) => (r.studentClass || '').trim().toLowerCase() === targetClassFilter.trim().toLowerCase()
      );
    }

    if (resultsToExport.length === 0) {
      alert('Tidak ada data nilai siswa untuk dicetak ke PDF pada filter kelas ini.');
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

    doc.setLineWidth(0.8);
    doc.line(14, 33, 283, 33);
    doc.setLineWidth(0.3);
    doc.line(14, 34, 283, 34);

    // 2. JUDUL DOKUMEN
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`LEMBAR REKAPITULASI HASIL ULANGAN CBT: ${exam.title.toUpperCase()}`, 148, 40, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text(`Kode Ujian: ${exam.code} • Mata Pelajaran: ${exam.subject} • KKM: ${exam.passingScore || 75}`, 148, 44, { align: 'center' });

    // 3. STATISTIK
    let totalScore = 0;
    let passedCount = 0;
    resultsToExport.forEach((res) => {
      let correctCount = 0;
      mcQuestions.forEach((q) => {
        if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });
      const score = mcQuestions.length > 0 ? Math.round((correctCount / mcQuestions.length) * 100) : (res.score ?? 100);
      totalScore += score;
      if (score >= (exam.passingScore || 75)) passedCount++;
    });

    const avgScore = resultsToExport.length > 0 ? (totalScore / resultsToExport.length).toFixed(1) : '0';
    const passRate = resultsToExport.length > 0 ? Math.round((passedCount / resultsToExport.length) * 100) : 0;
    const classLabel = targetClassFilter === 'all' ? (exam.targetClass || 'Semua Rombel') : targetClassFilter;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Rombel / Kelas : ${classLabel}`, 14, 50);
    doc.text(`Guru Pengampu  : ${exam.teacher || signatories.guru.name}`, 14, 54);
    doc.text(`Status Akses Siswa : ${exam.isScoreAnnounced ? 'Sudah Diumumkan' : 'Belum Diumumkan (Rahasia)'}`, 180, 50);
    doc.text(`Lokasi & Tanggal   : ${signatories.printLocation}, ${signatories.printDateIndo}`, 180, 54);

    doc.setFont('times', 'bold');
    doc.text(
      `Statistik: Terdata: ${resultsToExport.length} Siswa | Rata-rata: ${avgScore}/100 | Lulus KKM: ${passedCount} (${passRate}%) | Remedial: ${resultsToExport.length - passedCount} Siswa`,
      14,
      60
    );

    // 4. TABEL
    const headers = [
      ['No', 'NIS', 'ID Siswa', 'Nama Lengkap Siswa', 'Kelas / Rombel', 'Nilai (PG)', 'Status KKM', 'PG Benar', 'Tab Switch', 'Waktu Selesai']
    ];

    const body = resultsToExport.map((res, idx) => {
      let correctCount = 0;
      mcQuestions.forEach((q) => {
        if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });
      const displayScore = mcQuestions.length > 0
        ? Math.round((correctCount / mcQuestions.length) * 100)
        : (res.score ?? 100);
      const isPassed = displayScore >= (exam.passingScore || 75);
      const nisValue = getStudentNis(res.studentId, res.studentName);

      return [
        String(idx + 1),
        nisValue,
        res.studentId || '-',
        res.studentName || '-',
        res.studentClass || exam.targetClass || '-',
        String(displayScore),
        isPassed ? 'LULUS KKM' : 'REMEDIAL',
        `${correctCount} / ${mcQuestions.length}`,
        String(res.violationsCount || 0),
        res.finishedAt || 'Selesai'
      ];
    });

    const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable as any).default;
    runAutoTable(doc, {
      startY: 63,
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
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 24 },
        2: { halign: 'center', cellWidth: 20 },
        3: { cellWidth: 50 },
        4: { halign: 'center', cellWidth: 24 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 24 },
        7: { halign: 'center', cellWidth: 20 },
        8: { halign: 'center', cellWidth: 22 },
        9: { cellWidth: 35 }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw === 'LULUS KKM') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [16, 120, 60];
          } else {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

    // 5. TANDA TANGAN (3 PIHAK: KEPALA SEKOLAH, KURIKULUM, GURU)
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

    // Kolom Tengah: Waka. Bidang Kurikulum SMK CITRA NEGARA
    doc.text('Menyetujui / Memeriksa,', 148, signY, { align: 'center' });
    doc.text(signatories.kurikulum.roleLabel, 148, signY + 4, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(signatories.kurikulum.name, 148, signY + 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(`NIP. ${signatories.kurikulum.nip}`, 148, signY + 26, { align: 'center' });

    // Kolom Kanan: Lokasi Pencetak & Guru Pengampu / Yang Mencetak
    doc.text(`${signatories.printLocation}, ${signatories.printDateIndo}`, 245, signY, { align: 'center' });
    doc.text(exam.teacher || signatories.guru.roleLabel, 245, signY + 4, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(exam.teacher || signatories.guru.name, 245, signY + 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(`NIP/ID. ${signatories.guru.nip}`, 245, signY + 26, { align: 'center' });

    const safeTitle = exam.title.replace(/[^a-zA-Z0-9]/g, '_');
    const safeClass = targetClassFilter === 'all' ? 'Semua_Kelas' : targetClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Rekap_Nilai_CBT_${exam.code}_${safeClass}_${safeTitle}.pdf`);
  };

  const handleExportOverallRecapToPdf = (selectedExamId: string = 'all', targetClassFilter: string = 'all') => {
    let filteredExams = exams;
    if (selectedExamId !== 'all') {
      filteredExams = exams.filter((e) => e.id === selectedExamId);
    }

    const signatories = getSignatoriesInfo(currentUser, printLocation);
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Kop Surat Resmi SMK CITRA NEGARA
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

    doc.setLineWidth(0.8);
    doc.line(14, 33, 283, 33);
    doc.setLineWidth(0.3);
    doc.line(14, 34, 283, 34);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('LEMBAR REKAPITULASI HASIL ULANGAN CBT TERPADU (SEMUA KELAS & UJIAN)', 148, 40, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text('Tahun Ajaran 2025/2026 — Semester Ganjil', 148, 44, { align: 'center' });

    const headers = [
      ['No', 'NIS', 'ID Siswa', 'Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Judul Ulangan', 'KKM', 'Nilai', 'Status', 'Tab Switch']
    ];

    const body: string[][] = [];
    let grandTotal = 0;
    let grandPassed = 0;
    let grandScoreSum = 0;

    filteredExams.forEach((exam) => {
      const mcQuestions = (exam.questions || []).filter(
        (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
      );
      let results = exam.results || [];
      if (targetClassFilter !== 'all') {
        results = results.filter(
          (r) => (r.studentClass || '').trim().toLowerCase() === targetClassFilter.trim().toLowerCase()
        );
      }

      results.forEach((res) => {
        let correctCount = 0;
        mcQuestions.forEach((q) => {
          if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
            correctCount++;
          }
        });
        const displayScore = mcQuestions.length > 0
          ? Math.round((correctCount / mcQuestions.length) * 100)
          : (res.score ?? 100);
        const isPassed = displayScore >= (exam.passingScore || 75);
        const nisValue = getStudentNis(res.studentId, res.studentName);

        grandTotal++;
        grandScoreSum += displayScore;
        if (isPassed) grandPassed++;

        body.push([
          String(body.length + 1),
          nisValue,
          res.studentId || '-',
          res.studentName || '-',
          res.studentClass || exam.targetClass || '-',
          exam.subject,
          exam.title,
          String(exam.passingScore || 75),
          String(displayScore),
          isPassed ? 'LULUS KKM' : 'REMEDIAL',
          String(res.violationsCount || 0)
        ]);
      });
    });

    if (body.length === 0) {
      alert('Tidak ada data nilai siswa untuk dicetak ke PDF pada pilihan filter ini.');
      return;
    }

    const avgOverall = grandTotal > 0 ? (grandScoreSum / grandTotal).toFixed(1) : '0';
    const passRate = grandTotal > 0 ? Math.round((grandPassed / grandTotal) * 100) : 0;
    const classLabel = targetClassFilter === 'all' ? 'Seluruh Rombel' : targetClassFilter;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Filter Rombel: ${classLabel}`, 14, 50);
    doc.text(`Filter Ujian : ${selectedExamId === 'all' ? 'Seluruh Ulangan CBT' : 'Ujian Terpilih'}`, 14, 54);
    doc.text(`Lokasi & Tanggal : ${signatories.printLocation}, ${signatories.printDateIndo}`, 180, 50);
    doc.text(`Total Baris Nilai: ${grandTotal} Data Siswa`, 180, 54);

    doc.setFont('times', 'bold');
    doc.text(
      `Statistik: Terdata: ${grandTotal} Siswa | Rata-rata: ${avgOverall}/100 | Lulus KKM: ${grandPassed} (${passRate}%) | Remedial: ${grandTotal - grandPassed} Siswa`,
      14,
      60
    );

    const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable as any).default;
    runAutoTable(doc, {
      startY: 63,
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
        9: { halign: 'center', cellWidth: 22 },
        10: { halign: 'center', cellWidth: 18 }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 9) {
          if (data.cell.raw === 'LULUS KKM') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [16, 120, 60];
          } else {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

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

    // Kolom Tengah: Waka. Bidang Kurikulum SMK CITRA NEGARA
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

    const safeClass = targetClassFilter === 'all' ? 'Semua_Rombel' : targetClassFilter.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Rekapitulasi_Nilai_CBT_${safeClass}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleAddQuestionToBuilder = () => {
    if (!qTextToAdd.trim()) return;

    const newQ: ExamQuestion = {
      id: `q-custom-${Date.now()}`,
      number: newQuestions.length + 1,
      type: qTypeToAdd,
      question: qTextToAdd,
      scoreWeight: Number(qScoreWeight) || 25,
      explanation: qExplanation || 'Pembahasan materi terkait.',
    };

    if (qTypeToAdd === 'multiple_choice') {
      newQ.options = [qOptA || 'Pilihan A', qOptB || 'Pilihan B', qOptC || 'Pilihan C', qOptD || 'Pilihan D'];
      newQ.correctIndex = qCorrectIdx;
    } else {
      newQ.essayAnswerKey = qEssayKey;
    }

    setNewQuestions((prev) => [...prev, newQ]);
    // Reset builder form inputs
    setQTextToAdd('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQEssayKey('');
    setQExplanation('');
  };

  const handleRemoveQuestionFromBuilder = (idx: number) => {
    setNewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateNewExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newQuestions.length === 0) return;

    const formattedEndDate = formatDateTimeInputToIndo(newEndDateTime);

    await onCreateExam({
      title: newTitle,
      subject: newSubject,
      examType: newExamType,
      targetClass: newTargetClass,
      token: newToken || 'TOKEN26',
      durationMinutes: newDuration,
      passingScore: newPassingScore,
      startDate: formatDateTimeInputToIndo(new Date().toISOString()),
      endDate: formattedEndDate,
      totalQuestions: newQuestions.length,
      questions: newQuestions,
      status: 'active',
      antiCheat: {
        lockdownFullscreen: true,
        tabSwitchLimit: 3,
        shuffleQuestions: true,
        shuffleOptions: true,
      },
    });

    setShowCreateModal(false);
    setNewTitle('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- RENDER 1: ACTIVE CBT EXAM TEST ROOM (STUDENTS ONLY) ---
  if (inTestRoom && selectedExam && userRole === 'student') {
    const currentQ = selectedExam.questions[currentQIndex] || selectedExam.questions[0];
    const isFlagged = flaggedQuestions.includes(currentQ?.id);

    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Anti-Cheat Violation Warning Pop-up */}
        {showViolationWarning && (
          <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-rose-500 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Peringatan Anti-Curang!</h3>
                <p className="text-xs text-rose-600 font-bold mt-1">
                  Terdeteksi perpindahan tab atau jendela browser sebanyak {violationsCount} kali.
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Aktivitas ini dicatat di server dan dapat menyebabkan pembatalan ujian otomatis.
                </p>
              </div>
              <button
                onClick={() => setShowViolationWarning(false)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200 transition"
              >
                Saya Mengerti & Kembali ke Ujian
              </button>
            </div>
          </div>
        )}

        {/* Top Floating CBT Bar */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                {selectedExam.subject} • {selectedExam.examType}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
                {selectedExam.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-xs font-bold text-slate-300">Sisa Waktu:</div>
              <span className="font-mono text-base font-extrabold text-amber-400">
                {formatTimer(timeLeftSeconds)}
              </span>
            </div>

            {/* Anti-cheat status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Cheat Aktif</span>
            </div>

            {/* Finish Button */}
            <button
              onClick={handleAutoSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-rose-900/40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Mengirim...' : 'Selesai & Kumpulkan'}
            </button>
          </div>
        </div>

        {/* Main Test Layout: Question Area (Left) + Palette Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  Soal Nomor {currentQIndex + 1} dari {selectedExam.questions.length}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Tipe: {currentQ.type === 'essay' ? 'Esai / Uraian' : 'Pilihan Ganda'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${isFlagged ? 'text-amber-600 fill-amber-600' : ''}`} />
                {isFlagged ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu-ragu'}
              </button>
            </div>

            {/* Question Body */}
            <div className="space-y-4">
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {currentQ.question}
              </p>

              {/* Multiple Choice Options */}
              {currentQ.type !== 'essay' && currentQ.options && (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <label
                        key={idx}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }))}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm mt-0.5 leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Essay Input Box */}
              {currentQ.type === 'essay' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tuliskan Jawaban Uraian Anda:
                  </label>
                  <textarea
                    rows={6}
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                    }
                    placeholder="Tuliskan jawaban lengkap dengan analisis atau langkah-langkah di sini..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Prev / Next Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
              </button>

              <button
                type="button"
                disabled={currentQIndex === selectedExam.questions.length - 1}
                onClick={() =>
                  setCurrentQIndex((prev) => Math.min(selectedExam.questions.length - 1, prev + 1))
                }
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-indigo-100"
              >
                Soal Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Palette Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Navigasi Nomor Soal
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {selectedExam.questions.map((q, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isQFlagged = flaggedQuestions.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center border-2 ${
                      isCurrent
                        ? 'border-indigo-600 ring-2 ring-indigo-300'
                        : isQFlagged
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : isAnswered
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1.5 text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" /> Terjawab
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400 shrink-0" /> Ragu-ragu
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 shrink-0" /> Belum Dijawab
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: TEST RESULT REVIEW (FOR STUDENT AFTER COMPLETION) ---
  if (testResult && selectedExam) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Jawaban Ulangan Terkumpul!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {selectedExam.title} • {selectedExam.subject}
          </p>
        </div>

        {/* Status Card without revealing score */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-700" />
            Menunggu Koreksi & Penilaian Guru
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pt-2">
            Seluruh lembar jawaban CBT kamu (Pilihan Ganda dan Esai) telah berhasil dikumpulkan dan tersimpan di server. Nilai akan direkapitulasi dan diumumkan oleh guru pengampu mata pelajaran setelah masa koreksi selesai.
          </p>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span>Target Kelas: <strong>{selectedExam.targetClass}</strong></span>
            <span>•</span>
            <span>Standar KKM: <strong>{selectedExam.passingScore}</strong></span>
          </div>

          {testResult.violationsCount > 0 && (
            <p className="text-[11px] text-rose-600 font-semibold pt-1">
              ⚠️ Catatan Integritas: Terdeteksi {testResult.violationsCount} kali perpindahan tab selama sesi ujian.
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setTestResult(null);
            setSelectedExam(null);
          }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-200"
        >
          Kembali ke Daftar Ulangan
        </button>
      </div>
    );
  }

  // --- RENDER 3: DEFAULT EXAMS HUB & MANAGEMENT LIST ---
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              Computer-Based Test (CBT)
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              Sinkronisasi Cloud
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Portal Ulangan Online & Bank Soal CBT
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            {userRole === 'teacher'
              ? 'Kelola paket ulangan online dengan soal Pilihan Ganda (PG) dan Esai, atur token pengawas, serta pantau hasil nilai siswa.'
              : 'Sistem evaluasi ujian terintegrasi dengan timer otomatis, verifikasi token pengawas, dan pengawasan anti-cheat.'}
          </p>
        </div>

        {/* Action Button for Teacher / Kurikulum */}
        {(userRole === 'teacher' || userRole === 'kurikulum' || userRole === 'admin' || userRole === 'kepalasekolah') && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setShowOverallRecapModal(true);
                setOverallRecapExamFilter('all');
                setOverallRecapClassFilter('all');
              }}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-xs transition border border-white/20 backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow-sm"
              title="Lihat rekapitulasi nilai ulangan siswa seluruh rombel dan download format Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Rekap Nilai (Excel & Kelas)</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold rounded-2xl text-xs transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Ulangan / Bank Soal Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Notification Message Banner */}
      {examActionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
            examActionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          {examActionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-sm mb-0.5">{examActionMessage.title}</h4>
            <p className="text-[11px] leading-relaxed opacity-90">{examActionMessage.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setExamActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const myResult = exam.results?.find((r) => r.studentId === currentStudentId) || exam.myResult;
          const isDone = Boolean(myResult);
          const resultsCount = exam.results?.length || 0;
          const deadlineInfo = getDeadlineStatus(exam.endDate);

          return (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {exam.code} • {exam.examType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {deadlineInfo.isExpired ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        ● Waktu Berakhir (Ditutup)
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          exam.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {exam.status === 'active' ? '● Ujian Aktif' : 'Mendatang'}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500">{exam.subject} • Target: <strong>{exam.targetClass}</strong></p>

                {/* Deadline indicator badge */}
                <div className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-[11px] ${deadlineInfo.badgeBg} ${deadlineInfo.badgeBorder} ${deadlineInfo.badgeText}`}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Batas Akhir: <strong>{exam.endDate || 'Sesuai Jadwal'}</strong></span>
                  </div>
                  <span className="font-extrabold">{deadlineInfo.remainingText}</span>
                </div>

                {/* Exam Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Durasi: <strong>{exam.durationMinutes} Menit</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Soal: <strong>{exam.questions?.length || exam.totalQuestions} Butir</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>KKM: <strong>{exam.passingScore}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Token: <strong className="font-mono text-indigo-600">{exam.token}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action / Result Footer */}
              <div className="pt-3 border-t border-slate-100">
                {/* FOR TEACHER / ADMIN / KURIKULUM: GURU TIDAK MENGERJAKAN UJIAN */}
                {userRole === 'teacher' || userRole === 'kurikulum' || userRole === 'admin' || userRole === 'kepalasekolah' ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setViewingQuestionsExam(exam)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Soal ({exam.questions?.length || 0})
                      </button>
                      <button
                        onClick={() => setViewingResultsExam(exam)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        Nilai ({resultsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportExamResultsToExcel(exam, 'all')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Download rekap nilai ulangan ini dalam format Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportExamResultsToPdf(exam, 'all')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Download lembar rekap nilai ulangan ini dalam format PDF resmi (.pdf)"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAnnounceScore(exam)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          exam.isScoreAnnounced
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                        title={
                          exam.isScoreAnnounced
                            ? 'Nilai sudah dibuka ke siswa. Klik untuk menutup / merahasiakan kembali.'
                            : 'Nilai masih dirahasiakan (siswa melihat: "tugas terkirim menunggu guru mengumumkan nilai"). Klik untuk umumkan ke siswa.'
                        }
                      >
                        {exam.isScoreAnnounced ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Nilai Diumumkan</span>
                          </>
                        ) : (
                          <>
                            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                            <span>Umumkan Nilai</span>
                          </>
                        )}
                      </button>
                      {onUpdateExam && (
                        <button
                          type="button"
                          onClick={() => {
                            setReactivatingExam(exam);
                            setReactivateEndDateInput(getDefaultDateTimeInput(1, 23, 59));
                            setReactivateToken(exam.token || 'PPLG26');
                            setReactivateAllowRetake(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                            deadlineInfo.isExpired || exam.status !== 'active'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                          title="Aktifkan kembali ujian dengan batas waktu baru agar siswa susulan / remedial dapat mengerjakan"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{deadlineInfo.isExpired || exam.status !== 'active' ? 'Aktifkan Kembali' : 'Atur Waktu'}</span>
                        </button>
                      )}
                    </div>

                    {onDeleteExam && (
                      <button
                        type="button"
                        onClick={() => setDeletingExamId(exam.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Hapus Ulangan Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  /* FOR STUDENT: BISA MENGERJAKAN */
                  <div>
                    {isDone ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Jawaban Terkumpul
                          </span>
                        </div>

                        {/* Jika ujian aktif dan belum kadaluarsa, siswa bisa ujian ulang jika guru mengaktifkan kembali */}
                        {!deadlineInfo.isExpired && exam.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleStartExamFlow(exam)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto cursor-pointer"
                            title="Ulangan ini telah diaktifkan kembali oleh guru. Anda dapat mengerjakan ujian susulan / remedial."
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Ujian Ulang / Remedial</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                            Ujian Selesai
                          </span>
                        )}
                      </div>
                    ) : deadlineInfo.isExpired ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-0.5">
                        <div className="text-xs font-bold text-rose-800 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Ujian Ditutup (Lewat Batas Waktu)
                        </div>
                        <div className="text-[10px] text-rose-600">
                          Tenggat berakhir pada jam {exam.endDate || 'yang ditentukan'}. Hubungi guru pengampu jika memerlukan ujian susulan.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Guru: {exam.teacher}
                        </span>
                        <button
                          onClick={() => handleStartExamFlow(exam)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Mulai Ujian
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Input Token Ujian (Students Only) */}
      {showTokenModal && examToUnlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Masukkan Token Ujian</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mintalah token 5 digit kepada guru pengawas ruang.
              </p>
              <div className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mt-2 inline-block font-bold">
                Token Pengawas: {examToUnlock.token}
              </div>
            </div>

            {tokenError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
                {tokenError}
              </div>
            )}

            <div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="CONTOH: JWT99"
                className="w-full text-center font-mono text-lg font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyTokenAndStart}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-200 transition"
              >
                Verifikasi & Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL BANK SOAL (PG & ESAI) UNTUK GURU */}
      {viewingQuestionsExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                  {viewingQuestionsExam.code} • {viewingQuestionsExam.examType}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">
                  Bank Soal: {viewingQuestionsExam.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingQuestionsExam.subject} • Token: <strong>{viewingQuestionsExam.token}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingQuestionsExam(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {viewingQuestionsExam.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      Soal #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {q.type === 'essay' ? 'Esai / Uraian' : 'Pilihan Ganda (PG)'}
                      </span>
                      <span className="text-slate-500 font-bold">Bobot: {q.scoreWeight} Poin</span>
                    </div>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>

                  {q.type !== 'essay' && q.options && (
                    <div className="space-y-1.5 pl-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg font-medium ${
                            q.correctIndex === oIdx
                              ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                              : 'bg-white text-slate-600 border border-slate-100'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt} {q.correctIndex === oIdx && '✓ (Kunci Jawaban)'}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'essay' && q.essayAnswerKey && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                      <strong>Pedoman Jawaban Esai:</strong> {q.essayAnswerKey}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-2 bg-indigo-50/60 rounded-lg text-indigo-950 text-[11px]">
                      <strong>Pembahasan:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingQuestionsExam(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PANTAU & REKAP HASIL SISWA UNTUK GURU */}
      {viewingResultsExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Header Dialog */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {viewingResultsExam.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {viewingResultsExam.subject}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg mt-0.5">
                  Rekapitulasi Nilai & Monitoring CBT: {viewingResultsExam.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: <strong>{viewingResultsExam.targetClass}</strong> • Standar KKM: <strong>{viewingResultsExam.passingScore}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-500">Lokasi:</span>
                  <input
                    type="text"
                    value={printLocation}
                    onChange={(e) => {
                      setPrintLocation(e.target.value);
                      setManualPrintLocation(e.target.value);
                    }}
                    className="font-bold bg-transparent border-b border-dashed border-slate-400 focus:outline-none focus:border-indigo-600 w-24 text-slate-900 text-xs"
                    title="Lokasi pencetak dokumen (tersimpan otomatis & sinkron ke Excel/PDF)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleExportExamResultsToExcel(viewingResultsExam, resultsClassFilter)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm shadow-emerald-200 cursor-pointer"
                  title="Download lembar rekap nilai siswa dalam format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Export ke Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportExamResultsToPdf(viewingResultsExam, resultsClassFilter)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Download dan cetak lembar rekap nilai ujian ini dalam format PDF resmi"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Cetak PDF</span>
                </button>
                <button
                  onClick={() => {
                    setViewingResultsExam(null);
                    setResultsClassFilter('all');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner Status Akses Pengumuman Nilai ke Siswa */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                viewingResultsExam.isScoreAnnounced
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      viewingResultsExam.isScoreAnnounced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-extrabold text-xs">
                    Status Akses Nilai: {viewingResultsExam.isScoreAnnounced ? 'Sudah Diumumkan ke Siswa' : 'Masih Dirahasiakan (Belum Diumumkan)'}
                  </span>
                </div>
                <p className="text-[11px] opacity-85 leading-relaxed">
                  {viewingResultsExam.isScoreAnnounced
                    ? 'Siswa sudah dapat melihat perolehan skor nilai dan evaluasi mereka di menu Riwayat Nilai.'
                    : 'Pada akun siswa tampil: "tugas terkirim menunggu guru mengumumkan nilai". Siswa belum bisa melihat nilai mereka.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleAnnounceScore(viewingResultsExam)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                  viewingResultsExam.isScoreAnnounced
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                }`}
              >
                {viewingResultsExam.isScoreAnnounced ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tutup Akses Nilai</span>
                  </>
                ) : (
                  <>
                    <Megaphone className="w-3.5 h-3.5 text-white" />
                    <span>Beri Akses & Umumkan Nilai</span>
                  </>
                )}
              </button>
            </div>

            {/* Pemisahan Kelas Filter & Segregator */}
            {viewingResultsExam.results && viewingResultsExam.results.length > 0 && (() => {
              const availableClasses = Array.from(
                new Set(
                  viewingResultsExam.results
                    .map((r) => (r.studentClass || '').trim())
                    .filter(Boolean)
                )
              ).sort();

              return (
                <div className="space-y-2 pt-1 pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <span className="text-xs font-extrabold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                        <Filter className="w-3.5 h-3.5 text-indigo-500" />
                        Pemisahan Kelas:
                      </span>
                      <button
                        type="button"
                        onClick={() => setResultsClassFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                          resultsClassFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Semua Kelas ({viewingResultsExam.results.length})
                      </button>
                      {availableClasses.map((cls) => {
                        const count = viewingResultsExam.results!.filter(
                          (r) => (r.studentClass || '').trim().toLowerCase() === cls.toLowerCase()
                        ).length;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setResultsClassFilter(cls)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                              resultsClassFilter === cls
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {cls} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={groupByClass}
                        onChange={(e) => setGroupByClass(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Kelompokkan per Rombel</span>
                    </label>
                  </div>
                </div>
              );
            })()}

            {/* List Nilai Siswa (Mendukung Pengelompokan & Filter Pemisahan Kelas) */}
            {viewingResultsExam.results && viewingResultsExam.results.length > 0 ? (() => {
              const mcQuestions = (viewingResultsExam.questions || []).filter(
                (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
              );

              // Filter hasil berdasarkan kelas jika dipilih
              let filteredResults = viewingResultsExam.results;
              if (resultsClassFilter !== 'all') {
                filteredResults = filteredResults.filter(
                  (r) => (r.studentClass || '').trim().toLowerCase() === resultsClassFilter.trim().toLowerCase()
                );
              }

              if (filteredResults.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    Tidak ada siswa dari kelas "{resultsClassFilter}" yang telah menyelesaikan ulangan ini.
                  </div>
                );
              }

              // Jika mode kelompok per rombel diaktifkan dan memilih semua kelas
              if (groupByClass && resultsClassFilter === 'all') {
                const classGroups: { [className: string]: ExamResult[] } = {};
                filteredResults.forEach((res) => {
                  const cls = res.studentClass || viewingResultsExam.targetClass || 'Tanpa Kelas';
                  if (!classGroups[cls]) classGroups[cls] = [];
                  classGroups[cls].push(res);
                });

                return (
                  <div className="space-y-4">
                    {Object.keys(classGroups).sort().map((className) => {
                      const studentsInClass = classGroups[className];
                      // Hitung rata-rata dan tingkat ketuntasan kelas
                      let totalClassScore = 0;
                      let classPassedCount = 0;
                      studentsInClass.forEach((s) => {
                        let cCount = 0;
                        mcQuestions.forEach((q) => {
                          if (s.answers && s.answers[q.id] !== undefined && Number(s.answers[q.id]) === Number(q.correctIndex)) {
                            cCount++;
                          }
                        });
                        const sScore = mcQuestions.length > 0 ? Math.round((cCount / mcQuestions.length) * 100) : (s.score ?? 100);
                        totalClassScore += sScore;
                        if (sScore >= (viewingResultsExam.passingScore || 75)) classPassedCount++;
                      });
                      const classAvg = (totalClassScore / (studentsInClass.length || 1)).toFixed(1);
                      const classPassRate = Math.round((classPassedCount / (studentsInClass.length || 1)) * 100);

                      return (
                        <div key={className} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          {/* Header Kelompok Kelas */}
                          <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <span className="font-black text-slate-900 text-xs">
                                Rombel / Kelas: {className}
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                {studentsInClass.length} Siswa
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                              <span>Rata-rata: <strong className="text-indigo-700">{classAvg}</strong></span>
                              <span>•</span>
                              <span>Tuntas KKM: <strong className="text-emerald-700">{classPassedCount}/{studentsInClass.length} ({classPassRate}%)</strong></span>
                            </div>
                          </div>

                          {/* Siswa di kelas ini */}
                          <div className="divide-y divide-slate-100">
                            {studentsInClass.map((res, rIdx) => {
                              let correctCount = 0;
                              mcQuestions.forEach((q) => {
                                if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
                                  correctCount++;
                                }
                              });
                              const displayScore = mcQuestions.length > 0
                                ? Math.round((correctCount / mcQuestions.length) * 100)
                                : (res.score ?? 100);
                              const isPassed = displayScore >= (viewingResultsExam.passingScore || 75);

                              return (
                                <div key={rIdx} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                                  <div className="space-y-1">
                                    <div className="font-extrabold text-slate-900 text-sm">{res.studentName}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                      {res.finishedAt ? (isNaN(Date.parse(res.finishedAt)) ? res.finishedAt : new Date(res.finishedAt).toLocaleDateString('id-ID')) : 'Selesai'}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                                        PG Benar: {correctCount} / {mcQuestions.length} Soal
                                      </span>
                                      {res.violationsCount > 0 && (
                                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                          ⚠️ {res.violationsCount}x tab switch violation
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3.5 self-end sm:self-auto">
                                    <div className="text-right">
                                      <div className="text-xl font-black text-indigo-600">{displayScore}</div>
                                      <span
                                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {isPassed ? 'Lulus KKM' : 'Remedial'}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedStudentResult({
                                          result: { ...res, score: displayScore, isPassed },
                                          exam: viewingResultsExam,
                                        });
                                        setStudentAnswerFilter('all');
                                      }}
                                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200/80 cursor-pointer shadow-2xs shrink-0"
                                      title="Lihat seluruh lembar jawaban pilihan ganda dan esai siswa"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Lihat Jawaban</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Flat list untuk kelas yang dipilih secara spesifik
              return (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {filteredResults.map((res, rIdx) => {
                    let correctCount = 0;
                    mcQuestions.forEach((q) => {
                      if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
                        correctCount++;
                      }
                    });
                    const displayScore = mcQuestions.length > 0
                      ? Math.round((correctCount / mcQuestions.length) * 100)
                      : (res.score ?? 100);
                    const isPassed = displayScore >= (viewingResultsExam.passingScore || 75);

                    return (
                      <div key={rIdx} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-sm">{res.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Kelas: {res.studentClass || viewingResultsExam.targetClass} • {res.finishedAt ? (isNaN(Date.parse(res.finishedAt)) ? res.finishedAt : new Date(res.finishedAt).toLocaleDateString('id-ID')) : 'Selesai'}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                              PG Benar: {correctCount} / {mcQuestions.length} Soal
                            </span>
                            {res.violationsCount > 0 && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                ⚠️ {res.violationsCount}x tab switch violation
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 self-end sm:self-auto">
                          <div className="text-right">
                            <div className="text-xl font-black text-indigo-600">{displayScore}</div>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPassed ? 'Lulus KKM' : 'Remedial'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentResult({
                                result: { ...res, score: displayScore, isPassed },
                                exam: viewingResultsExam,
                              });
                              setStudentAnswerFilter('all');
                            }}
                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200/80 cursor-pointer shadow-2xs shrink-0"
                            title="Lihat seluruh lembar jawaban pilihan ganda dan esai siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Jawaban</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Belum ada siswa yang menyelesaikan ulangan online ini.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Total <strong>{viewingResultsExam.results?.length || 0}</strong> peserta telah submit
              </span>
              <button
                onClick={() => {
                  setViewingResultsExam(null);
                  setResultsClassFilter('all');
                }}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3.5: DETAIL LEMBAR JAWABAN SISWA */}
      {selectedStudentResult && (() => {
        const mcQList = selectedStudentResult.exam.questions.filter(
          (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
        );
        const essayQList = selectedStudentResult.exam.questions.filter((q) => q.type === 'essay');
        let totalCorrectMc = 0;
        mcQList.forEach((q) => {
          const ans = selectedStudentResult.result.answers ? selectedStudentResult.result.answers[q.id] : undefined;
          if (ans !== undefined && Number(ans) === Number(q.correctIndex)) {
            totalCorrectMc++;
          }
        });

        const filteredList = selectedStudentResult.exam.questions.filter((q) => {
          const isEssay = q.type === 'essay';
          if (studentAnswerFilter === 'pg') return !isEssay;
          if (studentAnswerFilter === 'essay') return isEssay;
          if (studentAnswerFilter === 'incorrect') {
            if (isEssay) return false;
            const ans = selectedStudentResult.result.answers ? selectedStudentResult.result.answers[q.id] : undefined;
            return ans === undefined || Number(ans) !== Number(q.correctIndex);
          }
          return true;
        });

        return (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {selectedStudentResult.exam.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedStudentResult.exam.subject}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Lembar Jawaban Siswa: {selectedStudentResult.result.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas: <strong className="text-slate-700">{selectedStudentResult.result.studentClass}</strong> • Ulangan: <strong className="text-slate-700">{selectedStudentResult.exam.title}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentResult(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="p-4 sm:p-5 bg-white border-b border-slate-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-center">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Nilai PG (Otomatis)</span>
                    <span className="text-2xl font-black text-indigo-700 block mt-0.5">
                      {selectedStudentResult.result.score}
                      <span className="text-xs font-normal text-indigo-500"> / 100</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 block mt-0.5">
                      {totalCorrectMc} / {mcQList.length} Soal PG Benar
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Kelulusan</span>
                    <div>
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full inline-block ${
                        selectedStudentResult.result.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedStudentResult.result.isPassed ? 'LULUS KKM' : 'REMEDIAL'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">KKM: {selectedStudentResult.exam.passingScore}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komposisi Soal</span>
                    <div className="text-xs font-extrabold text-slate-800">
                      {mcQList.length} PG • {essayQList.length} Esai
                    </div>
                    <span className="text-[10px] text-slate-500 block">Total {selectedStudentResult.exam.questions.length} Butir</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Integritas CBT</span>
                    <div className={`text-xs font-bold ${selectedStudentResult.result.violationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedStudentResult.result.violationsCount > 0
                        ? `⚠️ ${selectedStudentResult.result.violationsCount}x Pindah Tab`
                        : '✓ Tertib (0x Pindah Tab)'}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Pengawasan Anti-Cheat</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Aturan Penilaian:</strong> Nilai ulangan otomatis dihitung 100% dari jawaban Pilihan Ganda ({totalCorrectMc}/{mcQList.length} benar = Nilai {selectedStudentResult.result.score}). Jawaban esai dapat dibaca dan ditinjau langsung di bawah ini.
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Filter Soal:</span>
                  {[
                    { id: 'all', label: `Semua Soal (${selectedStudentResult.exam.questions.length})` },
                    { id: 'pg', label: `Pilihan Ganda (${mcQList.length})` },
                    { id: 'essay', label: `Esai (${essayQList.length})` },
                    { id: 'incorrect', label: `PG Salah (${mcQList.length - totalCorrectMc})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStudentAnswerFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        studentAnswerFilter === tab.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question list */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
                {filteredList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Tidak ada soal pada kategori filter ini.
                  </div>
                ) : (
                  filteredList.map((q, idx) => {
                    const studentAns = selectedStudentResult.result.answers
                      ? selectedStudentResult.result.answers[q.id]
                      : undefined;
                    const isEssay = q.type === 'essay';
                    const isCorrect = !isEssay && studentAns !== undefined && Number(studentAns) === Number(q.correctIndex);
                    const isAnswered = studentAns !== undefined && studentAns !== '';

                    return (
                      <div key={q.id || idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                              {q.number || idx + 1}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isEssay ? 'bg-purple-100 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {isEssay ? 'Soal Esai' : 'Pilihan Ganda'}
                            </span>
                          </div>

                          <div>
                            {isEssay ? (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                                Ditinjau Guru
                              </span>
                            ) : isAnswered ? (
                              isCorrect ? (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Jawaban Benar
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-rose-600" /> Jawaban Salah
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                Tidak Dijawab
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pertanyaan */}
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {q.question}
                        </p>

                        {/* Code snippet if any */}
                        {q.codeSnippet && (
                          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
                            <code>{q.codeSnippet}</code>
                          </pre>
                        )}

                        {/* Pilihan Ganda */}
                        {!isEssay && q.options && (
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isStudentPick = studentAns !== undefined && Number(studentAns) === oIdx;
                              const isCorrectKey = Number(q.correctIndex) === oIdx;

                              let optionStyle = 'border-slate-200 bg-white text-slate-700';
                              let badge = null;

                              if (isStudentPick && isCorrectKey) {
                                optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold';
                                badge = (
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Jawaban Siswa (Kunci Benar)
                                  </span>
                                );
                              } else if (isStudentPick && !isCorrectKey) {
                                optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 font-bold';
                                badge = (
                                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <XCircle className="w-3 h-3 text-rose-600" /> Jawaban Siswa (Salah)
                                  </span>
                                );
                              } else if (isCorrectKey) {
                                optionStyle = 'border-emerald-300 bg-emerald-50/40 text-emerald-900 font-semibold border-dashed';
                                badge = (
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    ✓ Kunci Jawaban Benar
                                  </span>
                                );
                              }

                              const optionLetters = ['A', 'B', 'C', 'D', 'E'];

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition ${optionStyle}`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {optionLetters[oIdx] || oIdx + 1}
                                    </span>
                                    <span className="leading-snug break-words">{opt}</span>
                                  </div>
                                  {badge}
                                </div>
                              );
                            })}

                            {q.explanation && (
                              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-600">
                                <strong className="text-slate-700">Pembahasan / Penjelasan:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Jawaban Esai */}
                        {isEssay && (
                          <div className="space-y-2 pt-1">
                            <div>
                              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                                Lembar Jawaban Siswa:
                              </span>
                              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-medium">
                                {studentAns ? (
                                  String(studentAns)
                                ) : (
                                  <span className="italic text-slate-400">(Siswa tidak mengisi jawaban esai ini)</span>
                                )}
                              </div>
                            </div>

                            {(q.essayAnswerKey || q.explanation) && (
                              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-900 space-y-1">
                                <span className="font-extrabold text-purple-800 block text-[11px]">
                                  Panduan Kunci / Pedoman Penilaian Esai Guru:
                                </span>
                                <p className="leading-relaxed whitespace-pre-wrap">
                                  {q.essayAnswerKey || q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Menampilkan {filteredList.length} dari {selectedStudentResult.exam.questions.length} butir soal
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentResult(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Tutup Lembar Jawaban
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3.7: REKAPITULASI NILAI SELURUH ULANGAN SISWA (MULTI-KELAS & EXCEL) */}
      {showOverallRecapModal && (() => {
        // Kumpulkan seluruh kelas yang ada di ujian
        const allExamClasses = Array.from(
          new Set(
            exams.flatMap((ex) => (ex.results || []).map((r) => (r.studentClass || '').trim()).concat(
              exams.map((ex) => (ex.targetClass || '').trim())
            )).filter(Boolean)
          )
        ).sort();

        // Filter ujian & kelas
        let targetExams = exams;
        if (overallRecapExamFilter !== 'all') {
          targetExams = exams.filter((e) => e.id === overallRecapExamFilter);
        }

        // Kumpulkan semua baris hasil siswa
        interface RecapRow {
          examId: string;
          examTitle: string;
          examCode: string;
          subject: string;
          passingScore: number;
          isScoreAnnounced: boolean;
          studentId: string;
          studentName: string;
          studentClass: string;
          score: number;
          isPassed: boolean;
          correctCount: number;
          totalMc: number;
          violationsCount: number;
          finishedAt: string;
        }

        const allStudentRows: RecapRow[] = [];
        targetExams.forEach((ex) => {
          const mcQuestions = (ex.questions || []).filter(
            (q) => q.type === 'multiple_choice' || (q.options && q.options.length > 0 && q.type !== 'essay')
          );
          let results = ex.results || [];
          if (overallRecapClassFilter !== 'all') {
            results = results.filter(
              (r) => (r.studentClass || '').trim().toLowerCase() === overallRecapClassFilter.trim().toLowerCase()
            );
          }

          results.forEach((res) => {
            let correctCount = 0;
            mcQuestions.forEach((q) => {
              if (res.answers && res.answers[q.id] !== undefined && Number(res.answers[q.id]) === Number(q.correctIndex)) {
                correctCount++;
              }
            });
            const displayScore = mcQuestions.length > 0
              ? Math.round((correctCount / mcQuestions.length) * 100)
              : (res.score ?? 100);
            const isPassed = displayScore >= (ex.passingScore || 75);

            allStudentRows.push({
              examId: ex.id,
              examTitle: ex.title,
              examCode: ex.code,
              subject: ex.subject,
              passingScore: ex.passingScore || 75,
              isScoreAnnounced: Boolean(ex.isScoreAnnounced),
              studentId: res.studentId,
              studentName: res.studentName,
              studentClass: res.studentClass || ex.targetClass || '12 PPLG 2',
              score: displayScore,
              isPassed,
              correctCount,
              totalMc: mcQuestions.length,
              violationsCount: res.violationsCount || 0,
              finishedAt: res.finishedAt,
            });
          });
        });

        // Hitung statistik
        const totalSubmissions = allStudentRows.length;
        const totalScoreSum = allStudentRows.reduce((acc, curr) => acc + curr.score, 0);
        const avgOverallScore = totalSubmissions > 0 ? (totalScoreSum / totalSubmissions).toFixed(1) : '0';
        const passedTotalCount = allStudentRows.filter((r) => r.isPassed).length;
        const overallPassRate = totalSubmissions > 0 ? Math.round((passedTotalCount / totalSubmissions) * 100) : 0;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              {/* Header Dialog */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Rekap Nilai Terpadu
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Pemisahan Rombel & Export Spreadsheet
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Rekapitulasi Nilai Siswa (Semua Kelas & Ulangan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Guru dapat memilah nilai berdasarkan rombel/kelas, memeriksa kelulusan KKM, dan mengunduh format Excel (.xlsx).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500">Lokasi:</span>
                    <input
                      type="text"
                      value={printLocation}
                      onChange={(e) => {
                        setPrintLocation(e.target.value);
                        setManualPrintLocation(e.target.value);
                      }}
                      className="font-bold bg-transparent border-b border-dashed border-slate-400 focus:outline-none focus:border-indigo-600 w-24 text-slate-900 text-xs"
                      title="Lokasi pencetak dokumen (tersimpan otomatis & sinkron ke Excel/PDF)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportOverallRecapToExcel(overallRecapExamFilter, overallRecapClassFilter)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm shadow-emerald-200 cursor-pointer"
                    title="Export seluruh data nilai siswa terpilih dalam format Excel (.xlsx)"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportOverallRecapToPdf(overallRecapExamFilter, overallRecapClassFilter)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
                    title="Download dan cetak dokumen rekapitulasi nilai terpilih dalam format PDF resmi"
                  >
                    <Printer className="w-4 h-4 text-emerald-300" />
                    <span>Cetak PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverallRecapModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter & Metric Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Filter Paket Ulangan */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Filter Paket Ulangan:
                    </label>
                    <select
                      value={overallRecapExamFilter}
                      onChange={(e) => setOverallRecapExamFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">Semua Ulangan ({exams.length})</option>
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title} ({ex.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Pemisahan Rombel/Kelas */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Pemisahan Rombel / Kelas:
                    </label>
                    <select
                      value={overallRecapClassFilter}
                      onChange={(e) => setOverallRecapClassFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">Semua Rombel/Kelas ({allExamClasses.length})</option>
                      {allExamClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ringkasan Skor Rata-rata */}
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Rata-rata Nilai</span>
                    <span className="text-xl font-black text-indigo-700 mt-0.5">
                      {avgOverallScore} <span className="text-[11px] text-indigo-400 font-normal">/ 100</span>
                    </span>
                  </div>

                  {/* Tingkat Tuntas KKM */}
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Tuntas KKM</span>
                    <span className="text-xl font-black text-emerald-800 mt-0.5">
                      {overallPassRate}% <span className="text-[11px] text-emerald-600 font-normal">({passedTotalCount}/{totalSubmissions})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabel Daftar Nilai Siswa */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50/50">
                {allStudentRows.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    Tidak ada data peserta ujian untuk kombinasi filter ulangan dan kelas ini.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200 text-[11px]">
                            <th className="py-3 px-3.5 w-12 text-center">No</th>
                            <th className="py-3 px-3.5">Nama Siswa</th>
                            <th className="py-3 px-3.5">Rombel / Kelas</th>
                            <th className="py-3 px-3.5">Paket Ulangan</th>
                            <th className="py-3 px-3.5 text-center">KKM</th>
                            <th className="py-3 px-3.5 text-center">Nilai CBT</th>
                            <th className="py-3 px-3.5 text-center">Status</th>
                            <th className="py-3 px-3.5">Pengumuman</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {allStudentRows.map((row, idx) => (
                            <tr key={`${row.examId}-${row.studentId}-${idx}`} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-3.5 font-bold text-slate-900">
                                <div>{row.studentName}</div>
                                {row.violationsCount > 0 && (
                                  <span className="text-[10px] text-rose-600 font-semibold block">
                                    ⚠️ {row.violationsCount}x tab switch
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 font-bold text-indigo-600">{row.studentClass}</td>
                              <td className="py-3 px-3.5">
                                <div className="font-bold text-slate-800 line-clamp-1">{row.examTitle}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{row.examCode} • {row.subject}</div>
                              </td>
                              <td className="py-3 px-3.5 text-center font-bold text-slate-500">{row.passingScore}</td>
                              <td className="py-3 px-3.5 text-center">
                                <span className="font-black text-sm text-indigo-700">{row.score}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">({row.correctCount}/{row.totalMc} PG)</span>
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    row.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.isPassed ? 'LULUS' : 'REMEDIAL'}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold inline-block ${
                                    row.isScoreAnnounced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {row.isScoreAnnounced ? '✓ Diumumkan' : '○ Dirahasiakan'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Menampilkan <strong>{allStudentRows.length}</strong> data hasil ulangan siswa
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverallRecapModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: BUAT ULANGAN BARU DENGAN DUKUNGAN SOAL PG & ESAI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  Buat Paket Ulangan Baru (PG & Esai)
                </h3>
                <p className="text-xs text-slate-500">
                  Guru dapat menyusun butir soal pilihan ganda maupun esai uraian.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewExam} className="space-y-5 text-xs">
              {/* Header Info */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Ulangan</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Ulangan Harian 2: Express & MongoDB CRUD"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      required
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                      {newSubject && !subjects.some((s) => s.name.toLowerCase() === newSubject.toLowerCase()) && (
                        <option value={newSubject}>{newSubject} (Tersimpan)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Kelas</label>
                    {classes.length > 0 ? (
                      <select
                        value={newTargetClass}
                        onChange={(e) => setNewTargetClass(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        required
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.name}>
                            {cls.name}
                          </option>
                        ))}
                        {newTargetClass && !classes.some((c) => c.name === newTargetClass) && (
                          <option value={newTargetClass}>{newTargetClass}</option>
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newTargetClass}
                        onChange={(e) => setNewTargetClass(e.target.value)}
                        placeholder="12 PPLG 2"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Evaluasi</label>
                    <select
                      value={newExamType}
                      onChange={(e) => setNewExamType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option>Ulangan Harian</option>
                      <option>Penilaian Tengah Semester (PTS)</option>
                      <option>Penilaian Akhir Semester (PAS)</option>
                      <option>Asesmen Sumatif</option>
                      <option>Ujian Sekolah (US/CBT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Token Ujian</label>
                    <input
                      type="text"
                      required
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value.toUpperCase())}
                      placeholder="PPLG26"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">KKM Kelulusan</label>
                    <input
                      type="number"
                      value={newPassingScore}
                      onChange={(e) => setNewPassingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Batas Jam Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newEndDateTime}
                      onChange={(e) => setNewEndDateTime(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl font-medium text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                      {formatDateTimeInputToIndo(newEndDateTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Bank List in Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-sm">
                    Daftar Butir Soal ({newQuestions.length} Butir)
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    Total Bobot: {newQuestions.reduce((acc, q) => acc + (q.scoreWeight || 0), 0)} Poin
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white p-2">
                  {newQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">#{idx + 1}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                            {q.type === 'essay' ? 'Esai' : 'Pilihan Ganda'}
                          </span>
                          <span className="text-slate-500 font-bold">({q.scoreWeight} Poin)</span>
                        </div>
                        <p className="text-slate-700 line-clamp-2">{q.question}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionFromBuilder(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Tambah Soal Baru (PG / Esai) */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                    + Tambah Butir Soal Baru
                  </span>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-indigo-200">
                    <button
                      type="button"
                      onClick={() => setQTypeToAdd('multiple_choice')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        qTypeToAdd === 'multiple_choice'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pilihan Ganda (PG)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQTypeToAdd('essay')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        qTypeToAdd === 'essay'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Esai / Uraian
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pertanyaan {qTypeToAdd === 'essay' ? 'Esai' : 'Pilihan Ganda'}
                  </label>
                  <textarea
                    rows={2}
                    value={qTextToAdd}
                    onChange={(e) => setQTextToAdd(e.target.value)}
                    placeholder="Tulis pertanyaan soal di sini..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                {qTypeToAdd === 'multiple_choice' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={qOptA}
                        onChange={(e) => setQOptA(e.target.value)}
                        placeholder="Pilihan A"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptB}
                        onChange={(e) => setQOptB(e.target.value)}
                        placeholder="Pilihan B"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptC}
                        onChange={(e) => setQOptC(e.target.value)}
                        placeholder="Pilihan C"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptD}
                        onChange={(e) => setQOptD(e.target.value)}
                        placeholder="Pilihan D"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-bold text-slate-700">Kunci Jawaban Benar:</span>
                      <select
                        value={qCorrectIdx}
                        onChange={(e) => setQCorrectIdx(Number(e.target.value))}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-600"
                      >
                        <option value={0}>Pilihan A</option>
                        <option value={1}>Pilihan B</option>
                        <option value={2}>Pilihan C</option>
                        <option value={3}>Pilihan D</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pedoman Jawaban / Kunci Esai
                    </label>
                    <textarea
                      rows={2}
                      value={qEssayKey}
                      onChange={(e) => setQEssayKey(e.target.value)}
                      placeholder="Pedoman penilaian / kunci jawaban esai..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bobot Skor (Poin)</label>
                    <input
                      type="number"
                      value={qScoreWeight}
                      onChange={(e) => setQScoreWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pembahasan / Catatan</label>
                    <input
                      type="text"
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      placeholder="Penjelasan ringkas..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToBuilder}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-sm"
                >
                  + Masukkan Soal ke Bank Ulangan
                </button>
              </div>

              {/* Submit & Close */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={newQuestions.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-md shadow-indigo-200"
                >
                  Simpan & Rilis Ulangan ({newQuestions.length} Soal)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS ULANGAN ONLINE */}
      {deletingExamId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Paket Ulangan?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paket ulangan online beserta bank soal dan seluruh rekap nilai siswa yang telah mengerjakan akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExamId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingExamId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AKTIFKAN KEMBALI ULANGAN ONLINE (CBT) */}
      {reactivatingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Aktifkan Kembali Ulangan
                  </h3>
                  <p className="text-xs text-slate-500">
                    {reactivatingExam.code} • {reactivatingExam.targetClass}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReactivatingExam(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Judul Ulangan:</span>
                <p className="font-bold text-slate-900 text-sm">{reactivatingExam.title}</p>
                <p className="text-slate-500 text-[11px] pt-1">
                  Batas Waktu Sebelumnya: <span className="line-through text-rose-600 font-semibold">{reactivatingExam.endDate || 'Selesai'}</span>
                </p>
              </div>

              {/* Input Batas Waktu Baru */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Tentukan Batas Waktu & Jam Berakhir Baru:
                </label>
                <input
                  type="datetime-local"
                  value={reactivateEndDateInput}
                  onChange={(e) => setReactivateEndDateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-xl font-medium outline-none text-xs text-slate-800 shadow-xs"
                  required
                />

                {/* Preset Cepat */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + 2);
                      const yr = d.getFullYear();
                      const mo = String(d.getMonth() + 1).padStart(2, '0');
                      const da = String(d.getDate()).padStart(2, '0');
                      const hr = String(d.getHours()).padStart(2, '0');
                      const mi = String(d.getMinutes()).padStart(2, '0');
                      setReactivateEndDateInput(`${yr}-${mo}-${da}T${hr}:${mi}`);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-bold text-slate-600 transition cursor-pointer"
                  >
                    +2 Jam (Hari Ini)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReactivateEndDateInput(getDefaultDateTimeInput(1, 23, 59))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-bold text-slate-600 transition cursor-pointer"
                  >
                    +1 Hari (Besok)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReactivateEndDateInput(getDefaultDateTimeInput(3, 23, 59))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-bold text-slate-600 transition cursor-pointer"
                  >
                    +3 Hari
                  </button>
                </div>

                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-900 text-[11px]">
                  Batas akhir tersimpan: <strong>{formatDateTimeInputToIndo(reactivateEndDateInput)}</strong>
                </div>
              </div>

              {/* Token Pengawas Baru / Tetap */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Token Ujian Pengawas:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomToken = Math.random().toString(36).substring(2, 8).toUpperCase();
                      setReactivateToken(randomToken);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Acak Token Baru
                  </button>
                </div>
                <input
                  type="text"
                  value={reactivateToken}
                  onChange={(e) => setReactivateToken(e.target.value.toUpperCase())}
                  placeholder="Misal: PPLG26"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-indigo-600 tracking-wider focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Siswa yang belum mengerjakan dapat langsung membuka ujian, dan siswa yang sudah selesai dapat mengambil ujian susulan/remedial.
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReactivatingExam(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingReactivate || !reactivateEndDateInput}
                onClick={async () => {
                  if (!reactivatingExam) return;
                  setIsSubmittingReactivate(true);
                  try {
                    const formatted = formatDateTimeInputToIndo(reactivateEndDateInput);
                    const token = reactivateToken.trim() || reactivatingExam.token || 'PPLG26';
                    const updates: Partial<OnlineExam> = {
                      status: 'active',
                      endDate: formatted,
                      token: token.toUpperCase(),
                    };
                    if (onUpdateExam) {
                      await onUpdateExam(reactivatingExam.id, updates);
                    }
                    setExamActionMessage({
                      type: 'success',
                      title: 'Ulangan CBT Berhasil Diaktifkan Kembali!',
                      description: `Batas waktu ulangan telah diperbarui hingga ${formatted} dengan Token: ${token.toUpperCase()}. Akses siswa telah dibuka kembali.`,
                    });
                    setReactivatingExam(null);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsSubmittingReactivate(false);
                  }
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-amber-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isSubmittingReactivate ? 'Menyimpan...' : 'Aktifkan Ulangan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
