import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Boxes,
  Network,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Course } from '../types';

interface CoursesViewProps {
  courses: Course[];
  onOpenCourse: (course: Course) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  onOpenCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Kejuruan Utama', 'Kewirausahaan & Softskills'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6" />;
      case 'Database':
        return <Database className="w-6 h-6" />;
      case 'Network':
        return <Network className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mata Pelajaran Kelas XII PPLG 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Materi kurikulum kejuruan perangkat lunak, modul teori, latihan praktikum, dan proyek.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mata pelajaran, guru, kode..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const completedCount = course.modules.filter((m) => m.completed).length;
          return (
            <div
              key={course.id}
              onClick={() => onOpenCourse(course)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top Banner with Gradient */}
                <div className={`p-6 bg-gradient-to-r ${course.gradient} text-white relative`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-black/20 backdrop-blur-md rounded-lg text-xs font-mono font-bold">
                      {course.code}
                    </span>
                    <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-bold">
                      {course.totalHours} JP
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3">
                    {getCourseIcon(course.iconName)}
                  </div>

                  <h3 className="font-extrabold text-lg text-white group-hover:underline">
                    {course.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Modules Summary */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Progres Modul</span>
                    <span className="font-bold text-indigo-600">
                      {completedCount}/{course.modules.length} Modul Selesai ({course.progress}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  {/* Modules Preview List */}
                  <div className="space-y-1.5 pt-2">
                    {course.modules.slice(0, 2).map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="p-2 bg-slate-50 rounded-xl text-xs flex items-center justify-between text-slate-700"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {mod.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{mod.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {mod.duration}
                        </span>
                      </div>
                    ))}
                    {course.modules.length > 2 && (
                      <div className="text-[11px] text-indigo-600 font-semibold text-center pt-1">
                        + {course.modules.length - 2} modul lainnya
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Instructor */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">
                    {course.instructor}
                  </span>
                </div>

                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  Buka <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
