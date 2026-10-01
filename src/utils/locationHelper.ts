import { INITIAL_USERS_ROSTER } from '../data/schoolData';
import { User } from '../types';

export interface SignatoriesInfo {
  schoolName: string;
  schoolCity: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolNpsn: string;
  schoolEmail: string;
  schoolWebsite: string;
  kepsek: {
    name: string;
    nip: string;
    roleLabel: string;
    school: string;
  };
  kurikulum: {
    name: string;
    nip: string;
    roleLabel: string;
    school: string;
  };
  guru: {
    name: string;
    nip: string;
    roleLabel: string;
    school: string;
  };
  printLocation: string;
  printDateIndo: string;
}

/**
 * Mendapatkan lokasi pencetak secara dinamis berdasarkan cache lokal,
 * browser timezone, atau reverse geolocation.
 */
export const getCachedPrintLocation = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user_print_location');
    if (saved && saved.trim()) return saved.trim();

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (tz.includes('Makassar')) return 'Kota Makassar';
        if (tz.includes('Jayapura')) return 'Kota Jayapura';
        if (tz.includes('Pontianak')) return 'Kota Pontianak';
      }
    } catch {
      // fallback
    }
  }
  return 'Kota Depok';
};

/**
 * Mencoba mendeteksi lokasi pencetak dari IP/Geolocation browser / API secara asinkron.
 */
export const detectPrintLocation = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'Kota Depok';

  const saved = localStorage.getItem('user_print_location');
  if (saved && saved.trim()) return saved.trim();

  // 1. Coba IP geolocation cepat via ipwho.is (sangat akurat untuk kota pengguna tanpa izin pop-up browser)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(1800) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.city) {
        const cleanCity = data.city
          .replace(/Kota\s+/i, '')
          .replace(/Kabupaten\s+/i, '')
          .trim();
        const fullCity = `Kota ${cleanCity}`;
        localStorage.setItem('user_print_location', fullCity);
        return fullCity;
      }
    }
  } catch {
    // lanjut ke navigator.geolocation jika IP lookup timeout
  }

  // 2. Coba Geolocation Browser
  try {
    if ('geolocation' in navigator) {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 2000,
          maximumAge: 600000,
        });
      });

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Reverse geocoding via OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { signal: AbortSignal.timeout(1800) }
      );

      if (response.ok) {
        const data = await response.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.county ||
          data.address?.state_district;

        if (city) {
          const cleanCity = city
            .replace(/Kota\s+/i, '')
            .replace(/Kabupaten\s+/i, '')
            .trim();
          const fullCity = `Kota ${cleanCity}`;
          localStorage.setItem('user_print_location', fullCity);
          return fullCity;
        }
      }
    }
  } catch {
    // Geolocation ditolak atau timeout, gunakan fallback
  }

  const fallback = 'Kota Depok';
  localStorage.setItem('user_print_location', fallback);
  return fallback;
};

/**
 * Menyimpan pilihan lokasi pencetak secara manual
 */
export const setManualPrintLocation = (location: string): void => {
  if (typeof window !== 'undefined' && location.trim()) {
    localStorage.setItem('user_print_location', location.trim());
  }
};

/**
 * Mengambil data pejabat pengesahan (Kepala Sekolah SMK Citra Negara, Kurikulum, dan Guru Pencetak)
 */
export const getSignatoriesInfo = (
  currentUser?: Partial<User> | null,
  customLocation?: string
): SignatoriesInfo => {
  const schoolName = 'SMK CITRA NEGARA';
  const schoolCity = 'Kota Depok';
  const schoolAddress = 'Jl. Tanah Baru No. 100, Beji, Kota Depok, Jawa Barat 16421';
  const schoolPhone = '(021) 7721-3344';
  const schoolNpsn = '20268845';
  const schoolEmail = 'info@smkcitranegara.sch.id';
  const schoolWebsite = 'www.smkcitranegara.sch.id';

  // 1. Data Kepala Sekolah SMK CITRA NEGARA
  const foundKepsek = INITIAL_USERS_ROSTER.find((u) => u.role === 'kepalasekolah');
  const kepsekName = foundKepsek?.name || 'Drs. H. Suryanto, M.M., M.Kom.';
  const kepsekNip = (foundKepsek as any)?.nip || '196811201994031002';

  // 2. Data Kurikulum SMK CITRA NEGARA
  const foundKurikulum = INITIAL_USERS_ROSTER.find((u) => u.role === 'kurikulum');
  const kurikulumName = foundKurikulum?.name || 'Dra. Hj. Siti Rahmawati, M.Pd.';
  const kurikulumNip = (foundKurikulum as any)?.nip || '197603152002122003';

  // 3. Data Guru / User yang Sedang Mencetak
  const guruName = currentUser?.name || 'Hendra Setiawan, S.Kom., M.Kom.';
  const guruNip = (currentUser as any)?.nip || currentUser?.id || '198405122009021004';
  const guruRoleLabel =
    currentUser?.role === 'teacher'
      ? (currentUser as any)?.titleRole || 'Guru Mata Pelajaran'
      : (currentUser as any)?.titleRole || 'Guru Pengampu / Yang Mencetak';

  // Tanggal Hari Ini Format Indonesia (contoh: 30 September 2026)
  const printDateIndo = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const printLocation = customLocation || getCachedPrintLocation();

  return {
    schoolName,
    schoolCity,
    schoolAddress,
    schoolPhone,
    schoolNpsn,
    schoolEmail,
    schoolWebsite,
    kepsek: {
      name: kepsekName,
      nip: kepsekNip,
      roleLabel: 'Kepala Sekolah SMK CITRA NEGARA',
      school: schoolName,
    },
    kurikulum: {
      name: kurikulumName,
      nip: kurikulumNip,
      roleLabel: 'Waka. Bidang Kurikulum SMK CITRA NEGARA',
      school: schoolName,
    },
    guru: {
      name: guruName,
      nip: guruNip,
      roleLabel: guruRoleLabel,
      school: schoolName,
    },
    printLocation,
    printDateIndo,
  };
};
