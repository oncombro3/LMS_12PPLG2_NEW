import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Save,
  X,
  Palette
} from 'lucide-react';
import { SubjectItem, User } from '../types';

interface AdminSubjectsTabProps {
  subjects: SubjectItem[];
  teachers?: User[];
  onCreateSubject?: (data: Partial<SubjectItem>) => Promise<void>;
  onUpdateSubject?: (id: string, updates: Partial<SubjectItem>) => Promise<void>;
  onDeleteSubject?: (id: string) => Promise<void>;
}

const COLOR_MAP: Record<string, { bgBadge: string; textBadge: string; borderCard: string; dot: string; lightBg: string }> = {
  indigo: { bgBadge: 'bg-indigo-100 text-indigo-800', textBadge: 'text-indigo-700', borderCard: 'border-indigo-200/80 hover:border-indigo-300', dot: 'bg-indigo-600', lightBg: 'bg-indigo-50/50' },
  blue: { bgBadge: 'bg-blue-100 text-blue-800', textBadge: 'text-blue-700', borderCard: 'border-blue-200/80 hover:border-blue-300', dot: 'bg-blue-600', lightBg: 'bg-blue-50/50' },
  emerald: { bgBadge: 'bg-emerald-100 text-emerald-800', textBadge: 'text-emerald-700', borderCard: 'border-emerald-200/80 hover:border-emerald-300', dot: 'bg-emerald-600', lightBg: 'bg-emerald-50/50' },
  amber: { bgBadge: 'bg-amber-100 text-amber-800', textBadge: 'text-amber-700', borderCard: 'border-amber-200/80 hover:border-amber-300', dot: 'bg-amber-600', lightBg: 'bg-amber-50/50' },
  rose: { bgBadge: 'bg-rose-100 text-rose-800', textBadge: 'text-rose-700', borderCard: 'border-rose-200/80 hover:border-rose-300', dot: 'bg-rose-600', lightBg: 'bg-rose-50/50' },
  purple: { bgBadge: 'bg-purple-100 text-purple-800', textBadge: 'text-purple-700', borderCard: 'border-purple-200/80 hover:border-purple-300', dot: 'bg-purple-600', lightBg: 'bg-purple-50/50' },
  teal: { bgBadge: 'bg-teal-100 text-teal-800', textBadge: 'text-teal-700', borderCard: 'border-teal-200/80 hover:border-teal-300', dot: 'bg-teal-600', lightBg: 'bg-teal-50/50' },
  cyan: { bgBadge: 'bg-cyan-100 text-cyan-800', textBadge: 'text-cyan-700', borderCard: 'border-cyan-200/80 hover:border-cyan-300', dot: 'bg-cyan-600', lightBg: 'bg-cyan-50/50' },
  orange: { bgBadge: 'bg-orange-100 text-orange-800', textBadge: 'text-orange-700', borderCard: 'border-orange-200/80 hover:border-orange-300', dot: 'bg-orange-600', lightBg: 'bg-orange-50/50' },
};

