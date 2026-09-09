import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  RotateCcw,
  BookOpen,
  Code,
  ShieldCheck,
  PlusCircle,
  Eye,
  Trash2,
  X,
  FileText,
  Save,
  CheckSquare
} from 'lucide-react';
import { Quiz, QuizQuestion, UserRole } from '../types';
import {
  getDeadlineStatus,
  getDefaultDateTimeInput,
  formatDateTimeInputToIndo,
} from '../utils/deadline';

interface QuizCBTViewProps {
  quizzes: Quiz[];
  userRole?: UserRole;
  onCompleteQuiz: (quizId: string, score: number) => void;
  onCreateQuiz?: (quizData: Partial<Quiz>) => Promise<void> | void;
  onDeleteQuiz?: (quizId: string) => Promise<void> | void;
}

export const QuizCBTView: React.FC<QuizCBTViewProps> = ({
  quizzes,
  userRole = 'student',
  onCompleteQuiz,
  onCreateQuiz,
  onDeleteQuiz,
}) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | string }>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [expiredQuizError, setExpiredQuizError] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // Teacher Modals
  const [viewingQuizDetails, setViewingQuizDetails] = useState<Quiz | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Quiz Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('Pemrograman Web (PWPB)');
  const [newTopic, setNewTopic] = useState('REST API & Mongoose');
  const [newDifficulty, setNewDifficulty] = useState<'Mudah' | 'Menengah' | 'Sulit'>('Menengah');
  const [newDuration, setNewDuration] = useState(15);
  const [newPassingScore, setNewPassingScore] = useState(75);
  const [newEndDateTime, setNewEndDateTime] = useState(() => getDefaultDateTimeInput(1, 9, 0));

  // Question builder state (Supports both PG and Esai)
  const [builderQuestions, setBuilderQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-demo-1',
      question: 'Manakah HTTP method yang bersifat idempotent dan biasa digunakan untuk mengupdate keseluruhan resource?',
      type: 'multiple_choice',
      options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
      correctIndex: 1,
      explanation: 'PUT bersifat idempotent dan digunakan untuk mereplace resource secara utuh.',
      scoreWeight: 50,
    },
    {
      id: 'q-demo-2',
      question: 'Tuliskan dan jelaskan fungsi dari middleware CORS pada arsitektur API Express.js!',
      type: 'essay',
      essayAnswerKey: 'CORS (Cross-Origin Resource Sharing) mengizinkan browser client dari domain/port berbeda untuk mengakses API server secara aman.',
      explanation: 'Tanpa header CORS, browser modern akan memblokir request API beda origin karena Same-Origin Policy.',
      scoreWeight: 50,
    },
  ]);

  const [qTypeToAdd, setQTypeToAdd] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qEssayKey, setQEssayKey] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  // Timer logic for student test
  useEffect(() => {
    if (!activeQuiz || isSubmitted || userRole !== 'student') return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, isSubmitted, userRole]);

  const startQuiz = (quiz: Quiz) => {
    if (userRole !== 'student') return; // Teachers do not take quizzes
    const deadlineInfo = getDeadlineStatus(quiz.deadline);
    if (deadlineInfo.isExpired) {
      setExpiredQuizError(`Waktu pengerjaan kuis "${quiz.title}" telah berakhir pada ${deadlineInfo.formatted}. Sistem telah menutup akses pengerjaan.`);
      return;
    }

    setExpiredQuizError(null);
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeRemainingSeconds(quiz.durationMinutes * 60);
    setIsSubmitted(false);
    setCalculatedScore(null);
    setShowReview(false);
  };

  const handleDelete = async (quizId: string) => {
    if (!onDeleteQuiz) return;
    try {
      await onDeleteQuiz(quizId);
      setDeletingQuizId(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitExam = () => {
    if (!activeQuiz) return;

    let totalWeight = 0;
    let earnedWeight = 0;

    activeQuiz.questions.forEach((q, idx) => {
      const weight = q.scoreWeight || 10;
      totalWeight += weight;
      if (q.type === 'essay') {
        // Simple heuristic for essay completion in self-grading quiz
        if (selectedAnswers[idx] && String(selectedAnswers[idx]).trim().length > 10) {
          earnedWeight += weight;
        }
      } else {
        if (selectedAnswers[idx] === q.correctIndex) {
          earnedWeight += weight;
        }
      }
    });

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 80;
    setCalculatedScore(score);
    setIsSubmitted(true);
    onCompleteQuiz(activeQuiz.id, score);
  };

  const handleAddQuestionToQuizBuilder = () => {
    if (!qText.trim()) return;

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: qText,
      type: qTypeToAdd,
      explanation: qExplanation || 'Pembahasan materi terkait.',
      scoreWeight: 25,
    };

    if (qTypeToAdd === 'multiple_choice') {
      newQ.options = [qOptA || 'Pilihan A', qOptB || 'Pilihan B', qOptC || 'Pilihan C', qOptD || 'Pilihan D'];
      newQ.correctIndex = qCorrectIdx;
    } else {
      newQ.essayAnswerKey = qEssayKey;
    }

    setBuilderQuestions((prev) => [...prev, newQ]);
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQEssayKey('');
    setQExplanation('');
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || builderQuestions.length === 0) return;

    if (onCreateQuiz) {
      await onCreateQuiz({
        title: newTitle,
        courseTitle: newCourse,
        topic: newTopic,
        difficulty: newDifficulty,
        durationMinutes: newDuration,
        passingScore: newPassingScore,
        deadline: formatDateTimeInputToIndo(newEndDateTime),
        questions: builderQuestions,
        isCompleted: false,
      });
    }

    setShowCreateModal(false);
    setNewTitle('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- RENDER 1: ACTIVE STUDENT QUIZ TEST SESSION ---
  if (activeQuiz && userRole === 'student') {
    const currentQ: QuizQuestion = activeQuiz.questions[currentQuestionIdx];
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = activeQuiz.questions.length;

    return (
      <div className="space-y-6">
        {/* CBT Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {activeQuiz.courseTitle}
              </span>
              <span className="text-xs text-slate-400">• Mode Kuis Interaktif CBT</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">
              {activeQuiz.title}
            </h2>
          </div>

          {!isSubmitted ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-mono text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Sisa Waktu: {formatTimer(timeRemainingSeconds)}</span>
              </div>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
              >
                Selesai & Kumpulkan
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveQuiz(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              Kembali ke Daftar Kuis
            </button>
          )}
        </div>

        {/* Result Summary Screen */}
        {isSubmitted && !showReview ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-xl space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Evaluasi Kuis</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeQuiz.title}</h3>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-around">
              <div>
                <div className="text-4xl font-black text-indigo-600">{calculatedScore}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Skor Diperoleh</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <div className="text-xl font-extrabold text-slate-700">{activeQuiz.passingScore}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Standar KKM</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    (calculatedScore || 0) >= activeQuiz.passingScore
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(calculatedScore || 0) >= activeQuiz.passingScore ? 'LULUS' : 'REMEDIAL'}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowReview(true)}
                className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Review Kunci Jawaban
              </button>
              <button
                onClick={() => startQuiz(activeQuiz)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Kuis
              </button>
            </div>
          </div>
        ) : (
          /* Question View Area */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  Soal #{currentQuestionIdx + 1} dari {totalCount} ({currentQ.type === 'essay' ? 'Esai' : 'Pilihan Ganda'})
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {answeredCount} Terjawab
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              {currentQ.type !== 'essay' && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                    const isCorrect = showReview && optIdx === currentQ.correctIndex;
                    const isWrong = showReview && isSelected && !isCorrect;

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition flex items-start gap-3 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : isWrong
                            ? 'bg-rose-50 border-rose-500 text-rose-950'
                            : isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isWrong
                              ? 'bg-rose-600 text-white'
                              : isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Essay Box */}
              {currentQ.type === 'essay' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Jawaban Esai Anda:</label>
                  <textarea
                    rows={5}
                    value={(selectedAnswers[currentQuestionIdx] as string) || ''}
                    disabled={isSubmitted}
                    onChange={(e) =>
                      setSelectedAnswers((prev) => ({
                        ...prev,
                        [currentQuestionIdx]: e.target.value,
                      }))
                    }
                    placeholder="Tuliskan uraian analisis Anda di sini..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Explanation in Review Mode */}
              {showReview && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Penjelasan Kunci Jawaban:
                  </div>
                  {currentQ.type === 'essay' && currentQ.essayAnswerKey && (
                    <p className="font-semibold">Kunci Jawaban: {currentQ.essayAnswerKey}</p>
                  )}
                  <p className="text-amber-800">{currentQ.explanation}</p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
                </button>

                <button
                  disabled={currentQuestionIdx === totalCount - 1}
                  onClick={() => setCurrentQuestionIdx((prev) => Math.min(totalCount - 1, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  Soal Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Grid Navigation */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Nomor Soal
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {activeQuiz.questions.map((_, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== '';

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-10 rounded-xl text-xs font-extrabold transition flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-black'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER 2: MAIN QUIZ DASHBOARD VIEW ---
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              Evaluasi Formatif CBT
            </span>
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              Bank Soal Aktif
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Kuis & Latihan Soal Interaktif
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            {userRole === 'teacher'
              ? 'Buat dan kelola kuis formatif pilihan ganda & esai untuk menguji pemahaman konsep pemrograman siswa.'
              : 'Uji pemahaman materi koding dengan kuis berbatas waktu dan pembahasan kunci jawaban mendalam.'}
          </p>
        </div>

        {userRole === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold rounded-2xl text-xs transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Kuis Baru (PG & Esai)
          </button>
        )}
      </div>

      {/* Expired Quiz Warning Banner */}
      {expiredQuizError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-950 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-sm mb-0.5">Waktu Kuis Telah Berakhir</h4>
            <p className="opacity-90">{expiredQuizError}</p>
          </div>
          <button
            type="button"
            onClick={() => setExpiredQuizError(null)}
            className="p-1 opacity-60 hover:opacity-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => {
          const deadlineInfo = getDeadlineStatus(quiz.deadline);

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {quiz.courseTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {quiz.difficulty || 'Menengah'}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Topik: <strong>{quiz.topic}</strong>
                </p>

                {/* Deadline countdown badge */}
                <div className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${deadlineInfo.badgeBg} ${deadlineInfo.badgeBorder} ${deadlineInfo.badgeText}`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Tenggat: {quiz.deadline || 'Sesuai Jadwal'}</span>
                  </div>
                  <span className="font-extrabold shrink-0 ml-1">{deadlineInfo.remainingText}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.durationMinutes} Menit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.questions?.length || 0} Butir Soal</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {userRole === 'teacher' || userRole === 'admin' || userRole === 'kurikulum' || userRole === 'kepalasekolah' ? (
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-bold text-slate-500">KKM: {quiz.passingScore}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingQuizDetails(quiz)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Soal ({quiz.questions?.length || 0})
                      </button>
                      {onDeleteQuiz && (
                        <button
                          type="button"
                          onClick={() => setDeletingQuizId(quiz.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Hapus Kuis Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    {quiz.isCompleted ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Skor: {quiz.lastScore} / 100
                      </div>
                    ) : (
                      <div className={`text-[11px] font-medium ${deadlineInfo.isExpired ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {deadlineInfo.isExpired ? 'Waktu Berakhir' : 'Belum Dikerjakan'}
                      </div>
                    )}
                    <button
                      onClick={() => startQuiz(quiz)}
                      disabled={deadlineInfo.isExpired && !quiz.isCompleted}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                        deadlineInfo.isExpired && !quiz.isCompleted
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-100 cursor-pointer'
                      }`}
                    >
                      {quiz.isCompleted ? 'Kerjakan Ulang' : deadlineInfo.isExpired ? 'Kuis Ditutup' : 'Mulai Kuis'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: DETAIL BUTIR SOAL KUIS UNTUK GURU */}
      {viewingQuizDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                  {viewingQuizDetails.courseTitle} • {viewingQuizDetails.difficulty}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">
                  Bank Soal Kuis: {viewingQuizDetails.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Durasi: {viewingQuizDetails.durationMinutes} Menit • KKM: {viewingQuizDetails.passingScore}
                </p>
              </div>
              <button
                onClick={() => setViewingQuizDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {viewingQuizDetails.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">Soal #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {q.type === 'essay' ? 'Esai / Uraian' : 'Pilihan Ganda (PG)'}
                    </span>
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
                      <strong>Pedoman Kunci Esai:</strong> {q.essayAnswerKey}
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
                onClick={() => setViewingQuizDetails(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUAT KUIS BARU UNTUK GURU (PG & ESAI) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  Buat Kuis Baru (PG & Esai)
                </h3>
                <p className="text-xs text-slate-500">
                  Susun latihan interaktif untuk siswa dengan kombinasi soal pilihan ganda & esai.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="space-y-5 text-xs">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Kuis</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuis Cepat: TypeScript Generic & Decorator"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Topik Pembahasan</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Generic Types"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option>Mudah</option>
                      <option>Menengah</option>
                      <option>Sulit</option>
                    </select>
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
                    <label className="block font-bold text-slate-700 mb-1">KKM</label>
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
                      Batas Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newEndDateTime}
                      onChange={(e) => setNewEndDateTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Format deadline: <span className="font-bold text-indigo-600">{formatDateTimeInputToIndo(newEndDateTime)}</span>
                </div>
              </div>

              {/* Builder Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-sm">
                    Daftar Butir Soal Kuis ({builderQuestions.length} Butir)
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white p-2">
                  {builderQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">#{idx + 1}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                            {q.type === 'essay' ? 'Esai' : 'Pilihan Ganda'}
                          </span>
                        </div>
                        <p className="text-slate-700 line-clamp-2">{q.question}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBuilderQuestions((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tambah Soal Kuis */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                    + Tambah Butir Soal
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
                      Pilihan Ganda
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
                      Esai
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pertanyaan</label>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Tulis soal kuis di sini..."
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
                        placeholder="Opsi A"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptB}
                        onChange={(e) => setQOptB(e.target.value)}
                        placeholder="Opsi B"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptC}
                        onChange={(e) => setQOptC(e.target.value)}
                        placeholder="Opsi C"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        value={qOptD}
                        onChange={(e) => setQOptD(e.target.value)}
                        placeholder="Opsi D"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-bold text-slate-700">Kunci Jawaban:</span>
                      <select
                        value={qCorrectIdx}
                        onChange={(e) => setQCorrectIdx(Number(e.target.value))}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-600"
                      >
                        <option value={0}>Opsi A</option>
                        <option value={1}>Opsi B</option>
                        <option value={2}>Opsi C</option>
                        <option value={3}>Opsi D</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pedoman Kunci Jawaban Esai</label>
                    <textarea
                      rows={2}
                      value={qEssayKey}
                      onChange={(e) => setQEssayKey(e.target.value)}
                      placeholder="Pedoman jawaban esai..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pembahasan Soal</label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Pembahasan untuk review siswa..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToQuizBuilder}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-sm"
                >
                  + Masukkan Soal ke Kuis
                </button>
              </div>

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
                  disabled={builderQuestions.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-md shadow-indigo-200"
                >
                  Simpan & Rilis Kuis ({builderQuestions.length} Soal)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS KUIS */}
      {deletingQuizId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Kuis CBT?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paket kuis CBT beserta seluruh butir soal dan rekap nilai siswa akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuizId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingQuizId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-rose-200 cursor-pointer"
              >
                Ya, Hapus Kuis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
