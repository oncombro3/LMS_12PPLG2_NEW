import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileCheck,
  Sparkles,
  Layers,
  Send,
  Upload,
  Users,
  Edit,
  X,
  Target,
  AlertCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { AssessmentItem, UserRole } from '../types';
import {
  getDeadlineStatus,
  getDefaultDateTimeInput,
  formatDateTimeInputToIndo,
} from '../utils/deadline';

interface AssessmentsViewProps {
  assessments: AssessmentItem[];
  userRole: UserRole;
  currentStudentId: string;
  currentStudentName: string;
  onCreateAssessment: (data: Partial<AssessmentItem>) => Promise<void>;
  onDeleteAssessment?: (assessmentId: string) => Promise<void> | void;
  onSubmitAssessment: (
    assessmentId: string,
    payload: { content?: string; fileUrl?: string }
  ) => Promise<void>;
  onGradeAssessment?: (
    assessmentId: string,
    studentId: string,
    score: number,
    predicate: string,
    teacherNotes: string
  ) => Promise<void> | void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  assessments,
  userRole,
  currentStudentId,
  currentStudentName,
  onCreateAssessment,
  onDeleteAssessment,
  onSubmitAssessment,
  onGradeAssessment,
}) => {
  const [selectedAss, setSelectedAss] = useState<AssessmentItem | null>(assessments[0] || null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditingExistingSubmission, setIsEditingExistingSubmission] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);

  // Status notification banner
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  // Teacher Grading Modal
  const [gradingSub, setGradingSub] = useState<{
    studentId: string;
    studentName: string;
    content?: string;
    fileUrl?: string;
    currentScore?: number;
    currentPredicate?: string;
    currentNotes?: string;
  } | null>(null);
  const [gradeScore, setGradeScore] = useState(88);
  const [gradePredicate, setGradePredicate] = useState('Mahir');
  const [gradeNotes, setGradeNotes] = useState('');

  // New assessment state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Pemrograman Web (PWPB)');
  const [newTargetClass, setNewTargetClass] = useState('12 PPLG 2');
  const [newType, setNewType] = useState<'Diagnostik' | 'Formatif' | 'Sumatif' | 'P5'>('Formatif');
  const [newTarget, setNewTarget] = useState('TP 12.2: Implementasi State & Server Database');
  const [newDueDateTime, setNewDueDateTime] = useState(() => getDefaultDateTimeInput(1, 9, 0));
  const [newInstructions, setNewInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAss || userRole !== 'student') return;

    const deadlineInfo = getDeadlineStatus(selectedAss.deadline);
    if (deadlineInfo.isExpired) {
      setStatusMessage({
        type: 'error',
        title: 'Pengumpulan Ditutup',
        description: `Batas waktu pengumpulan asesmen telah berakhir pada ${deadlineInfo.formatted}. Anda tidak dapat mengirimkan portofolio lagi.`,
      });
      return;
    }

    if (!submissionContent.trim()) {
      setStatusMessage({
        type: 'error',
        title: 'Portofolio Gagal Terkirim',
        description: 'Harap ketik ringkasan portofolio capaian pembelajaran sebelum mengumpulkan.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await onSubmitAssessment(selectedAss.id, { content: submissionContent });
      setStatusMessage({
        type: 'success',
        title: 'Portofolio Terkumpul!',
        description: 'Portofolio asesmen kamu berhasil diserahkan ke guru pengampu. Nilai dan predikat capaian akan muncul setelah dinilai oleh guru.',
      });
      setSubmissionContent('');
      setIsEditingExistingSubmission(false);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        title: 'Portofolio Gagal Terkirim',
        description: err?.message || 'Terjadi gangguan sistem saat mengumpulkan portofolio. Silakan coba kembali.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (assId: string) => {
    if (!onDeleteAssessment) return;
    try {
      await onDeleteAssessment(assId);
      if (selectedAss?.id === assId) {
        setSelectedAss(assessments.find((a) => a.id !== assId) || null);
      }
      setDeletingAssessmentId(null);
    } catch (err) {
      console.error('Error deleting assessment:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const formattedDeadline = formatDateTimeInputToIndo(newDueDateTime);
    await onCreateAssessment({
      title: newTitle,
      subject: newSubject,
      targetClass: newTargetClass,
      type: newType,
      competencyTarget: newTarget,
      deadline: formattedDeadline,
      instructions: [newInstructions || 'Kerjakan portofolio mandiri sesuai rubrik capaian pembelajaran.'],
      rubric: [
        {
          criterion: 'Ketepatan Logika & Arsitektur',
          weight: 40,
          levels: [
            { level: 'Mahir', points: 40, descriptor: 'Arsitektur modular, bersih, dan tanpa bug.' },
            { level: 'Cakap', points: 32, descriptor: 'Struktur kode berjalan dengan baik.' },
            { level: 'Layak', points: 25, descriptor: 'Kode berjalan dengan beberapa perbaikan minor.' },
          ],
        },
        {
          criterion: 'Dokumentasi & Portofolio',
          weight: 60,
          levels: [
            { level: 'Mahir', points: 60, descriptor: 'Penjelasan komprehensif beserta artefak lengkap.' },
            { level: 'Cakap', points: 48, descriptor: 'Penjelasan cukup memadai.' },
          ],
        },
      ],
      submissions: [],
    });
    setShowCreateModal(false);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleSaveAssessmentGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAss || !gradingSub) return;

    if (onGradeAssessment) {
      await onGradeAssessment(
        selectedAss.id,
        gradingSub.studentId,
        gradeScore,
        gradePredicate,
        gradeNotes
      );
    } else {
      const targetSub = selectedAss.submissions.find((s) => s.studentId === gradingSub.studentId);
      if (targetSub) {
        targetSub.score = gradeScore;
        targetSub.predicate = gradePredicate;
        targetSub.teacherNotes = gradeNotes;
      }
    }
    setGradingSub(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              Kurikulum Merdeka
            </span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              Asesmen & Capaian (CP/TP)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Asesmen Diagnostik, Formatif & Sumatif
          </h1>
          <p className="text-xs text-slate-500">
            {userRole === 'teacher'
              ? 'Kelola instrumen penilaian berbasis rubrik kriteria, pantau ketercapaian TP, dan berikan evaluasi capaian siswa.'
              : 'Instrumen penilaian berbasis rubrik kriteria untuk mengukur ketercapaian tujuan pembelajaran siswa.'}
          </p>
        </div>

        {(userRole === 'teacher' || userRole === 'kurikulum') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Instrumen Asesmen Baru
          </button>
        )}
      </div>

      {/* Grid List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Daftar Asesmen ({assessments.length})
          </div>
          {assessments.map((item) => {
            const isSelected = selectedAss?.id === item.id;
            const mySub = item.submissions?.find((s) => s.studentId === currentStudentId);
            const submissionsCount = item.submissions?.length || 0;
            const itemDeadline = getDeadlineStatus(item.deadline);

            return (
              <button
                key={item.id}
                onClick={() => setSelectedAss(item)}
                className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {item.type}
                  </span>
                  {userRole === 'student' ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        mySub
                          ? 'bg-emerald-100 text-emerald-800'
                          : itemDeadline.isExpired
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {mySub ? '✓ Terkumpul' : itemDeadline.isExpired ? 'Ditutup (Expired)' : 'Tersedia'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {submissionsCount} Portofolio
                    </span>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {item.subject} • {item.competencyTarget}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className={itemDeadline.isExpired ? 'text-rose-600 font-bold' : ''}>
                    {itemDeadline.remainingText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAss ? (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Status Banner (Portofolio Terkumpul / Gagal Terkirim) */}
              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-xs">
                    <h4 className="font-extrabold text-sm mb-0.5">{statusMessage.title}</h4>
                    <p className="opacity-90 leading-relaxed">{statusMessage.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatusMessage(null)}
                    className="p-1 opacity-60 hover:opacity-100 transition rounded-lg hover:bg-black/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {(() => {
                const selectedDeadline = getDeadlineStatus(selectedAss.deadline);
                return (
                  <div className="border-b border-slate-100 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Asesmen {selectedAss.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${selectedDeadline.badgeBg} ${selectedDeadline.badgeBorder} ${selectedDeadline.badgeText}`}>
                          {selectedDeadline.remainingText}
                        </span>
                        {(userRole === 'teacher' || userRole === 'admin' || userRole === 'kurikulum' || userRole === 'kepalasekolah') && onDeleteAssessment && (
                          <button
                            type="button"
                            onClick={() => setDeletingAssessmentId(selectedAss.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Hapus Asesmen Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {selectedAss.title}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      <strong>Capaian / Target:</strong> {selectedAss.competencyTarget}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Guru: <strong>{selectedAss.teacher}</strong></span>
                      <span>•</span>
                      <span>Target: <strong>{selectedAss.targetClass || '12 PPLG 2'}</strong></span>
                      <span>•</span>
                      <span>Tenggat: <strong>{selectedAss.deadline}</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* Rubric Criteria Grid */}
              {selectedAss.rubric && selectedAss.rubric.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Rubrik Kriteria Penilaian:
                  </h3>
                  <div className="space-y-2">
                    {selectedAss.rubric.map((r, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span>{r.criterion}</span>
                          <span className="text-indigo-600">Bobot: {r.weight}%</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                          {r.levels.map((lvl, lIdx) => (
                            <div key={lIdx} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                              <div className="font-bold text-slate-900">{lvl.level} ({lvl.points} Poin)</div>
                              <div className="text-slate-500 mt-0.5">{lvl.descriptor}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOR TEACHER: MONITOR & GRADE ASSESSMENT SUBMISSIONS */}
              {userRole === 'teacher' || userRole === 'admin' || userRole === 'kurikulum' || userRole === 'kepalasekolah' ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Hasil Portofolio Siswa ({selectedAss.submissions?.length || 0})
                    </h3>
                  </div>

                  {selectedAss.submissions && selectedAss.submissions.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedAss.submissions.map((sub, idx) => (
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
                            {sub.content && (
                              <p className="text-slate-600 text-[11px] line-clamp-2 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                                {sub.content}
                              </p>
                            )}
                            {sub.teacherNotes && (
                              <p className="text-[11px] text-indigo-700 font-medium">
                                Catatan Guru: {sub.teacherNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {sub.score !== undefined ? (
                              <div className="text-right">
                                <div className="text-sm font-black text-indigo-600">{sub.score}</div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {sub.predicate || 'Mahir'}
                                </span>
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xl text-[10px] font-bold">
                                Belum Dinilai
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setGradingSub(sub);
                                setGradeScore(sub.score || 88);
                                setGradePredicate(sub.predicate || 'Mahir');
                                setGradeNotes(sub.teacherNotes || '');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1 text-[11px]"
                            >
                              <Edit className="w-3 h-3" />
                              {sub.score !== undefined ? 'Ubah Nilai' : 'Beri Nilai'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      Belum ada siswa yang mengumpulkan portofolio asesmen ini.
                    </div>
                  )}
                </div>
              ) : (
                /* FOR STUDENT: SUBMIT ASSESMEN */
                <div className="pt-4 border-t border-slate-100">
                  {(() => {
                    const mySub = selectedAss.submissions?.find((s) => s.studentId === currentStudentId);
                    const selectedDeadline = getDeadlineStatus(selectedAss.deadline);

                    if (mySub && !isEditingExistingSubmission) {
                      return (
                        <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-slate-50 rounded-2xl border border-emerald-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                              <div>
                                <h4 className="text-sm font-extrabold text-emerald-950">
                                  Portofolio Asesmen Terkumpul
                                </h4>
                                <span className="text-[11px] text-emerald-700">
                                  Diserahkan: {mySub.submittedAt || 'Hari ini'}
                                </span>
                              </div>
                            </div>

                            {mySub.score !== undefined ? (
                              <div className="text-right">
                                <span className="text-sm font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-xl">
                                  Nilai: {mySub.score} ({mySub.predicate || 'Mahir'})
                                </span>
                              </div>
                            ) : (
                              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                Menunggu Penilaian Guru
                              </span>
                            )}
                          </div>

                          {mySub.score === undefined ? (
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                              Portofolio kamu telah tersimpan di sistem. Guru pengampu (<strong>{selectedAss.teacher}</strong>) akan meninjau dan menilai berdasarkan rubrik capaian pembelajaran.
                            </div>
                          ) : (
                            mySub.teacherNotes && (
                              <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                                <strong>Catatan Penilaian Guru:</strong> {mySub.teacherNotes}
                              </div>
                            )
                          )}

                          {mySub.content && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap">
                              <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">
                                Portofolio yang Dikumpulkan:
                              </div>
                              {mySub.content}
                            </div>
                          )}

                          {mySub.score === undefined && !selectedDeadline.isExpired && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmissionContent(mySub.content || '');
                                  setIsEditingExistingSubmission(true);
                                }}
                                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-500" />
                                Edit Portofolio
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (selectedDeadline.isExpired && !mySub) {
                      return (
                        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
                          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-rose-950">
                              Batas Waktu Pengumpulan Asesmen Telah Berakhir
                            </h4>
                            <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                              Tenggat asesmen ini adalah <strong>{selectedAss.deadline}</strong>. Sistem telah menutup pengumpulan karena telah melewati jam batas waktu.
                            </p>
                          </div>
                          <div className="inline-block px-3 py-1 bg-rose-200 text-rose-900 rounded-lg text-xs font-mono font-bold">
                            Status: Pengumpulan Ditutup (Expired)
                          </div>
                        </div>
                      );
                    }

                    return (
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">
                            Portofolio / Catatan Bukti Capaian Pembelajaran
                          </label>
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

                        {/* Deadline banner in form */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${selectedDeadline.badgeBg} ${selectedDeadline.badgeBorder} ${selectedDeadline.badgeText}`}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Tenggat: <strong>{selectedAss.deadline}</strong></span>
                          </div>
                          <span className="font-extrabold">{selectedDeadline.remainingText}</span>
                        </div>

                        <textarea
                          rows={4}
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          placeholder="Jelaskan artefak hasil belajar, link demonstrasi produk, atau ringkasan capaian..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || selectedDeadline.isExpired}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmitting ? 'Menyimpan Portofolio...' : isEditingExistingSubmission ? 'Simpan Pembaruan Portofolio' : 'Kumpulkan Portofolio Asesmen'}
                        </button>
                      </form>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Pilih instrumen asesmen di sebelah kiri.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: GRADING ASESMEN OLEH GURU */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Penilaian Asesmen: {gradingSub.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAss?.title} • {selectedAss?.competencyTarget}
                </p>
              </div>
              <button
                onClick={() => setGradingSub(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gradingSub.content && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs max-h-36 overflow-y-auto">
                <div className="font-bold text-slate-700 mb-1">Portofolio Siswa:</div>
                <p className="text-slate-600 whitespace-pre-line">{gradingSub.content}</p>
              </div>
            )}

            <form onSubmit={handleSaveAssessmentGrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Capaian (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Predikat Kurikulum</label>
                  <select
                    value={gradePredicate}
                    onChange={(e) => setGradePredicate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Mahir">Mahir (85-100)</option>
                    <option value="Cakap">Cakap (75-84)</option>
                    <option value="Layak">Layak (65-74)</option>
                    <option value="Berkembang">Berkembang (&lt;65)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Guru & Tindak Lanjut
                </label>
                <textarea
                  rows={3}
                  value={gradeNotes}
                  onChange={(e) => setGradeNotes(e.target.value)}
                  placeholder="Portofolio menunjukkan pemahaman mendalam pada TP 12..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-100"
                >
                  Simpan Nilai Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Buat Instrumen Asesmen Baru
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
                <label className="block font-bold text-slate-700 mb-1">Judul Asesmen</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Asesmen Formatif: Portofolio REST API dengan Node.js"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
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
                  <label className="block font-bold text-slate-700 mb-1">Jenis Asesmen</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Formatif">Formatif</option>
                    <option value="Sumatif">Sumatif</option>
                    <option value="Diagnostik">Diagnostik</option>
                    <option value="P5">P5 (Projek Profil)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Batas Jam Deadline
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDateTime}
                    onChange={(e) => setNewDueDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatDateTimeInputToIndo(newDueDateTime)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Capaian Pembelajaran (TP)
                </label>
                <input
                  type="text"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Contoh: TP 12.3 Mampu mendesain skema MongoDB dan mengamankan endpoint"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Petunjuk & Kriteria Portofolio
                </label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Kirimkan link dokumentasi API dan file skema database..."
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
                  Rilis Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS ASESMEN */}
      {deletingAssessmentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Instrumen Asesmen?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instrumen asesmen beserta seluruh portofolio dan rekap nilai capaian siswa yang terkumpul akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAssessmentId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingAssessmentId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