// Simplified presets with only Code, Name, Color, Description
const SUBJECT_PRESETS = [
  { code: 'MTK', name: 'Matematika', color: 'blue', desc: 'Mata pelajaran matematika dasar, aljabar, dan statistika.' },
  { code: 'IPA', name: 'Ilmu Pengetahuan Alam (IPA)', color: 'emerald', desc: 'Sains dan ilmu pengetahuan alam terapan.' },
  { code: 'IPS', name: 'Ilmu Pengetahuan Sosial (IPS)', color: 'amber', desc: 'Dinamika sosial, ekonomi terapan, dan sejarah.' },
  { code: 'B-IND', name: 'Bahasa Indonesia', color: 'rose', desc: 'Tata bahasa, literasi membaca, dan penulisan teks.' },
  { code: 'B-ING', name: 'Bahasa Inggris', color: 'purple', desc: 'Komunikasi bahasa Inggris lisan, tulisan, dan percakapan.' },
  { code: 'PAI', name: 'Pendidikan Agama Islam', color: 'teal', desc: 'Pendidikan akhlak, akidah, dan fiqih ibadah.' },
  { code: 'PJOK', name: 'Pendidikan Jasmani (PJOK)', color: 'emerald', desc: 'Kebugaran fisik, olahraga tim, dan kesehatan jasmani.' },
  { code: 'PPKN', name: 'Pendidikan Pancasila & Kewarganegaraan', color: 'rose', desc: 'Nilai-nilai Pancasila, konstitusi negara, dan kewarganegaraan.' },
  { code: 'PWPB', name: 'Pemrograman Web & Bergerak', color: 'indigo', desc: 'Pengembangan web frontend, backend REST API, dan database.' },
  { code: 'PBO', name: 'Pemrograman Berorientasi Objek', color: 'orange', desc: 'Konsep dasar OOP, inheritance, polymorphism, dan classes.' },
  { code: 'BDT', name: 'Basis Data', color: 'cyan', desc: 'Struktur database relasional SQL dan NoSQL.' },
  { code: 'PKK', name: 'Produk Kreatif & Kewirausahaan', color: 'amber', desc: 'Perancangan prototipe produk dan wirausaha digital.' },
];

