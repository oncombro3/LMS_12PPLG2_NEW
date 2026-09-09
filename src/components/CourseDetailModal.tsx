import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Code,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Play,
  Copy,
  Check
} from 'lucide-react';
import { Course, CourseModule } from '../types';

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
  onToggleModuleComplete: (courseId: string, moduleId: string) => void;
  onOpenSandboxWithCode: (code: string, language: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onToggleModuleComplete,
  onOpenSandboxWithCode,
}) => {
  const [selectedModule, setSelectedModule] = useState<CourseModule>(
    course.modules[0] || null
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white font-mono font-bold">
              {course.code.split('-')[1]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  {course.semester}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {course.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Modules List, Right Active Module Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Left Column: Modules List */}
          <div className="border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto max-h-[40vh] md:max-h-[calc(90vh-5rem)]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daftar Modul ({course.modules.length})
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {Math.round((course.modules.filter((m) => m.completed).length / course.modules.length) * 100)}% Selesai
              </span>
            </div>

            <div className="space-y-2">
              {course.modules.map((mod, idx) => {
                const isSelected = selectedModule?.id === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-md shadow-indigo-100 ring-1 ring-indigo-500'
                        : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModuleComplete(course.id, mod.id);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition"
                          title={mod.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                        >
                          {mod.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400">
                            Modul {idx + 1} • {mod.duration}
                          </span>
                          <h4 className={`text-xs font-bold ${
                            isSelected ? 'text-indigo-900' : 'text-slate-800'
                          }`}>
                            {mod.title.replace(/^Modul \d+: /, '')}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        mod.type === 'theory' ? 'bg-blue-50 text-blue-700' :
                        mod.type === 'practice' ? 'bg-emerald-50 text-emerald-700' :
                        mod.type === 'project' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {mod.type === 'theory' ? 'Teori' :
                         mod.type === 'practice' ? 'Praktikum' :
                         mod.type === 'project' ? 'Tugas Proyek' : 'Kuis'}
                      </span>
                      {isSelected && (
                        <span className="text-indigo-600 font-bold flex items-center text-[10px]">
                          Membaca <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Instructor Info Box */}
            <div className="mt-6 p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Guru Pengampu
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructor}
                  className="w-10 h-10 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{course.instructor}</h5>
                  <p className="text-[10px] text-slate-500">Guru Kejuruan PPLG</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Module Content Viewer */}
          <div className="md:col-span-2 p-6 overflow-y-auto max-h-[60vh] md:max-h-[calc(90vh-5rem)] bg-white space-y-6">
            {selectedModule ? (
              <>
                {/* Module Headline & Complete Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Durasi: {selectedModule.duration}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                      {selectedModule.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleModuleComplete(course.id, selectedModule.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                      selectedModule.completed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200'
                    }`}
                  >
                    {selectedModule.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Telah Diselesaikan
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Tandai Selesai Belajar
                      </>
                    )}
                  </button>
                </div>

                {/* Module Description */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Deskripsi Singkat:</p>
                  {selectedModule.description}
                </div>

                {/* Markdown / Learning Body */}
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedModule.contentMarkdown}
                </div>

                {/* Code Snippet Box with Sandbox Runner */}
                {selectedModule.codeSnippet && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                          Contoh Kode ({selectedModule.codeSnippet.language})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(selectedModule.codeSnippet!.code)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition flex items-center gap-1"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSandboxWithCode(
                              selectedModule.codeSnippet!.code,
                              selectedModule.codeSnippet!.language
                            );
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Uji di Sandbox</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{selectedModule.codeSnippet.code}</code>
                    </pre>

                    <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-400">
                      💡 <strong className="text-slate-300">Penjelasan:</strong> {selectedModule.codeSnippet.explanation}
                    </div>
                  </div>
                )}

                {/* Downloadable / External Resources */}
                {selectedModule.resources && selectedModule.resources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Materi & Berkas Pendukung:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedModule.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition flex items-center justify-between text-xs text-slate-700"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="font-semibold truncate">{res.title}</span>
                          </div>
                          {res.size && (
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                              {res.size}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Pilih modul di sebelah kiri untuk melihat materi pembelajaran.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
