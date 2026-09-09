import React, { useState } from 'react';
import {
  ListTodo,
  Clock,
  Send,
  GitBranch,
  Upload,
  CheckCircle2,
  FileText,
  PlusCircle,
  Award,
  AlertCircle,
  AlertTriangle,
  Check,
  Edit,
  ExternalLink,
  MessageSquare,
  Users,
  Eye,
  Trash2,
  Calendar,
  X
} from 'lucide-react';
import { DailyTask, UserRole } from '../types';
import {
  getDeadlineStatus,
  getDefaultDateTimeInput,
  formatDateTimeInputToIndo,
} from '../utils/deadline';

interface DailyTasksViewProps {
  tasks: DailyTask[];
  userRole: UserRole;
  currentStudentId: string;
  currentStudentName: string;
  onCreateTask: (data: Partial<DailyTask>) => Promise<void>;
  onSubmitTask: (
    taskId: string,
    payload: { workContent?: string; githubUrl?: string; attachmentUrl?: string }
  ) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void> | void;
  onGradeTask?: (
    taskId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => Promise<void> | void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  tasks,
  userRole,
  currentStudentId,
  currentStudentName,
  onCreateTask,
  onSubmitTask,
  onDeleteTask,
  onGradeTask,
}) => {
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(tasks[0] || null);
  const [workContent, setWorkContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditingExistingSubmission, setIsEditingExistingSubmission] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Status notification banner (Tugas Terkumpul / Tugas Gagal Terkirim)
  const [submissionStatusMessage, setSubmissionStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  // Grading Modal / States for Teacher
  const [gradingSubmission, setGradingSubmission] = useState<{
    studentId: string;
    studentName: string;
    workContent?: string;
    githubUrl?: string;
    currentScore?: number;
    currentFeedback?: string;
  } | null>(null);
  const [inputScore, setInputScore] = useState<number>(85);
  const [inputFeedback, setInputFeedback] = useState('');

  // New task modal fields
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Pemrograman Web (PWPB)');
  const [newTargetClass, setNewTargetClass] = useState('12 PPLG 2');
  const [newDueDateTime, setNewDueDateTime] = useState(() => getDefaultDateTimeInput(1, 9, 0)); // Besok jam 09:00
  const [newInstructions, setNewInstructions] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(100);

  const selectedDeadline = getDeadlineStatus(selectedTask?.dueDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || userRole !== 'student') return;

    // Check deadline enforcement
    if (selectedDeadline.isExpired) {
      setSubmissionStatusMessage({
        type: 'error',
        title: 'Batas Waktu Telah Berakhir',
        description: `Tenggat pengumpulan tugas ini telah melewati batas jam (${selectedDeadline.formatted}). Sistem menolak pengumpulan setelah jam deadline berakhir.`,
      });
      return;
    }

    if (!workContent.trim() && !githubUrl.trim()) {
      setSubmissionStatusMessage({
        type: 'error',
        title: 'Tugas Gagal Terkirim',
        description: 'Harap sertakan tautan repositori GitHub atau ketik catatan ringkasan pengerjaan sebelum mengirim tugas.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatusMessage(null);
    try {
      await onSubmitTask(selectedTask.id, { workContent, githubUrl });
      setSubmissionStatusMessage({
        type: 'success',
        title: 'Tugas Terkumpul Tepat Waktu!',
        description: 'Tugas kamu berhasil diserahkan ke guru pengampu sebelum batas waktu berakhir. Nilai akan muncul setelah guru memeriksa dan memberi penilaian.',
      });
      setWorkContent('');
      setGithubUrl('');
      setIsEditingExistingSubmission(false);
    } catch (err: any) {
      console.error(err);
      setSubmissionStatusMessage({
        type: 'error',
        title: 'Tugas Gagal Terkirim',
        description: err?.message || 'Terjadi gangguan pada jaringan atau server. Tugas gagal diserahkan, silakan coba kirim kembali.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedDeadline = formatDateTimeInputToIndo(newDueDateTime);

    await onCreateTask({
      title: newTitle,
      subject: newSubject,
      targetClass: newTargetClass,
      dueDate: formattedDeadline,
      instructions: newInstructions,
      maxScore: Number(newMaxScore) || 100,
      submissions: [],
    });
    setShowCreateModal(false);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleDelete = async (taskId: string) => {
    if (!onDeleteTask) return;
    try {
      await onDeleteTask(taskId);
      if (selectedTask?.id === taskId) {
        const remaining = tasks.filter((t) => t.id !== taskId);
        setSelectedTask(remaining[0] || null);
      }
      setDeletingTaskId(null);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !gradingSubmission) return;

    if (onGradeTask) {
      await onGradeTask(
        selectedTask.id,
        gradingSubmission.studentId,
        inputScore,
        inputFeedback
      );
    } else {
      // Local optimistic update
      const targetSub = selectedTask.submissions.find(
        (s) => s.studentId === gradingSubmission.studentId
      );
      if (targetSub) {
        targetSub.score = inputScore;
        targetSub.feedback = inputFeedback;
        targetSub.status = 'graded';
      }
    }
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              Manajemen Tugas Harian
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              Sinkronisasi Cloud
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Tugas Harian & Proyek Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {userRole === 'teacher'
              ? 'Buat instruksi penugasan harian, periksa repositori git siswa, dan berikan nilai serta umpan balik.'
              : 'Pengumpulan lembar kerja mandiri, repositori GitHub proyek koding, dan penilaian resmi guru.'}
          </p>
        </div>

        {(userRole === 'teacher' || userRole === 'kurikulum') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Beri Tugas Harian Baru
          </button>
        )}
      </div>

      {/* Main Task Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List (Col 1) */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Daftar Tugas Aktif ({tasks.length})
          </div>
          {tasks.map((task) => {
            const isSelected = selectedTask?.id === task.id;
            const hasSubmitted = Boolean(
              task.mySubmission ||
                task.submissions?.some((s) => s.studentId === currentStudentId)
            );
            const submissionsCount = task.submissions?.length || 0;
            const itemDeadline = getDeadlineStatus(task.dueDate);

            return (
              <div
                key={task.id}
                className={`relative group rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setSelectedTask(task)}
                  className="w-full p-4 text-left space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {task.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {userRole === 'student' ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hasSubmitted
                              ? 'bg-emerald-100 text-emerald-800'
                              : itemDeadline.isExpired
                              ? 'bg-rose-100 text-rose-800 font-extrabold'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {hasSubmitted ? '✓ Terkumpul' : itemDeadline.isExpired ? 'Ditutup' : 'Belum Kumpul'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {submissionsCount} Siswa
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                    {task.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className={itemDeadline.isExpired ? 'text-rose-600 font-bold' : ''}>
                        {task.dueDate}
                      </span>
                    </span>
                    <span className="font-bold text-slate-600 shrink-0">
                      {task.targetClass || '12 PPLG 2'}
                    </span>
                  </div>
                  {/* Deadline countdown badge */}
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className={`px-2 py-0.5 rounded-md font-bold border ${itemDeadline.badgeBg} ${itemDeadline.badgeText} ${itemDeadline.badgeBorder}`}>
                      {itemDeadline.remainingText}
                    </span>
                  </div>
                </button>

                {/* Delete Task Quick Button for Teacher/Admin */}
                {(userRole === 'teacher' || userRole === 'admin') && (
                  <button
                    type="button"
                    title="Hapus Tugas"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTaskId(task.id);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Task Detail & Submission / Grading Panel (Col 2-3) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask ? (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Task Header */}
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {selectedTask.subject}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${selectedDeadline.badgeBg} ${selectedDeadline.badgeText} ${selectedDeadline.badgeBorder}`}>
                      <Clock className="w-3 h-3" />
                      {selectedDeadline.remainingText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Maks. Skor: {selectedTask.maxScore} Poin
                    </span>
                    {(userRole === 'teacher' || userRole === 'admin') && (
                      <button
                        type="button"
                        onClick={() => setDeletingTaskId(selectedTask.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Tugas
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {selectedTask.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Guru: <strong>{selectedTask.teacher}</strong></span>
                  <span>•</span>
                  <span>Target: <strong>{selectedTask.targetClass || '12 PPLG 2'}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Batas Waktu: <strong className={selectedDeadline.isExpired ? 'text-rose-600' : 'text-slate-900'}>{selectedTask.dueDate}</strong>
                  </span>
                </div>
              </div>

              {/* Status Banner Notification */}
              {submissionStatusMessage && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
                    submissionStatusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {submissionStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-xs">
                    <h4 className="font-extrabold text-sm mb-0.5">
                      {submissionStatusMessage.title}
                    </h4>
                    <p className="opacity-90 leading-relaxed">
                      {submissionStatusMessage.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmissionStatusMessage(null)}
                    className="p-1 opacity-60 hover:opacity-100 transition rounded-lg hover:bg-black/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Petunjuk & Deskripsi Tugas:
                </div>
                <p className="leading-relaxed whitespace-pre-line">{selectedTask.instructions}</p>
              </div>

              {/* FOR TEACHER: MONITOR & GRADE SUBMISSIONS */}
              {userRole === 'teacher' || userRole === 'admin' || userRole === 'kurikulum' || userRole === 'kepalasekolah' ? (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Daftar Pengumpulan Siswa ({selectedTask.submissions?.length || 0})
                    </h3>
                  </div>

                  {selectedTask.submissions && selectedTask.submissions.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedTask.submissions.map((sub, idx) => (
                        <div
                          key={sub.studentId || idx}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{sub.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Diserahkan: {sub.submittedAt}
                              </span>
                            </div>
                            {sub.githubUrl && (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <GitBranch className="w-3 h-3" /> {sub.githubUrl}
                              </a>
                            )}
                            {sub.workContent && (
                              <p className="text-slate-600 font-mono text-[11px] line-clamp-1">
                                {sub.workContent}
                              </p>
                            )}
                            {sub.feedback && (
                              <p className="text-[11px] text-emerald-700 font-medium">
                                Catatan Guru: {sub.feedback}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {sub.status === 'graded' && sub.score !== undefined ? (
                              <div className="text-right">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl font-black text-xs">
                                  Nilai: {sub.score}
                                </span>
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xl text-[10px] font-bold">
                                Belum Dinilai
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                                setInputScore(sub.score || 85);
                                setInputFeedback(sub.feedback || '');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1 text-[11px]"
                            >
                              <Edit className="w-3 h-3" />
                              {sub.status === 'graded' && sub.score !== undefined ? 'Ubah Nilai' : 'Beri Nilai'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      Belum ada siswa yang mengumpulkan tugas ini.
                    </div>
                  )}
                </div>
              ) : (
                /* FOR STUDENT: SUBMIT HOMEWORK */
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {selectedTask.mySubmission && !isEditingExistingSubmission ? (
                    <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-slate-50 rounded-2xl border border-emerald-200 space-y-4 shadow-xs">
                      {/* Header Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                              Tugas Terkumpul
                            </h4>
                            <span className="text-[11px] text-emerald-700">
                              Diserahkan: {selectedTask.mySubmission.submittedAt || 'Hari ini'}
                            </span>
                          </div>
                        </div>

                        {selectedTask.mySubmission.status === 'graded' && selectedTask.mySubmission.score !== undefined ? (
                          <span className="text-sm font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-xl self-start sm:self-auto">
                            Nilai: {selectedTask.mySubmission.score} / {selectedTask.maxScore}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Menunggu Penilaian Guru
                          </span>
                        )}
                      </div>

                      {/* Informational text for student */}
                      {selectedTask.mySubmission.status !== 'graded' ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                          Tugas kamu sudah berhasil disimpan di sistem. Nilai akan muncul di sini setelah guru pengampu (<strong>{selectedTask.teacher}</strong>) selesai memeriksa dan memberikan penilaian.
                        </div>
                      ) : (
                        selectedTask.mySubmission.feedback && (
                          <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                            <strong>Umpan Balik Guru:</strong> {selectedTask.mySubmission.feedback}
                          </div>
                        )
                      )}

                      {/* Submitted content details */}
                      <div className="space-y-2 text-xs">
                        {selectedTask.mySubmission.githubUrl && (
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-indigo-700">
                            <GitBranch className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-slate-500 font-sans font-bold">Repositori Git:</span>
                            <a
                              href={selectedTask.mySubmission.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline truncate text-indigo-600 font-semibold"
                            >
                              {selectedTask.mySubmission.githubUrl}
                            </a>
                          </div>
                        )}
                        {selectedTask.mySubmission.workContent && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            <div className="font-sans font-bold text-slate-500 text-[10px] uppercase mb-1">
                              Ringkasan / Kode yang Dikirim:
                            </div>
                            {selectedTask.mySubmission.workContent}
                          </div>
                        )}
                      </div>

                      {/* Edit / Resubmit button if not graded yet and NOT expired */}
                      {selectedTask.mySubmission.status !== 'graded' && (
                        <div className="flex items-center justify-between pt-1">
                          {selectedDeadline.isExpired ? (
                            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Batas pengumpulan telah berakhir. Pembaruan tugas dinonaktifkan.
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setWorkContent(selectedTask.mySubmission?.workContent || '');
                                setGithubUrl(selectedTask.mySubmission?.githubUrl || '');
                                setIsEditingExistingSubmission(true);
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-500" />
                              Perbarui / Kirim Ulang Jawaban
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : selectedDeadline.isExpired && !isEditingExistingSubmission ? (
                    /* DEADLINE EXPIRED WARNING FOR STUDENTS WHO HAVEN'T SUBMITTED */
                    <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-rose-950">
                          Batas Waktu Pengumpulan Telah Berakhir
                        </h4>
                        <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                          Tenggat tugas ini adalah <strong>{selectedTask.dueDate}</strong>. Sistem telah menutup pengumpulan karena telah melewati jam batas waktu. Anda tidak dapat mengirimkan tugas ini lagi.
                        </p>
                      </div>
                      <div className="inline-block px-3 py-1 bg-rose-200 text-rose-900 rounded-lg text-xs font-mono font-bold">
                        Status: Pengumpulan Ditutup (Expired)
                      </div>
                    </div>
                  ) : (
                    /* FORM SUBMISSION */
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          {isEditingExistingSubmission ? 'Perbarui Pengumpulan Tugas' : 'Form Pengumpulan Tugas (Siswa)'}
                        </h3>
                        {isEditingExistingSubmission && (
                          <button
                            type="button"
                            onClick={() => setIsEditingExistingSubmission(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                          >
                            Batal Edit
                          </button>
                        )}
                      </div>

                      {/* Deadline Reminder */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${selectedDeadline.badgeBg} ${selectedDeadline.badgeBorder} ${selectedDeadline.badgeText}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Tenggat: <strong>{selectedTask.dueDate}</strong></span>
                        </div>
                        <span className="font-extrabold">{selectedDeadline.remainingText}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-slate-800" /> Link Repositori GitHub Proyek
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username/tugas-express-mongo"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ketik / Paste Kode Jawaban atau Catatan Hasil Tugas
                        </label>
                        <textarea
                          rows={4}
                          value={workContent}
                          onChange={(e) => setWorkContent(e.target.value)}
                          placeholder="Tulis ringkasan hasil kerja atau kode di sini..."
                          className="w-full p-3 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || selectedDeadline.isExpired}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Mengirim Tugas...' : isEditingExistingSubmission ? 'Simpan Pembaruan Tugas' : 'Kirim Tugas Sekarang'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Pilih salah satu tugas di sebelah kiri untuk melihat detail.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: KONFIRMASI HAPUS TUGAS */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Tugas Ini?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tugas beserta semua riwayat pengumpulan dan nilai siswa akan dihapus secara permanen dari server.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingTaskId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-rose-200"
              >
                Ya, Hapus Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GRADING / PENILAIAN TUGAS OLEH GURU */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Beri Nilai Tugas: {gradingSubmission.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTask?.title} • {selectedTask?.subject}
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gradingSubmission.githubUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono break-all">
                <strong>Repo Git:</strong>{' '}
                <a
                  href={gradingSubmission.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {gradingSubmission.githubUrl}
                </a>
              </div>
            )}

            {gradingSubmission.workContent && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono max-h-36 overflow-y-auto">
                <div className="font-bold text-slate-700 mb-1">Catatan/Jawaban Siswa:</div>
                <p className="whitespace-pre-line text-slate-600">{gradingSubmission.workContent}</p>
              </div>
            )}

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nilai Perolehan (0 - {selectedTask?.maxScore || 100})
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedTask?.maxScore || 100}
                  required
                  value={inputScore}
                  onChange={(e) => setInputScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Feedback Evaluasi Guru
                </label>
                <textarea
                  rows={3}
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Bagus! Struktur controller dan model Mongoose sudah rapi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-100"
                >
                  Simpan Nilai & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT TUGAS BARU OLEH GURU */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Buat Tugas Harian / Proyek Siswa Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Tugas Mandiri 3: Membuat REST API Auth dengan JWT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kelas</label>
                  <input
                    type="text"
                    value={newTargetClass}
                    onChange={(e) => setNewTargetClass(e.target.value)}
                    placeholder="12 PPLG 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Batas Waktu & Jam Deadline
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDateTime}
                    onChange={(e) => setNewDueDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format: {formatDateTimeInputToIndo(newDueDateTime)}
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Maksimal</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Petunjuk & Rincian Tugas
                </label>
                <textarea
                  rows={4}
                  required
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Tuliskan langkah pengerjaan, format output git repository, atau kriteria khusus..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-100"
                >
                  Publikasikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