export const AdminSubjectsTab: React.FC<AdminSubjectsTabProps> = ({
  subjects,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  // Form State: Tambah Mapel Baru
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('indigo');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Delete Modal State
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apply quick preset
  const handleApplyPreset = (preset: typeof SUBJECT_PRESETS[0]) => {
    setCode(preset.code);
    setName(preset.name);
    setDescription(preset.desc);
    setColorTheme(preset.color);
    setSuccessMsg(`Preset "${preset.code} - ${preset.name}" diterapkan ke formulir.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama mata pelajaran wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (onCreateSubject) {
        await onCreateSubject({
          code: code.trim().toUpperCase() || 'MAPEL',
          name: name.trim(),
          description: description.trim(),
          colorTheme,
        });
      }

      setSuccessMsg(`Mata pelajaran ${code.toUpperCase() || ''} (${name}) berhasil dibuat dan disimpan!`);
      setCode('');
      setName('');
      setDescription('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat mata pelajaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (subj: SubjectItem) => {
    setEditingSubject(subj);
    setEditCode(subj.code || '');
    setEditName(subj.name || '');
    setEditDesc(subj.description || '');
    setEditColor(subj.colorTheme || 'indigo');
    setEditErrorMsg('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    setIsSubmittingEdit(true);
    setEditErrorMsg('');

    try {
      if (onUpdateSubject) {
        await onUpdateSubject(editingSubject.id, {
          code: editCode.trim().toUpperCase(),
          name: editName.trim(),
          description: editDesc.trim(),
          colorTheme: editColor,
        });
      }
      setEditingSubject(null);
    } catch (err: any) {
      setEditErrorMsg(err.message || 'Gagal memperbarui mata pelajaran');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    setIsDeleting(true);
    try {
      if (onDeleteSubject) {
        await onDeleteSubject(deletingSubject.id);
      }
      setDeletingSubject(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered subjects by search query
  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  const totalSubjects = subjects.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Manajemen Data Mata Pelajaran
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                {totalSubjects} Mapel Terdaftar
              </span>
            </div>
            <h2 className="font-black text-slate-900 text-xl sm:text-2xl mt-2 tracking-tight">
              Master Data Mata Pelajaran (Mapel)
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Buat dan kelola daftar mata pelajaran sekolah seperti Matematika (MTK), IPA, IPS, Bahasa, atau mata pelajaran kejuruan.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <div className="text-2xl font-black text-indigo-900">{totalSubjects}</div>
            <div className="text-xs font-bold text-slate-500">Total Mata Pelajaran</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORM: BUAT MATA PELAJARAN BARU                                           */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Tambah Mata Pelajaran Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan kode singkat mapel (misal: MTK, IPA) dan nama mata pelajaran.
            </p>
          </div>
          <span className="text-[11px] font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 self-start sm:self-auto">
            Tersimpan ke Server & Database
          </span>
        </div>

        {/* Quick One-Click Template Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Template Cepat (Klik untuk Isi Otomatis):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_PRESETS.map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-extrabold border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1.5"
              >
                <span className="font-mono text-indigo-600">+{preset.code}</span>
                <span className="text-slate-600 font-medium truncate max-w-[130px]">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-bold animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Subject Code */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kode Mata Pelajaran *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: MTK, IPA, PWPB"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            {/* Subject Full Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Mata Pelajaran *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Matematika, IPA, Pemrograman Web"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Visual Color Theme */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Warna Label / Tag</span>
              </label>
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="indigo">Indigo (Standar)</option>
                <option value="blue">Blue (Biru)</option>
                <option value="emerald">Emerald (Hijau)</option>
                <option value="amber">Amber (Kuning/Oranye)</option>
                <option value="rose">Rose (Merah Muda)</option>
                <option value="purple">Purple (Ungu)</option>
                <option value="teal">Teal (Toska)</option>
                <option value="cyan">Cyan (Biru Muda)</option>
                <option value="orange">Orange (Oranye Terang)</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">
                Keterangan / Deskripsi Singkat (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan tambahan mengenai materi atau silabus mapel ini..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Mata Pelajaran'}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode (MTK, IPA) atau nama mata pelajaran..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBJECTS LIST DISPLAY (GRID OR TABLE)                                    */}
      {/* ========================================================================= */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-base">Tidak Ada Mata Pelajaran Ditemukan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada mata pelajaran yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subj) => {
            const colorCfg = COLOR_MAP[subj.colorTheme || 'indigo'] || COLOR_MAP.indigo;

            return (
              <div
                key={subj.id}
                className={`bg-white rounded-3xl border ${colorCfg.borderCard} shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group`}
              >
                <div className="p-5 space-y-3">
                  {/* Top Bar: Code Pill and Dot Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs px-3 py-1 bg-slate-900 text-white rounded-xl shadow-xs tracking-wider">
                      {subj.code}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${colorCfg.dot}`} title={`Warna: ${subj.colorTheme || 'indigo'}`} />
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition leading-snug">
                      {subj.name}
                    </h4>
                  </div>

                  {/* Description if available */}
                  {subj.description ? (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                      {subj.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Tidak ada keterangan tambahan.
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {subj.id.slice(-6)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(subj)}
                      className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-lg font-bold border border-slate-200 hover:border-amber-200 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingSubject(subj)}
                      className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg font-bold border border-slate-200 hover:border-rose-200 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-24">Kode</th>
                  <th className="px-5 py-3.5">Nama Mata Pelajaran</th>
                  <th className="px-5 py-3.5">Keterangan</th>
                  <th className="px-5 py-3.5 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-mono font-black text-indigo-900">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-mono font-bold">
                        {subj.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{subj.name}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {subj.description || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(subj)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg transition"
                          title="Edit Mata Pelajaran"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSubject(subj)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-lg transition"
                          title="Hapus Mata Pelajaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MATA PELAJARAN                                               */}
      {/* ========================================================================= */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Perbarui Mapel
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  Edit Mata Pelajaran: {editingSubject.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tema Warna</label>
                  <select
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 capitalize"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="blue">Blue (Biru)</option>
                    <option value="emerald">Emerald (Hijau)</option>
                    <option value="amber">Amber (Kuning/Oranye)</option>
                    <option value="rose">Rose (Merah Muda)</option>
                    <option value="purple">Purple (Ungu)</option>
                    <option value="teal">Teal (Toska)</option>
                    <option value="cyan">Cyan (Biru Muda)</option>
                    <option value="orange">Orange</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi</label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    placeholder="Keterangan singkat..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                               */}
      {/* ========================================================================= */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Hapus Mata Pelajaran?
              </h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-800">{deletingSubject.name} ({deletingSubject.code})</strong>? Tindakan ini akan menghapus mapel dari master sistem.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  'Menghapus...'
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Ya, Hapus Data
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
