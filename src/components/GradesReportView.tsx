import React from 'react';
import {
  Award,
  Trophy,
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  CalendarCheck,
  Building2
} from 'lucide-react';
import { StudentReport, User } from '../types';
import { STUDENT_REPORT_DATA } from '../data/initialData';

interface GradesReportViewProps {
  currentUser: User;
}

export const GradesReportView: React.FC<GradesReportViewProps> = ({
  currentUser,
}) => {
  const report = STUDENT_REPORT_DATA;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            Transkrip & Rekap Nilai Akademik XII PPLG 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Laporan Capaian Kompetensi Kejuruan (Rapor Semester Ganjil 2025/2026).
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start"
        >
          <Printer className="w-4 h-4" />
          Cetak / Download Lembar Rapor
        </button>
      </div>

      {/* Rapor Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl shadow-lg shadow-indigo-100">
          <span className="text-xs font-semibold text-indigo-200 uppercase">Indeks Prestasi / Rata-Rata</span>
          <div className="text-3xl font-extrabold font-mono mt-2">{report.overallGpa}</div>
          <div className="mt-2 text-xs text-indigo-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Predikat A (Sangat Memuaskan)
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peringkat Kelas</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            #{report.rank} <span className="text-xs text-slate-400 font-normal">/ {report.totalStudents} Siswa</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">
            Top 5% Performa Kejuruan
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mata Pelajaran Tuntas</span>
            <GraduationCap className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {report.subjectScores?.length || 6} / {report.subjectScores?.length || 6}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            100% Memenuhi KKM Kejuruan
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status Kelulusan UKK</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-base font-extrabold text-indigo-900 mt-3">
            KOMPETEN (LULUS)
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Skema Junior Web Developer BNSP
          </p>
        </div>
      </div>

      {/* Official Certificate & Report Card Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Student Identity Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Nama Peserta Didik:</span>
            <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{report.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Nomor Induk Siswa Nasional (NISN):</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{report.nisn}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Kelas / Konsentrasi Keahlian:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">XII PPLG 2 (Software Engineering)</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Sekolah:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}</span>
          </div>
        </div>

        {/* Grade Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-2">No</th>
                <th className="py-3 px-3">Mata Pelajaran Kejuruan</th>
                <th className="py-3 px-3 text-center">Tugas (40%)</th>
                <th className="py-3 px-3 text-center">Kuis CBT (30%)</th>
                <th className="py-3 px-3 text-center">UAS Praktik (30%)</th>
                <th className="py-3 px-3 text-center font-bold text-indigo-700">Nilai Akhir</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3">Predikat Capaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report.subjectScores || []).map((item: any, idx: number) => (
                <tr key={item.courseId || idx} className="hover:bg-slate-50 transition font-medium">
                  <td className="py-4 px-2 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-4 px-3 font-bold text-slate-900">{item.courseName || item.courseTitle}</td>
                  <td className="py-4 px-3 text-center font-mono text-slate-700">{item.assignmentAvg}</td>
                  <td className="py-4 px-3 text-center font-mono text-slate-700">{item.quizAvg}</td>
                  <td className="py-4 px-3 text-center font-mono text-slate-700">{item.uasScore || item.finalExam}</td>
                  <td className="py-4 px-3 text-center font-mono font-extrabold text-indigo-600 text-base">
                    {item.finalScore}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs font-mono">
                      {item.letterGrade}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-xs font-semibold text-emerald-700">
                    {item.predicate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Endorsement Signature Section */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div className="space-y-12">
            <p>Mengetahui,<br /><strong>Kepala Program Keahlian PPLG</strong></p>
            <div>
              <p className="font-bold text-slate-900 underline">Ratna Kartika, S.T</p>
              <p className="text-[10px] text-slate-400">NIP: 198204122008012009</p>
            </div>
          </div>
          <div className="space-y-12">
            <p>Depok, 19 Agustus 2026<br /><strong>Guru Pengampu XII PPLG 2</strong></p>
            <div>
              <p className="font-bold text-slate-900 underline">Hendra Setiawan, M.Kom</p>
              <p className="text-[10px] text-slate-400">NIP: 198405122009031005</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
