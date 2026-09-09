import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Bell,
  Clock,
  Database,
  Layers,
  LogOut
} from 'lucide-react';
import { User, Announcement } from '../types';
import { api, DbServerStatus } from '../services/api';

interface NavbarProps {
  currentUser: User;
  onSwitchRole?: (role: any) => void;
  announcements: Announcement[];
  onOpenAnnouncements: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  announcements,
  onOpenAnnouncements,
  onOpenProfile,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [dbStatus, setDbStatus] = useState<DbServerStatus | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(`${timeStr} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getHealthStatus().then((status) => {
      if (status) setDbStatus(status);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  {import.meta.env.VITE_APP_TITLE || 'CITRA NEGARA LMS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Ujian Online & E-Learning Terpadu
              </p>
            </div>
          </div>

          {/* Center Info: Live Clock & System Status */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentTime || '07:00:00 WIB'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition bg-emerald-50 text-emerald-800 border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Online</span>
            </div>
          </div>

          {/* Right Actions: Notifications, Role Switcher, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                title="Pengumuman Sekolah"
              >
                <Bell className="w-5 h-5" />
                {announcements.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" /> Pengumuman Resmi Sekolah
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                      {announcements.length} Info
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2">
                    {announcements.map((item) => (
                      <div key={item.id} className="p-3 hover:bg-slate-50 rounded-xl transition text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenAnnouncements();
                      }}
                      className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1"
                    >
                      Buka Semua Pengumuman &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge (Static) */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${
              currentUser.role === 'student' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80' :
              currentUser.role === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
              currentUser.role === 'kurikulum' ? 'bg-cyan-50 text-cyan-700 border-cyan-200/80' :
              currentUser.role === 'kepalasekolah' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
              'bg-purple-50 text-purple-700 border-purple-200/80'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                currentUser.role === 'student' ? 'bg-indigo-500' :
                currentUser.role === 'teacher' ? 'bg-emerald-500' :
                currentUser.role === 'kurikulum' ? 'bg-cyan-500' :
                currentUser.role === 'kepalasekolah' ? 'bg-amber-500' :
                'bg-purple-500'
              }`} />
              <span className="capitalize">
                {currentUser.role === 'student' ? 'Siswa' :
                 currentUser.role === 'teacher' ? 'Guru' :
                 currentUser.role === 'kurikulum' ? 'Kurikulum' :
                 currentUser.role === 'kepalasekolah' ? 'Kepala Sekolah' : 'Admin IT'}
              </span>
            </div>

            {/* Profile Avatar Button (Clickable to open profile) */}
            <div className="flex items-center gap-2 pl-1">
              <button
                type="button"
                id="btn-navbar-profile"
                onClick={onOpenProfile}
                title="Buka Halaman Profil & Biodata Saya"
                className="group relative flex items-center gap-2 p-0.5 rounded-2xl hover:bg-slate-100 transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-600 group-hover:scale-105 transition shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-black text-slate-800 line-clamp-1 max-w-[120px] group-hover:text-indigo-600 transition">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold leading-none">
                    Profil Saya
                  </div>
                </div>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden sm:flex items-center gap-1 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                  title="Keluar ke Dashboard Pengunjung"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold hidden xl:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
