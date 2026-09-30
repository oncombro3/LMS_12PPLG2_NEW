import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  Play,
  Download,
  Sparkles,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { LearningMaterial, UserRole, Subject } from '../types';

interface MaterialsViewProps {
  materials: LearningMaterial[];
  userRole: UserRole;
  subjects?: Subject[];
  onCreateMaterial: (data: Partial<LearningMaterial>) => Promise<void>;
  onDeleteMaterial?: (id: string) => Promise<void>;
  onOpenSandboxWithCode?: (code: string, language: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  userRole,
  subjects = [],
  onCreateMaterial,
  onDeleteMaterial,
  onOpenSandboxWithCode,
}) => {
  const [selectedMat, setSelectedMat] = useState<LearningMaterial | null>(materials[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<LearningMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = userRole === 'teacher' || userRole === 'kurikulum' || userRole === 'admin';

  const confirmDelete = async () => {
    if (!materialToDelete || !onDeleteMaterial) return;
    setIsDeleting(true);
    try {
      await onDeleteMaterial(materialToDelete.id);
      if (selectedMat?.id === materialToDelete.id) {
        const remaining = materials.filter((m) => m.id !== materialToDelete.id);
        setSelectedMat(remaining[0] || null);
      }
      setMaterialToDelete(null);
    } catch (err) {
      console.error('Failed to delete material:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Create state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Pemrograman Web (PWPB)');
  const [newChapter, setNewChapter] = useState('Bab 1');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateMaterial({
      title: newTitle,
      subject: newSubject,
      chapter: newChapter,
      summary: newSummary,
      contentMarkdown: newContent,
      type: 'document',
    });
    setShowCreateModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              E-Learning & Modul Ajar
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              Database MongoDB
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Materi & Modul Pembelajaran Siswa
          </h1>
          <p className="text-xs text-slate-500">
            Akses bahan ajar digital, video tutorial, serta modul koding interaktif untuk kelas XII PPLG.
          </p>
        </div>

        {(userRole === 'teacher' || userRole === 'kurikulum') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Modul Ajar Baru
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Material List */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Modul Tersedia ({materials.length})
          </div>
          {materials.map((mat) => {
            const isSelected = selectedMat?.id === mat.id;

            return (
              <button
                key={mat.id}
                onClick={() => setSelectedMat(mat)}
                className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {mat.chapter}
                    </span>
                    {canManage && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaterialToDelete(mat);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            setMaterialToDelete(mat);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Modul Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {mat.readTime}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                  {mat.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">{mat.summary}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold">
                  <span>{mat.subject}</span>
                  <span className="text-slate-400">Guru: {mat.teacher}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Material Reader Content */}
        <div className="lg:col-span-2">
          {selectedMat ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {selectedMat.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedMat.chapter}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {selectedMat.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Pengampu: <strong>{selectedMat.teacher}</strong></span>
                    <span>•</span>
                    <span>Estimasi: <strong>{selectedMat.readTime}</strong></span>
                    <span>•</span>
                    <span>Dilihat: <strong>{selectedMat.viewsCount}x</strong></span>
                  </div>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => setMaterialToDelete(selectedMat)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                    title="Hapus Materi Ini"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Hapus Materi
                  </button>
                )}
              </div>

              {/* Summary Callout */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-950 leading-relaxed font-medium">
                <strong>Ringkasan Materi:</strong> {selectedMat.summary}
              </div>

              {/* Main Content */}
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal space-y-3">
                {selectedMat.contentMarkdown}
              </div>

              {/* Code Snippet Sandbox Launcher */}
              {selectedMat.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-indigo-600" />
                      Contoh Kode Implementasi ({selectedMat.codeSnippet.language})
                    </span>
                    {onOpenSandboxWithCode && (
                      <button
                        onClick={() =>
                          onOpenSandboxWithCode(
                            selectedMat.codeSnippet!.code,
                            selectedMat.codeSnippet!.language
                          )
                        }
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-xl"
                      >
                        <Play className="w-3.5 h-3.5 fill-indigo-600" /> Buka di Lab Koding
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                    <pre>{selectedMat.codeSnippet.code}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Pilih modul pembelajaran di sebelah kiri untuk membaca materi.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Buat Modul Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Upload Modul Materi Baru
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Modul</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Modul 4: Integrasi MongoDB Atlas dengan Mongoose"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                  <label className="block font-bold text-slate-700 mb-1">Bab / Unit</label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Materi</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Ringkasan poin penting..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Konten Lengkap (Markdown / Teks)</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tulis uraian materi atau modul pembelajaran di sini..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Materi */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Hapus Modul Pembelajaran?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs">
              <div className="font-extrabold text-slate-800 line-clamp-2">
                {materialToDelete.title}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-indigo-600">{materialToDelete.subject}</span>
                <span>•</span>
                <span>{materialToDelete.chapter}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Materi pembelajaran ini akan dihapus secara permanen dari server dan tidak akan dapat diakses lagi oleh siswa di portal belajar.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-rose-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  'Menghapus...'
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Ya, Hapus Materi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
