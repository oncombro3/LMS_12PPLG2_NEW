import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  GitBranch,
  Upload,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Award,
  ChevronRight,
  Terminal,
  Play,
  Check
} from 'lucide-react';
import { Assignment, StudentSubmission, UserRole } from '../types';

interface AssignmentsViewProps {
  assignments: Assignment[];
  userRole: UserRole;
  currentStudentName: string;
  currentStudentId: string;
  onSubmitAssignment: (
    assignmentId: string,
    submission: { codeContent?: string; note?: string; githubUrl?: string; fileAttachment?: string }
  ) => void;
  onGradeAssignment?: (assignmentId: string, submissionId: string, grade: number, feedback: string) => void;
  onOpenSandboxWithCode: (code: string, language: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  userRole,
  currentStudentName,
  currentStudentId,
  onSubmitAssignment,
  onGradeAssignment,
  onOpenSandboxWithCode,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Form State
  const [githubUrl, setGithubUrl] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [note, setNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Teacher Grading State
  const [selectedSubForGrading, setSelectedSubForGrading] = useState<StudentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  const openAssignmentModal = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setCodeContent(asg.mySubmission?.codeContent || asg.starterCode || '');
    setGithubUrl(asg.mySubmission?.githubUrl || '');
    setNote(asg.mySubmission?.note || '');
    setSubmittedSuccess(false);
    setSelectedSubForGrading(asg.allSubmissions?.[0] || null);
    if (asg.allSubmissions?.[0]) {
      setGradeScore(asg.allSubmissions[0].grade || 85);
      setGradeFeedback(asg.allSubmissions[0].feedback || 'Pengerjaan rapi dan sesuai instruksi.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    onSubmitAssignment(selectedAssignment.id, {
      codeContent,
      note,
      githubUrl,
      fileAttachment: fileName || undefined,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSelectedAssignment(null);
    }, 1500);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !selectedSubForGrading || !onGradeAssignment) return;
    onGradeAssignment(selectedAssignment.id, selectedSubForGrading.id, Number(gradeScore), gradeFeedback);
    alert('Nilai berhasil disimpan!');
    setSelectedAssignment(null);
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (filterStatus === 'all') return true;
    return asg.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-500" />
            Tugas & Praktikum Koding 12 PPLG 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unggah repositori GitHub, kode sumber, atau laporan praktikum kejuruan software.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Semua' :
               status === 'pending' ? 'Belum Dikumpul' :
               status === 'submitted' ? 'Sudah Dikumpul' : 'Telah Dinilai'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((asg) => {
          const isPending = asg.status === 'pending';
          const isGraded = asg.status === 'graded';
          const isSubmitted = asg.status === 'submitted';

          return (
            <div
              key={asg.id}
              onClick={() => openAssignmentModal(asg)}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {asg.courseTitle}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isGraded
                      ? 'bg-emerald-100 text-emerald-800'
                      : isSubmitted
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isGraded ? (
                      <>
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        Nilai: {asg.mySubmission?.grade ?? 95}/100
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Telah Dikumpul
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Belum Selesai
                      </>
                    )}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {asg.description}
                </p>

                {/* Instructions Snippet */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kriteria Tugas:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {asg.instructions.slice(0, 2).map((ins, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deadline: {new Date(asg.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>

                <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  {userRole === 'teacher' ? 'Kelola / Nilai' : isPending ? 'Kumpulkan Tugas' : 'Lihat Detail'} &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Submission & Teacher Grading Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                  {selectedAssignment.courseTitle}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {selectedAssignment.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Instructions Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Instruksi & Persyaratan:</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-3">{selectedAssignment.description}</p>
                <div className="space-y-1.5">
                  {selectedAssignment.instructions.map((ins, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Code Viewer & Runner */}
              {selectedAssignment.starterCode && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Code className="w-4 h-4" /> Starter Code ({selectedAssignment.language || 'typescript'})
                    </span>
                    <button
                      onClick={() => {
                        const code = selectedAssignment.starterCode!;
                        const lang = selectedAssignment.language || 'javascript';
                        setSelectedAssignment(null);
                        onOpenSandboxWithCode(code, lang);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Jalankan di Sandbox
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 max-h-40 overflow-y-auto p-2 bg-slate-900 rounded-lg">
                    <code>{selectedAssignment.starterCode}</code>
                  </pre>
                </div>
              )}

              {/* Student Role: Submission Form */}
              {userRole === 'student' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-600" />
                      Formulir Pengumpulan Tugas Siswa
                    </h3>
                    <span className="text-xs text-slate-500">
                      Siswa: <strong className="text-slate-800">{currentStudentName}</strong>
                    </span>
                  </div>

                  {selectedAssignment.mySubmission?.status === 'graded' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" /> Nilai Tugas Diterima
                        </span>
                        <span className="text-lg font-extrabold text-emerald-700">
                          {selectedAssignment.mySubmission.grade} / {selectedAssignment.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1">
                        <strong>Catatan Guru:</strong> {selectedAssignment.mySubmission.feedback}
                      </p>
                    </div>
                  )}

                  {submittedSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-800 font-bold text-sm">
                      🎉 Tugas berhasil dikirim ke guru! Menunggu review nilai.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* GitHub URL Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <GitBranch className="w-4 h-4 text-slate-900" /> Link Repositori GitHub / Commit URL
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username/project-12pplg2"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Code Content */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-indigo-600" /> Snippet Kode Jawaban / Logika
                        </label>
                        <textarea
                          rows={5}
                          value={codeContent}
                          onChange={(e) => setCodeContent(e.target.value)}
                          placeholder="Tulis atau paste kode implementasi di sini..."
                          className="w-full p-3 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Simulated File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-slate-600" /> Lampiran Berkas / Laporan (.pdf, .zip)
                        </label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50">
                          <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setFileName(e.target.files[0].name);
                              }
                            }}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                            <span className="text-xs text-indigo-600 font-semibold">
                              {fileName ? `File terpilih: ${fileName}` : 'Klik untuk pilih berkas atau seret ke sini'}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Maksimal 25MB (PDF, ZIP, DOCX)</p>
                          </label>
                        </div>
                      </div>

                      {/* Student Notes */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Catatan Tambahan untuk Guru
                        </label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Contoh: Fitur auth JWT sudah dites di Postman..."
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAssignment(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Kirim Pengumpulan Tugas
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Teacher Role: Submissions Management & Grading Panel */}
              {(userRole === 'teacher' || userRole === 'admin') && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Panel Penilaian Guru (Kelas XII PPLG 2)
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {selectedAssignment.allSubmissions?.length || 0} Pengumpulan Siswa
                    </span>
                  </div>

                  {selectedAssignment.allSubmissions && selectedAssignment.allSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Submissions List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedAssignment.allSubmissions.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubForGrading(sub);
                              setGradeScore(sub.grade || 85);
                              setGradeFeedback(sub.feedback || 'Bagus!');
                            }}
                            className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                              selectedSubForGrading?.id === sub.id
                                ? 'bg-indigo-50 border-indigo-500'
                                : 'bg-slate-50 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{sub.studentName}</div>
                              <div className="text-[10px] text-slate-500">{sub.githubUrl ? 'GitHub Link ✓' : 'Direct Code'}</div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status === 'graded' ? `Nilai: ${sub.grade}` : 'Perlu Dinilai'}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Active Grading Form */}
                      {selectedSubForGrading && (
                        <form onSubmit={handleSaveGrade} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <h4 className="text-xs font-bold text-slate-800">
                            Beri Nilai untuk: {selectedSubForGrading.studentName}
                          </h4>

                          {selectedSubForGrading.githubUrl && (
                            <div className="text-xs text-indigo-600 flex items-center gap-1 font-mono">
                              <GitBranch className="w-3.5 h-3.5" />
                              <a href={selectedSubForGrading.githubUrl} target="_blank" rel="noreferrer" className="underline">
                                {selectedSubForGrading.githubUrl}
                              </a>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Skor Nilai (0-100)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={gradeScore}
                                onChange={(e) => setGradeScore(Number(e.target.value))}
                                className="w-full p-2 border rounded-xl font-bold text-indigo-600 text-sm"
                                required
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Feedback / Evaluasi Guru
                              </label>
                              <input
                                type="text"
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                placeholder="Tulis masukan perbaikan kode siswa..."
                                className="w-full p-2 border rounded-xl text-xs"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
                            >
                              Simpan Nilai Siswa
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Belum ada siswa yang mengumpulkan tugas ini.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
