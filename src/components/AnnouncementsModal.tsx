import React from 'react';
import { Megaphone, X, Tag, Calendar, User, AlertCircle } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsModalProps {
  announcements: Announcement[];
  onClose: () => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  announcements,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-extrabold">
              Papan Pengumuman Resmi XII PPLG 2
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 divide-y divide-slate-100">
          {announcements.map((ann) => (
            <div key={ann.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  ann.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-800'
                    : ann.priority === 'important'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {ann.badge} • {ann.priority.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.date}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{ann.content}</p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Diumumkan oleh: <strong>{ann.author}</strong> ({ann.authorRole})
                  </span>
                </div>

                <div className="flex gap-1">
                  {ann.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
