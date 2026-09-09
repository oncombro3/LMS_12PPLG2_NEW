import React from 'react';
import {
  Building2,
  Users,
  Award,
  BarChart3,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { ExecutiveStats, UserRole } from '../types';
import { EXECUTIVE_DATA } from '../data/schoolData';

interface ExecutiveDashboardViewProps {
  userRole: UserRole;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({ userRole }) => {
  const stats: ExecutiveStats = EXECUTIVE_DATA;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
              {userRole === 'kepalasekolah' ? 'Laporan Kepala Sekolah' : 'Audit & Monitoring Kurikulum'}
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'} • 2025/2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Executive Academic & CBT Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Rekapitulasi ketercapaian nilai ujian online, analisis butir soal per mata pelajaran, dan tingkat kelulusan KKM.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">Tingkat Kelulusan KKM</div>
            <div className="text-2xl font-black text-white">{stats.averagePassRate}%</div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase">Total Siswa Aktif</div>
          <div className="text-2xl font-black text-slate-900">{stats.totalStudents} Siswa</div>
          <div className="text-[11px] text-slate-500">Kelas XII PPLG 1 & 2</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase">Rata-rata Nilai Sekolah</div>
          <div className="text-2xl font-black text-indigo-600">{stats.schoolAverageScore} / 100</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+3.4% dari semester lalu</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase">Ujian CBT Terselenggara</div>
          <div className="text-2xl font-black text-slate-900">{stats.totalExamsConducted} Sesi</div>
          <div className="text-[11px] text-slate-500">Ulangan Harian & PTS</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase">Partisipasi Ujian CBT</div>
          <div className="text-2xl font-black text-emerald-600">99.4%</div>
          <div className="text-[11px] text-slate-500">Keterlibatan Siswa</div>
        </div>
      </div>

      {/* Subject Average Performance Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Rata-rata Nilai & Daya Serap per Mata Pelajaran Produktif
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi ketercapaian standar KKM (75) pada setiap kompetensi keahlian PPLG.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            Tahun Ajaran 2025/2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Rata-rata Nilai</th>
                <th className="py-3 px-4">Siswa Lulus KKM</th>
                <th className="py-3 px-4">Remedial</th>
                <th className="py-3 px-4">Status Daya Serap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {stats.subjectAverages.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.subject}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-indigo-600 text-sm">
                    {sub.avgScore}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{sub.passingCount} Siswa</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">{sub.failingCount} Siswa</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Sangat Baik (A)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Level GPA Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
          Tingkat Partisipasi & Rata-rata Nilai Kelas (Angkatan XII & XI PPLG)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.classPerformances.map((c, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900">{c.className}</span>
                <span className="text-xs font-mono font-bold text-indigo-600">IPK: {c.gpa}</span>
              </div>
              <div className="text-xs text-slate-500">
                Siswa Aktif: <strong>{c.activeStudents} Orang</strong>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>Penyelesaian Ujian</span>
                  <span>{c.examCompletionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${c.examCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
