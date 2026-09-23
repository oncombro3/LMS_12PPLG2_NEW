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
  RefreshCw
} from 'lucide-react';
import { OnlineExam, ExamQuestion, UserRole, ExamResult, Subject, ClassRoom } from '../types';
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
      setTestResult(
        res || {
          studentId: currentStudentId,
          studentName: currentStudentName,
          studentClass: currentStudentClass,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          answers,
          flaggedQuestions,
          score: 85,
          maxScore: 100,
          isPassed: true,
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
        {(userRole === 'teacher' || userRole === 'kurikulum') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold rounded-2xl text-xs transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Ulangan / Bank Soal Baru
          </button>
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
                          {myResult?.score !== undefined && (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Nilai: {myResult.score} / {exam.passingScore || 75}
                            </span>
                          )}
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

      {/* MODAL 3: PANTAU HASIL SISWA UNTUK GURU */}
      {viewingResultsExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Monitoring Hasil CBT: {viewingResultsExam.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {viewingResultsExam.targetClass} • Standar KKM: {viewingResultsExam.passingScore}
                </p>
              </div>
              <button
                onClick={() => setViewingResultsExam(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingResultsExam.results && viewingResultsExam.results.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {viewingResultsExam.results.map((res, rIdx) => (
                  <div key={rIdx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{res.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Kelas: {res.studentClass} • {res.finishedAt ? new Date(res.finishedAt).toLocaleDateString('id-ID') : 'Selesai'}
                      </div>
                      {res.violationsCount > 0 && (
                        <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                          ⚠️ {res.violationsCount}x tab switch violation
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-indigo-600">{res.score}</div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          res.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.isPassed ? 'Lulus KKM' : 'Remedial'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Belum ada siswa yang menyelesaikan ulangan online ini.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingResultsExam(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
