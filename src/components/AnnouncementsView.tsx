import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Pin,
  Calendar,
  User as UserIcon,
  Tag,
  Paperclip,
  ExternalLink,
  Trash2,
  AlertCircle,
  Sparkles,
  Layers,
  School,
  CheckCircle2,
  X,
  Share2,
  Clock,
} from 'lucide-react';
import { Announcement, ClassRoom, User, UserRole } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  classes: ClassRoom[];
  currentUser: User;
  onCreateAnnouncement: (data: Partial<Announcement>) => Promise<void> | void;
  onDeleteAnnouncement?: (id: string) => Promise<void> | void;
  onTogglePin?: (id: string) => Promise<void> | void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  classes,
  currentUser,
  onCreateAnnouncement,
  onDeleteAnnouncement,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Announcement
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Penting');
  const [newPriority, setNewPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [newTargetClass, setNewTargetClass] = useState('Semua Kelas');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Konfirmasi Hapus Pengumuman (Pop-up Konfirmasi / Batal)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);

  const handleConfirmDeleteAnnouncement = async () => {
    if (!announcementToDelete || !onDeleteAnnouncement) return;
    setIsDeletingAnnouncement(true);
    try {
      await onDeleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    } finally {
      setIsDeletingAnnouncement(false);
    }
  };

  const canCreate =
    currentUser.role === 'teacher' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'kurikulum' ||
    currentUser.role === 'kepalasekolah';

  const categories = [
    { id: 'all', label: 'Semua Info' },
    { id: 'urgent', label: 'Mendesak & Penting' },
    { id: 'Ulangan CBT', label: 'Ulangan CBT' },
    { id: 'Tugas', label: 'Tugas & Proyek' },
    { id: 'Akademik', label: 'Akademik' },
    { id: 'Info Kelas', label: 'Info Rombel' },
    { id: 'Prestasi', label: 'Prestasi & Lomba' },
  ];

  // Filtering
  const filteredAnnouncements = announcements.filter((ann) => {
    // Search query match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      ann.title.toLowerCase().includes(query) ||
      ann.content.toLowerCase().includes(query) ||
      ann.author.toLowerCase().includes(query) ||
      ann.tags?.some((t) => t.toLowerCase().includes(query));

    // Category match
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'urgent' && (ann.priority === 'urgent' || ann.pinned)) ||
      ann.badge.toLowerCase().includes(selectedCategory.toLowerCase());

    // Class target match
    const matchesClass =
      selectedClassFilter === 'all' ||
      ann.targetClass === 'Semua Kelas' ||
      !ann.targetClass ||
      ann.targetClass.toLowerCase() === selectedClassFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesClass;
  });

  // Sort: Pinned first, then urgency, then order
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
    return 0;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedTags = newTags
        ? newTags
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        : [newCategory, newTargetClass];

      let authorRoleDisplay = 'Guru Pengampu';
      if (currentUser.role === 'teacher') {
        authorRoleDisplay = currentUser.class ? `Guru / ${currentUser.class}` : 'Guru Mata Pelajaran';
      } else if (currentUser.role === 'admin') {
        authorRoleDisplay = 'Admin Kurikulum IT';
      } else if (currentUser.role === 'kurikulum') {
        authorRoleDisplay = 'Tim Pengembang Kurikulum';
      } else if (currentUser.role === 'kepalasekolah') {
        authorRoleDisplay = 'Kepala Sekolah';
      }

      await onCreateAnnouncement({
        title: newTitle.trim(),
        author: currentUser.name,
        authorRole: authorRoleDisplay,
        badge: newCategory,
        priority: newPriority,
        targetClass: newTargetClass,
        content: newContent.trim(),
        tags: parsedTags,
        pinned: newIsPinned,
        attachmentName: newAttachmentName.trim() || undefined,
        attachmentUrl: newAttachmentUrl.trim() || undefined,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      });

      // Reset form & close
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setNewAttachmentName('');
      setNewAttachmentUrl('');
      setNewIsPinned(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (ann: Announcement) => {
    const text = `[PENGUMUMAN LMS] ${ann.title}\nOleh: ${ann.author}\n${ann.content}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-extrabold border border-amber-500/30 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Papan Informasi Resmi Sekolah
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-slate-300">
              {announcements.length} Pengumuman Terbit
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Pusat Pengumuman & Edaran Guru
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Informasi resmi terpadu seputar jadwal Ulangan CBT, tenggat tugas proyek, kegiatan sekolah, serta instruksi penting dari dewan guru pengampu.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2.5 shrink-0 active:scale-95 border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            Buat Pengumuman Baru
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengumuman berdasarkan judul, isi, guru, atau tagar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Target Kelas</option>
              <option value="Semua Kelas">Khusus: Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {sortedAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">
              Belum Ada Pengumuman Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Tidak ada pengumuman yang sesuai dengan filter atau kata kunci pencarian kamu.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              + Buat Pengumuman Baru
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedAnnouncements.map((ann) => {
            const isPinned = ann.pinned;
            const isUrgent = ann.priority === 'urgent';
            const isImportant = ann.priority === 'important';

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-3xl border transition p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-xs hover:shadow-md ${
                  isPinned
                    ? 'border-amber-300 ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/30 to-white'
                    : isUrgent
                    ? 'border-rose-200 bg-gradient-to-b from-rose-50/20 to-white'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Top Ribbons & Meta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isPinned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                          <Pin className="w-3 h-3 fill-current" />
                          DISEMATKAN
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isImportant
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {ann.badge} • {ann.priority.toUpperCase()}
                      </span>

                      {ann.targetClass && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                          <School className="w-2.5 h-2.5 text-slate-400" />
                          {ann.targetClass}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ann.date}</span>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                    {ann.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  {/* Attachment if any */}
                  {ann.attachmentUrl && (
                    <div className="pt-1">
                      <a
                        href={ann.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{ann.attachmentName || 'Buka Berkas Lampiran'}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer: Author info & Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {ann.author.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <div className="font-extrabold text-slate-900 leading-tight">
                          {ann.author}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {ann.authorRole}
                        </div>
                      </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(ann)}
                        title="Salin Pengumuman"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        {copiedId === ann.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      {canCreate && onTogglePin && (
                        <button
                          onClick={() => onTogglePin(ann.id)}
                          title={isPinned ? 'Lepas Sematan' : 'Sematkan di Teratas'}
                          className={`p-1.5 rounded-lg transition ${
                            isPinned
                              ? 'text-amber-600 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                          }`}
                        >
                          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {canCreate && onDeleteAnnouncement && (
                        <button
                          onClick={() => setAnnouncementToDelete(ann)}
                          title="Hapus Pengumuman"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {ann.tags && ann.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {ann.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Pengumuman Baru (Khusus Guru / Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Buat Pengumuman Baru</h2>
                  <p className="text-xs text-slate-300">
                    Rilis edaran resmi untuk siswa & rekan guru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Judul Pengumuman */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Pelaksanaan Ulangan CBT PWPB Pekan 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Grid: Kategori, Prioritas, Target Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kategori */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori / Topik</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Penting">Penting</option>
                    <option value="Ulangan CBT">Ulangan CBT</option>
                    <option value="Tugas">Tugas & Proyek</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Info Kelas">Info Rombel / Kelas</option>
                    <option value="Prestasi">Prestasi & Lomba</option>
                    <option value="Kegiatan">Kegiatan Sekolah</option>
                  </select>
                </div>

                {/* Prioritas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tingkat Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as 'normal' | 'important' | 'urgent')
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normal">Biasa (Normal)</option>
                    <option value="important">Penting (Important)</option>
                    <option value="urgent">Mendesak (Urgent)</option>
                  </select>
                </div>

                {/* Target Kelas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Kelas</label>
                  <select
                    value={newTargetClass}
                    onChange={(e) => setNewTargetClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Semua Kelas">Semua Kelas (Umum)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Isi Pengumuman */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Isi / Detail Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan isi pengumuman secara rinci, instruksi kepada siswa, tanggal pelaksanaan, atau lokasi lab..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Tagar / Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tagar / Label (Dipisahkan koma)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: CBT 2026, PWPB, Lab 304, Wajib"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Lampiran File / Link (Opsional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Label Berkas Lampiran (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Unduh Surat Edaran PDF"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    URL Tautan / File (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Pin Announcement */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 fill-current text-amber-600" />
                      Sematkan Pengumuman di Posisi Paling Atas (Pin to Top)
                    </div>
                    <div className="text-[11px] text-amber-700">
                      Pengumuman ini akan diprioritaskan tampil di deretan awal Beranda siswa & guru.
                    </div>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Mempublikasikan...'
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5" />
                      Publikasikan Pengumuman
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POP-UP KONFIRMASI / BATAL HAPUS PENGUMUMAN                         */}
      {/* ========================================================================= */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Hapus Pengumuman Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus pengumuman{' '}
                <strong className="text-slate-800 font-bold">"{announcementToDelete.title}"</strong>?
              </p>
              <div className="bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-xl text-[11px] text-left mt-2">
                ⚠️ <strong>Perhatian:</strong> Pengumuman yang telah dihapus tidak akan lagi dapat dilihat oleh siswa maupun dewan guru.
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                disabled={isDeletingAnnouncement}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAnnouncement}
                disabled={isDeletingAnnouncement}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingAnnouncement ? (
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
