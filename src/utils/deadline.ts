/**
 * Utility helper to parse and evaluate deadlines with date and time precision (e.g. 09:00 WIB).
 */

export interface DeadlineStatus {
  isExpired: boolean;
  formatted: string;
  remainingText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  targetDate: Date | null;
}

const INDO_MONTHS: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7, ags: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9, oct: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11,
};

/**
 * Parse various Indonesian & ISO date-time strings into a valid JS Date object.
 */
export function parseDeadlineDate(raw: string | undefined | null): Date | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim();
  if (!clean) return null;

  // 1. Direct standard ISO / HTML datetime-local format: "2026-09-02T09:00", "2026-09-02 09:00", "2026-09-02T09:00:00"
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(clean)) {
    const d = new Date(clean.replace(' ', 'T'));
    if (!isNaN(d.getTime())) return d;
  }

  // 1b. Standard YYYY-MM-DD only
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(`${clean}T23:59:59`);
    if (!isNaN(d.getTime())) return d;
  }

  const now = new Date();

  // 2. Relative strings: "Hari Ini, 09:00 WIB", "Hari ini, 23:59", "Besok, 09:00 WIB"
  const lower = clean.toLowerCase();
  const timeMatch = clean.match(/(\d{1,2})[:.](\d{2})/);
  const hour = timeMatch ? parseInt(timeMatch[1], 10) : 23;
  const minute = timeMatch ? parseInt(timeMatch[2], 10) : 59;

  if (lower.startsWith('hari ini') || lower.startsWith('today')) {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  if (lower.startsWith('besok') || lower.startsWith('tomorrow')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  if (lower.startsWith('kemarin') || lower.startsWith('yesterday')) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  // 3. Indonesian format: "30 Agustus 2026, 09:00 WIB" or "19 Agu 2026, 12:00 WIB" or "30 Agustus 2026"
  const datePartsMatch = clean.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (datePartsMatch) {
    const day = parseInt(datePartsMatch[1], 10);
    const monthStr = datePartsMatch[2].toLowerCase();
    const year = parseInt(datePartsMatch[3], 10);
    const monthIndex = INDO_MONTHS[monthStr] ?? 0;

    const d = new Date(year, monthIndex, day, hour, minute, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // 4. Fallback try standard Date.parse
  const fallback = new Date(clean);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

/**
 * Check if the deadline has passed the current time.
 */
export function isDeadlineExpired(deadline: string | undefined | null): boolean {
  const targetDate = parseDeadlineDate(deadline);
  if (!targetDate) return false; // If cannot parse, don't lock out
  return targetDate.getTime() < Date.now();
}

/**
 * Get comprehensive deadline evaluation and formatted remaining time.
 */
export function getDeadlineStatus(deadline: string | undefined | null): DeadlineStatus {
  if (!deadline) {
    return {
      isExpired: false,
      formatted: 'Tidak ada batas waktu',
      remainingText: 'Fleksibel',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-200',
      targetDate: null,
    };
  }

  const targetDate = parseDeadlineDate(deadline);
  if (!targetDate) {
    return {
      isExpired: false,
      formatted: deadline,
      remainingText: 'Aktif',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      targetDate: null,
    };
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const isExpired = diffMs <= 0;

  // Format date readable with time
  const day = targetDate.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthName = months[targetDate.getMonth()];
  const year = targetDate.getFullYear();
  const hoursStr = String(targetDate.getHours()).padStart(2, '0');
  const minsStr = String(targetDate.getMinutes()).padStart(2, '0');
  const formatted = `${day} ${monthName} ${year}, ${hoursStr}:${minsStr} WIB`;

  if (isExpired) {
    const passedMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const passedHours = Math.floor(passedMins / 60);
    const passedDays = Math.floor(passedHours / 24);

    let passedText = 'Waktu habis';
    if (passedDays > 0) passedText = `Lewat ${passedDays} hari yang lalu`;
    else if (passedHours > 0) passedText = `Lewat ${passedHours} jam yang lalu`;
    else if (passedMins > 0) passedText = `Lewat ${passedMins} menit yang lalu`;

    return {
      isExpired: true,
      formatted,
      remainingText: passedText,
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      targetDate,
    };
  }

  // Active - calculate remaining time
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const remainingHours = Math.floor(totalMins / 60);
  const remainingDays = Math.floor(remainingHours / 24);
  const remainingMins = totalMins % 60;

  let remainingText = '';
  if (remainingDays > 0) {
    remainingText = `Sisa ${remainingDays} hari ${remainingHours % 24} jam`;
  } else if (remainingHours > 0) {
    remainingText = `Sisa ${remainingHours} jam ${remainingMins} mnt`;
  } else {
    remainingText = `Sisa ${remainingMins} menit`;
  }

  // Warning if less than 2 hours
  const isUrgent = totalMins <= 120;

  return {
    isExpired: false,
    formatted,
    remainingText,
    badgeBg: isUrgent ? 'bg-amber-50' : 'bg-emerald-50',
    badgeText: isUrgent ? 'text-amber-800' : 'text-emerald-700',
    badgeBorder: isUrgent ? 'border-amber-200' : 'border-emerald-200',
    targetDate,
  };
}

/**
 * Format a default datetime-local value (e.g. tomorrow at 09:00 or 23:59).
 */
export function getDefaultDateTimeInput(daysAhead = 1, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${h}:${m}`;
}

/**
 * Convert datetime-local value (YYYY-MM-DDTHH:mm) to Indonesian readable string: "2 Sep 2026, 09:00 WIB".
 */
export function formatDateTimeInputToIndo(val: string): string {
  if (!val) return 'Besok, 09:00 WIB';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;

  const day = d.getDate();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${monthName} ${year}, ${h}:${m} WIB`;
}
