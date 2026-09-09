import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Award,
  CheckCircle2,
  Send,
  Sparkles,
  Search,
  Filter,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { DiscussionThread, User } from '../types';

interface DiscussionViewProps {
  threads: DiscussionThread[];
  currentUser: User;
  onAddThread: (thread: Omit<DiscussionThread, 'id' | 'createdAt' | 'views' | 'replies'>) => void;
  onAddReply: (threadId: string, content: string) => void;
  onUpvoteReply: (threadId: string, replyId: string) => void;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  threads,
  currentUser,
  onAddThread,
  onAddReply,
  onUpvoteReply,
}) => {
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(
    threads[0] || null
  );
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Thread Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('Pemrograman Web & Mobile (PWPB)');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('React, PWPB');

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyContent.trim()) return;

    onAddReply(selectedThread.id, replyContent.trim());
    setReplyContent('');

    // Update local thread view
    const newReplyObj = {
      id: `rep-${Date.now()}`,
      author: currentUser.name,
      authorRole: currentUser.role === 'teacher' ? 'Guru Pengampu' : 'Siswa XII PPLG 2',
      authorAvatar: currentUser.avatar,
      createdAt: 'Baru saja',
      content: replyContent.trim(),
      isInstructorAnswer: currentUser.role === 'teacher',
      upvotes: 0,
    };

    setSelectedThread({
      ...selectedThread,
      replies: [...selectedThread.replies, newReplyObj],
    });
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddThread({
      courseId: 'pwpb-12',
      courseTitle: newCourseTitle,
      title: newTitle.trim(),
      author: currentUser.name,
      authorRole: currentUser.role === 'teacher' ? 'Guru Pengampu' : 'Siswa XII PPLG 2',
      authorAvatar: currentUser.avatar,
      content: newContent.trim(),
      tags: tagsArray.length ? tagsArray : ['Diskusi', 'PPLG'],
    });

    setShowNewThreadModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title & New Thread Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Forum Diskusi Koding XII PPLG 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tanya jawab seputar error koding, arsitektur database, tugas praktikum, dan materi kejuruan.
          </p>
        </div>

        <button
          onClick={() => setShowNewThreadModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-200 self-start"
        >
          <Plus className="w-4 h-4" />
          Buat Topik Pertanyaan Baru
        </button>
      </div>

      {/* Main Grid: Left Threads List, Right Active Thread Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Search & Threads List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik diskusi atau tag..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredThreads.map((thread) => {
              const isSelected = selectedThread?.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-100">
                        {thread.courseTitle.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400">{thread.createdAt}</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {thread.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600 truncate max-w-[120px]">
                      {thread.author}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {thread.replies.length} Jawaban
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Thread Detail & Replies */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {selectedThread ? (
            <>
              {/* Question Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {selectedThread.courseTitle}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedThread.views} Dilihat</span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {selectedThread.title}
                </h2>

                <div className="flex items-center gap-3 mt-4">
                  <img
                    src={selectedThread.authorAvatar}
                    alt={selectedThread.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedThread.author}</h4>
                    <p className="text-[11px] text-slate-400">
                      {selectedThread.authorRole} • Ditanyakan {selectedThread.createdAt}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedThread.content}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedThread.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Jawaban & Tanggapan ({selectedThread.replies.length})
                </h3>

                <div className="space-y-3">
                  {selectedThread.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-2xl border transition ${
                        reply.isInstructorAnswer
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={reply.authorAvatar}
                            alt={reply.author}
                            className="w-7 h-7 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {reply.author}
                              </span>
                              {reply.isInstructorAnswer && (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Solusi Guru
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onUpvoteReply(selectedThread.id, reply.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 bg-white rounded-lg border border-slate-200"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-bold text-[11px]">{reply.upvotes}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 pl-9 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box Composer */}
              <form onSubmit={handlePostReply} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Tulis Jawaban atau Solusi Anda:
                </label>
                <textarea
                  rows={3}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Ketik tanggapan atau penjelasan koding Anda..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Tanggapan
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Pilih pertanyaan di sebelah kiri untuk melihat pembahasan lengkap.
            </div>
          )}
        </div>
      </div>

      {/* Create New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Buat Topik Pertanyaan Baru
              </h3>
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <select
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Pemrograman Web & Mobile (PWPB)">Pemrograman Web & Mobile (PWPB)</option>
                  <option value="Pemrograman Berorientasi Objek (PBO)">Pemrograman Berorientasi Objek (PBO)</option>
                  <option value="Basis Data & Database Management (BD)">Basis Data & Database Management (BD)</option>
                  <option value="Pemodelan Perangkat Lunak & Agile (PPL)">Pemodelan Perangkat Lunak & Agile (PPL)</option>
                  <option value="Produk Kreatif & Kewirausahaan (PKK)">Produk Kreatif & Kewirausahaan (PKK)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pertanyaan / Masalah:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Bagaimana cara konfigurasi Foreign Key cascade di PostgreSQL?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detail Pertanyaan & Potongan Kode (Jika ada):
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Jelaskan langkah yang sudah dicoba dan pesan error yang muncul..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (Pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="React, Hook, State"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
                >
                  Terbitkan Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
