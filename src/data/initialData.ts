import {
  User,
  Course,
  Assignment,
  Quiz,
  AttendanceRecord,
  Announcement,
  DiscussionThread,
  StudentReport
} from '../types';

export const CURRENT_STUDENT: User = {
  id: 'std-001',
  name: 'Muhammad Farhan',
  nisn: '0068124921',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4',
  email: 'farhan.12pplg2@smk-tarunabhakti.sch.id',
  class: 'XII PPLG 2',
  points: 1420,
  attendanceRate: 98,
  streakDays: 14,
};

export const CURRENT_TEACHER: User = {
  id: 'tch-001',
  name: 'Hendra Setiawan, M.Kom',
  nisn: '198405122009031005',
  role: 'teacher',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HendraTeacher&backgroundColor=b6e3f4',
  email: 'hendra.setiawan@smk-tarunabhakti.sch.id',
  class: 'Guru Pengampu XII PPLG 2',
  points: 4200,
  attendanceRate: 100,
  streakDays: 45,
};

export const CURRENT_ADMIN: User = {
  id: 'adm-001',
  name: 'Admin Kurikulum RPL/PPLG',
  nisn: '197903152005011002',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FarhanTech&backgroundColor=b6e3f4',
  email: 'admin.kurikulum@smk-tarunabhakti.sch.id',
  class: 'Pusat Kendali Sistem PPLG',
  points: 9999,
  attendanceRate: 100,
  streakDays: 120,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'pwpb-12',
    code: 'PPLG-301',
    title: 'Pemrograman Web & Mobile (PWPB)',
    instructor: 'Hendra Setiawan, M.Kom',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HendraTeacher&backgroundColor=b6e3f4',
    description: 'Pengembangan full-stack web modern menggunakan React 19, TypeScript, Express API, Tailwind CSS, dan arsitektur RESTful.',
    iconName: 'Code2',
    gradient: 'from-blue-600 to-indigo-600',
    category: 'Kejuruan Utama',
    semester: 'Ganjil 2025/2026',
    totalHours: 72,
    progress: 75,
    modules: [
      {
        id: 'mod-pwpb-1',
        courseId: 'pwpb-12',
        title: 'Modul 1: React State Management & Custom Hooks',
        duration: '4 JP (180 Menit)',
        type: 'theory',
        description: 'Mendalami penggunaan useState, useEffect, useReducer, dan pembuatan custom hooks untuk arsitektur front-end modular.',
        contentMarkdown: `### Pemrograman Web Modern: Custom Hooks & State Pattern
Dalam pengembangan aplikasi skala industri, pemisahan business logic dari komponen presentational sangat krusial.

#### Poin Utama:
1. **Aturan Dasar Hooks**: Selalu panggil hook di level teratas komponen functional.
2. **Kustom Hook**: Fungsi JavaScript yang diawali dengan kata \`use\` dan dapat memanggil hook standar lainnya.
3. **Memoization**: Mengoptimasi render ulang menggunakan \`useMemo\` dan \`useCallback\`.`,
        codeSnippet: {
          language: 'typescript',
          code: `import { useState, useEffect } from 'react';

// Custom Hook untuk fetching data async dengan status
export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(url);
        if (!res.ok) throw new Error(\`HTTP error! Status: \${res.status}\`);
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [url]);

  return { data, loading, error };
}`,
          explanation: 'Custom hook ini mengenkapsulasi status loading, error, dan data payload secara aman dari memory leak dengan isMounted cleanup.'
        },
        resources: [
          { id: 'r1', title: 'Slide Presentasi: Advanced React Hooks.pdf', url: '#', type: 'pdf', size: '2.4 MB' },
          { id: 'r2', title: 'Repositori GitHub Template PWPB 12', url: 'https://github.com', type: 'github' }
        ],
        completed: true
      },
      {
        id: 'mod-pwpb-2',
        courseId: 'pwpb-12',
        title: 'Modul 2: RESTful API Integration & Error Handling',
        duration: '6 JP (270 Menit)',
        type: 'practice',
        description: 'Membangun koneksi client-server dengan interceptor Axios/Fetch, penanganan response status code HTTP, dan skeleton loader.',
        contentMarkdown: `### Standar RESTful API & HTTP Methods
Pelajari konvensi status code:
- **200 OK / 201 Created**: Request berhasil
- **400 Bad Request**: Validasi gagal dari client
- **401 Unauthorized / 403 Forbidden**: Kendala otentikasi/hak akses token
- **500 Internal Server Error**: Bug atau error tak tertangani di sisi backend`,
        codeSnippet: {
          language: 'javascript',
          code: `// Contoh Interceptor HTTP Request Wrapper
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: \`Bearer \${token}\` }),
    ...options.headers,
  };

  const response = await fetch(\`/api\${endpoint}\`, { ...options, headers });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || \`Server Error: \${response.status}\`);
  }
  return response.json();
}`,
          explanation: 'Fungsi utility apiRequest otomatis menyuntikkan token Authorization Bearer header ke setiap request outbound.'
        },
        resources: [
          { id: 'r3', title: 'Cheatsheet HTTP Status Codes.pdf', url: '#', type: 'pdf', size: '1.1 MB' }
        ],
        completed: true
      },
      {
        id: 'mod-pwpb-3',
        courseId: 'pwpb-12',
        title: 'Modul 3: Full-Stack Project - Mini E-Commerce / LMS Service',
        duration: '8 JP (360 Menit)',
        type: 'project',
        description: 'Tugas besar kolaboratif mengimplementasikan CRUD produk, sistem cart, serta autentikasi JWT.',
        contentMarkdown: `### Instruksi Project Akhir Semester
Setiap siswa XII PPLG 2 wajib menyelesaikan aplikasi web fungsional yang menggabungkan:
1. Otentikasi Role-based (Admin & Siswa/User)
2. Operasi CRUD komprehensif
3. State persistensi (LocalStorage / Cloud DB)
4. UI responsif ramah smartphone (Mobile-First)`,
        resources: [
          { id: 'r4', title: 'Panduan Rubrik Penilaian Portofolio.pdf', url: '#', type: 'pdf', size: '3.8 MB' }
        ],
        completed: false
      }
    ]
  },
  {
    id: 'pbo-12',
    code: 'PPLG-302',
    title: 'Pemrograman Berorientasi Objek (PBO)',
    instructor: 'Bu Sri Wahyuni, S.Kom',
    instructorAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DewiTeacher&backgroundColor=ffd5dc',
    description: 'Penerapan konsep OOP lanjutan: Pewarisan, Polimorfisme, Abstraksi, Interface, serta Design Pattern (Singleton, Factory, MVC) dalam Java & C#.',
    iconName: 'Boxes',
    gradient: 'from-amber-600 to-orange-600',
    category: 'Kejuruan Utama',
    semester: 'Ganjil 2025/2026',
    totalHours: 64,
    progress: 80,
    modules: [
      {
        id: 'mod-pbo-1',
        courseId: 'pbo-12',
        title: 'Modul 1: Pilar 4 OOP & Encapsulation di Java',
        duration: '4 JP (180 Menit)',
        type: 'theory',
        description: 'Menguasai Abstraction, Encapsulation, Inheritance, dan Polymorphism secara mendalam.',
        contentMarkdown: `### 4 Pilar Utama Object-Oriented Programming
- **Encapsulation**: Menyembunyikan data internal menggunakan modifier \`private\` dan getter/setter.
- **Inheritance**: Menurunkan sifat class induk (\`extends\`) untuk kode yang reusable.
- **Polymorphism**: Metode yang sama memiliki perilaku berbeda (Overriding & Overloading).
- **Abstraction**: Menyediakan kerangka cetak biru interface / abstract class tanpa implementasi detail.`,
        codeSnippet: {
          language: 'java',
          code: `// Contoh Penerapan Interface & Polymorphism
public interface PembayaranService {
    boolean prosesTransaksi(double nominal);
    String getInvoiceNumber();
}

public class QrisPembayaran implements PembayaranService {
    private String idTransaksi;

    public QrisPembayaran(String id) {
        this.idTransaksi = id;
    }

    @Override
    public boolean prosesTransaksi(double nominal) {
        System.out.println("Scan QRIS Rp " + nominal + " Berhasil diverifikasi!");
        return true;
    }

    @Override
    public String getInvoiceNumber() {
        return "QRIS-" + this.idTransaksi;
    }
}`,
          explanation: 'Penggunaan Interface PembayaranService memungkinkan sistem memproses berbagai metode pembayaran (QRIS, Transfer, Virtual Account) secara polimorfis.'
        },
        resources: [
          { id: 'r5', title: 'Buku Ajar PBO Kelas XII SMK.pdf', url: '#', type: 'pdf', size: '5.2 MB' }
        ],
        completed: true
      },
      {
        id: 'mod-pbo-2',
        courseId: 'pbo-12',
        title: 'Modul 2: Design Pattern Singleton & Factory',
        duration: '4 JP (180 Menit)',
        type: 'practice',
        description: 'Menerapkan pola desain perangkat lunak standar industri untuk koneksi database tunggal dan pembuatan objek terpusat.',
        contentMarkdown: `### Software Design Patterns
Memahami kapan harus menggunakan pattern Singleton (misal: Database Connection Manager) dan Factory Pattern (Object Creator).`,
        resources: [
          { id: 'r6', title: 'Contoh Kode Java Gang of Four Patterns.zip', url: '#', type: 'doc', size: '1.5 MB' }
        ],
        completed: true
      }
    ]
  },
  {
    id: 'db-12',
    code: 'PPLG-303',
    title: 'Basis Data & Database Management (BD)',
    instructor: 'Pak Budi Prasetyo, M.T',
    instructorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=ProfAris&backgroundColor=ffd5dc',
    description: 'Perancangan basis data relasional tingkat lanjut, Normalisasi 1NF-3NF, Subquery, Trigger, Stored Procedure, Indexing, dan NoSQL.',
    iconName: 'Database',
    gradient: 'from-emerald-600 to-teal-600',
    category: 'Kejuruan Utama',
    semester: 'Ganjil 2025/2026',
    totalHours: 56,
    progress: 60,
    modules: [
      {
        id: 'mod-db-1',
        courseId: 'db-12',
        title: 'Modul 1: Normalisasi Database & Relasi Foreign Key',
        duration: '4 JP (180 Menit)',
        type: 'theory',
        description: 'Menghilangkan redundansi data anomali update/delete dengan teknik Normalisasi 1NF hingga 3NF.',
        contentMarkdown: `### Aturan Normalisasi Database
1. **1NF**: Setiap kolom bernilai atomik (tidak ada multiple values / array dalam 1 sel).
2. **2NF**: Memenuhi 1NF dan tidak memiliki ketergantungan parsial (Partial Dependency).
3. **3NF**: Memenuhi 2NF dan tidak memiliki ketergantungan transitif (Transitive Dependency).`,
        codeSnippet: {
          language: 'sql',
          code: `-- Pembuatan Schema Siswa, Kelas, dan Nilai Tugas
CREATE TABLE kelas (
    id_kelas VARCHAR(10) PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    guru_pembimbing VARCHAR(100)
);

CREATE TABLE siswa (
    nisn VARCHAR(20) PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    id_kelas VARCHAR(10) REFERENCES kelas(id_kelas) ON DELETE CASCADE
);

CREATE TABLE nilai_tugas (
    id_nilai SERIAL PRIMARY KEY,
    nisn VARCHAR(20) REFERENCES siswa(nisn),
    judul_tugas VARCHAR(150),
    skor NUMERIC(5,2) CHECK (skor >= 0 AND skor <= 100),
    tanggal_kumpul TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
          explanation: 'Query DDL PostgreSQL di atas mengimplementasikan integritas referensial Foreign Key dan validasi CHECK constraint pada skor nilai.'
        },
        resources: [
          { id: 'r7', title: 'ERD Diagram Master Data 12 PPLG.pdf', url: '#', type: 'pdf', size: '1.8 MB' }
        ],
        completed: true
      },
      {
        id: 'mod-db-2',
        courseId: 'db-12',
        title: 'Modul 2: Advanced SQL - Aggregations, JOIN & Triggers',
        duration: '6 JP (270 Menit)',
        type: 'practice',
        description: 'Menulis query kompleks dengan INNER/LEFT/RIGHT JOIN, GROUP BY, HAVING, Window Functions, dan Trigger otomatis.',
        contentMarkdown: `### Pembuatan Trigger Log Audit
Mengotomasi pencatatan waktu pembaruan tabel secara real-time.`,
        resources: [
          { id: 'r8', title: 'Latihan SQL Query Tantangan PPLG.pdf', url: '#', type: 'pdf', size: '950 KB' }
        ],
        completed: false
      }
    ]
  },
  {
    id: 'ppl-12',
    code: 'PPLG-304',
    title: 'Pemodelan Perangkat Lunak & Agile (PPL)',
    instructor: 'Bu Ratna Kartika, S.T',
    instructorAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=RatnaTeacher&backgroundColor=d1d4f9',
    description: 'Metodologi rekayasa perangkat lunak modern: Scrum sprint, User Story, Use Case Diagram, Activity Diagram, Class Diagram, dan Git Workflow.',
    iconName: 'Network',
    gradient: 'from-purple-600 to-pink-600',
    category: 'Kejuruan Utama',
    semester: 'Ganjil 2025/2026',
    totalHours: 48,
    progress: 90,
    modules: [
      {
        id: 'mod-ppl-1',
        courseId: 'ppl-12',
        title: 'Modul 1: Standar Dokumentasi UML (Use Case & Activity)',
        duration: '4 JP (180 Menit)',
        type: 'theory',
        description: 'Membuat diagram alir sistem perangkat lunak yang sesuai dengan standar IEEE Software Requirements Specification (SRS).',
        contentMarkdown: `### Unified Modeling Language (UML)
UML merupakan bahasa visual standar untuk menspesifikasikan, memvisualisasikan, dan mendokumentasikan artifak sistem software.`,
        resources: [
          { id: 'r9', title: 'Template Dokumen SRS Standar.docx', url: '#', type: 'doc', size: '820 KB' }
        ],
        completed: true
      }
    ]
  },
  {
    id: 'pkk-12',
    code: 'PPLG-305',
    title: 'Produk Kreatif & Kewirausahaan (PKK)',
    instructor: 'Pak Ahmad Fauzi, S.E., M.M',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FauziTeacher&backgroundColor=c0aede',
    description: 'Inkubasi startup digital, pembuatan Business Model Canvas (BMC), perhitungan Harga Pokok Penjualan (HPP), dan presentasi Pitch Deck.',
    iconName: 'Sparkles',
    gradient: 'from-rose-600 to-amber-600',
    category: 'Kewirausahaan & Softskills',
    semester: 'Ganjil 2025/2026',
    totalHours: 52,
    progress: 50,
    modules: [
      {
        id: 'mod-pkk-1',
        courseId: 'pkk-12',
        title: 'Modul 1: Penyusunan Business Model Canvas (BMC)',
        duration: '4 JP (180 Menit)',
        type: 'theory',
        description: 'Merancang 9 blok fondasi bisnis produk aplikasi perangkat lunak (Value Proposition, Customer Segment, Revenue Stream).',
        contentMarkdown: `### 9 Elemen Business Model Canvas
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure`,
        resources: [
          { id: 'r10', title: 'Template BMC Interaktif.pdf', url: '#', type: 'pdf', size: '1.2 MB' }
        ],
        completed: true
      }
    ]
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    courseId: 'pwpb-12',
    courseTitle: 'Pemrograman Web & Mobile (PWPB)',
    title: 'Tugas 01: Implementasi Custom Hook Todo Filter & LocalStorage',
    description: 'Buatlah custom hook React `useLocalStorage` dan gunakan untuk menyimpan state filter tugas secara otomatis di browser.',
    instructions: [
      'Gunakan TypeScript dengan tipe data generik <T>',
      'Tangani kasus bila localStorage browser dinonaktifkan atau parsing JSON gagal (try-catch)',
      'Sertakan tombol untuk toggle filter kategori dan search query',
      'Tulis kode yang rapi dan sertakan komentar penjelasan'
    ],
    deadline: '2026-08-25T23:59:00',
    maxScore: 100,
    language: 'typescript',
    starterCode: `import React, { useState, useEffect } from 'react';

// Tulis fungsi useLocalStorage kustom kamu di sini:
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Implementasikan logic state dan synchronization
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorage<string[]>('pplg_todos', ['Belajar React 19', 'Latihan SQL Join']);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim()) return;
    setTodos([...todos, input.trim()]);
    setInput('');
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-3">Daftar Tugas 12 PPLG 2</h2>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis tugas baru..." 
          className="border p-2 rounded flex-1"
        />
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded">
          Tambah
        </button>
      </div>
      <ul className="space-y-1">
        {todos.map((t, idx) => (
          <li key={idx} className="p-2 bg-slate-100 rounded text-sm">{t}</li>
        ))}
      </ul>
    </div>
  );
}`,
    status: 'submitted',
    mySubmission: {
      id: 'sub-01',
      studentId: 'std-001',
      studentName: 'Muhammad Farhan',
      submittedAt: '2026-08-18T14:20:00',
      codeContent: '// Telah diuji di browser dan berhasil menyimpan nilai persistent.',
      githubUrl: 'https://github.com/oncombro3/LMS_12PPLG2_NEW/tree/main/tugas-01',
      status: 'graded',
      grade: 95,
      feedback: 'Kerja bagus Farhan! Penanganan try-catch JSON parsing sangat solid dan rapi.'
    },
    allSubmissions: [
      {
        id: 'sub-01',
        studentId: 'std-001',
        studentName: 'Muhammad Farhan',
        submittedAt: '2026-08-18T14:20:00',
        githubUrl: 'https://github.com/oncombro3/LMS_12PPLG2_NEW/tree/main/tugas-01',
        status: 'graded',
        grade: 95,
        feedback: 'Sangat baik dan terstruktur rapi!'
      },
      {
        id: 'sub-02',
        studentId: 'std-002',
        studentName: 'Ahmad Rizky Pratama',
        submittedAt: '2026-08-18T16:05:00',
        githubUrl: 'https://github.com/rizky/tugas-custom-hook',
        status: 'submitted',
        grade: undefined,
        feedback: undefined
      }
    ]
  },
  {
    id: 'asg-02',
    courseId: 'db-12',
    courseTitle: 'Basis Data & Database Management (BD)',
    title: 'Tugas 02: Perancangan Skema Database Sistem Presensi Siswa',
    description: 'Tulis script SQL lengkap (DDL dan DML) untuk sistem absensi SMK yang mencakup tabel siswa, kelas, jadwal, dan riwayat presensi harian.',
    instructions: [
      'Gunakan ENUM atau CHECK constraint untuk status kehadiran (Hadir, Sakit, Izin, Alpa)',
      'Gunakan FOREIGN KEY dengan ON DELETE CASCADE / SET NULL yang tepat',
      'Buat minimal 1 INDEX pada kolom tanggal untuk mengoptimasi query rekap bulanan',
      'Sertakan 5 baris data dummy untuk pengujian'
    ],
    deadline: '2026-08-28T23:59:00',
    maxScore: 100,
    language: 'sql',
    starterCode: `-- Tulis Script DDL PostgreSQL Anda di bawah ini:
CREATE TABLE ref_status_presensi (
    kode_status VARCHAR(10) PRIMARY KEY,
    keterangan VARCHAR(50) NOT NULL
);

INSERT INTO ref_status_presensi VALUES 
('HADIR', 'Siswa hadir di ruang kelas'),
('IZIN', 'Siswa mengajukan surat izin resmi'),
('SAKIT', 'Siswa sakit dengan surat dokter'),
('ALPA', 'Tanpa keterangan');

-- Lengkapi tabel presensi_harian:
`,
    status: 'pending'
  },
  {
    id: 'asg-03',
    courseId: 'pbo-12',
    courseTitle: 'Pemrograman Berorientasi Objek (PBO)',
    title: 'Tugas 03: Implementasi Factory Pattern pada Sistem Game Inventory',
    description: 'Rancang kelas WeaponFactory di Java yang dapat menginstansiasi objek pedang (Sword), panah (Bow), dan tongkat sihir (Staff) secara dinamis.',
    instructions: [
      'Gunakan abstract class atau interface `Weapon`',
      'Terapkan method `attack()` dengan output formula damage yang berbeda',
      'Cegah instansiasi langsung menggunakan constructor private atau package-private'
    ],
    deadline: '2026-09-02T23:59:00',
    maxScore: 100,
    language: 'java',
    starterCode: `public interface Weapon {
    void attack();
    int getBaseDamage();
}

public class Sword implements Weapon {
    @Override
    public void attack() {
        System.out.println("Slash! Physical Damage: " + getBaseDamage());
    }
    @Override
    public int getBaseDamage() { return 45; }
}

public class WeaponFactory {
    public static Weapon createWeapon(String type) {
        // Lengkapi factory logic
        return null;
    }
}`,
    status: 'pending'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-01',
    courseId: 'pwpb-12',
    courseTitle: 'Pemrograman Web & Mobile (PWPB)',
    title: 'Kuis Evaluasi 1: React Fundamentals & TypeScript',
    description: 'Uji pemahaman seputar Hook Lifecycle, State Immutability, Virtual DOM, dan Generics di TypeScript.',
    durationMinutes: 15,
    totalQuestions: 5,
    passingScore: 75,
    isCompleted: true,
    lastScore: 90,
    completedAt: '2026-08-17T10:30:00',
    questions: [
      {
        id: 'q1',
        question: 'Mengapa kita tidak boleh mengubah (mutate) state React secara langsung seperti `state.items.push(newItem)`?',
        options: [
          'Karena JavaScript akan melempar SyntaxError runtime',
          'Karena React membandingkan memory reference objek sebelumnya untuk mendeteksi perubahan state dan memicu re-render',
          'Karena push() hanya berfungsi pada tipe data String bukan Array',
          'Karena TypeScript melarang semua method mutasi secara otomatis'
        ],
        correctIndex: 1,
        explanation: 'React mengandalkan immutability. Jika reference array/objek tidak berubah, mekanisme shallow comparison React menganggap tidak ada perubahan, sehingga komponen gagal re-render.'
      },
      {
        id: 'q2',
        question: 'Perhatikan kode berikut. Kapan fungsi cleanup di dalam `useEffect` akan dieksekusi?',
        codeSnippet: `useEffect(() => {
  const timer = setInterval(() => console.log('Tick'), 1000);
  return () => clearInterval(timer);
}, [count]);`,
        language: 'typescript',
        options: [
          'Hanya saat browser pertama kali dibuka',
          'Tepat sebelum efek berikutnya dijalankan (ketika nilai count berubah) serta saat komponen di-unmount',
          'Hanya saat tombol refresh ditekan',
          'Setiap milidetik secara kontinu di background thread'
        ],
        correctIndex: 1,
        explanation: 'Fungsi cleanup dieksekusi sebelum effect berikutnya berjalan ulang jika dependencies berubah, dan ketika komponen dilepas (unmounted) dari DOM tree.'
      },
      {
        id: 'q3',
        question: 'Manakah cara yang benar dalam TypeScript untuk mendefinisikan interface komponen React dengan children prop?',
        options: [
          'interface Props { children: React.ReactNode; title: string; }',
          'interface Props { children: string[]; title: any; }',
          'interface Props { children: HTMLElement; }',
          'interface Props { children: boolean; }'
        ],
        correctIndex: 0,
        explanation: 'Tipe React.ReactNode mencakup semua elemen yang valid di-render di React (JSX, strings, numbers, fragments, atau null).'
      },
      {
        id: 'q4',
        question: 'Apa fungsi utama dari React 18+ Server Components (RSC)?',
        options: [
          'Menghapus penggunaan CSS di client side',
          'Merender komponen secara eksklusif di server tanpa menyertakan JavaScript bundle komponen tersebut ke client',
          'Menggantikan fungsi web browser secara total',
          'Mengharuskan semua state disimpan di file lokal .txt'
        ],
        correctIndex: 1,
        explanation: 'Server Components mengurangi ukuran bundle JavaScript di sisi browser karena dependensi dan logika server-side dieksekusi langsung di server.'
      },
      {
        id: 'q5',
        question: 'HTTP Method manakah yang bersifat Idempotent dalam standar RESTful API?',
        options: [
          'POST saja',
          'GET, PUT, dan DELETE',
          'PATCH saja',
          'Semua HTTP methods tidak ada yang idempotent'
        ],
        correctIndex: 1,
        explanation: 'Operasi idempotent menghasilkan efek akhir yang sama pada server meskipun dipanggil 1 kali maupun berkali-kali (GET, PUT, DELETE).'
      }
    ]
  },
  {
    id: 'quiz-02',
    courseId: 'db-12',
    courseTitle: 'Basis Data & Database Management (BD)',
    title: 'Kuis Evaluasi 2: Relational Queries & Indexing Strategies',
    description: 'Pengujian seputar JOIN performance, B-Tree Index, dan integritas transaksi ACID.',
    durationMinutes: 20,
    totalQuestions: 4,
    passingScore: 70,
    isCompleted: false,
    questions: [
      {
        id: 'qd1',
        question: 'Apa perbedaan utama antara INNER JOIN dan LEFT JOIN pada SQL?',
        options: [
          'INNER JOIN hanya menampilkan baris yang memiliki kecocokan di kedua tabel, sedangkan LEFT JOIN menampilkan semua baris dari tabel kiri',
          'LEFT JOIN hanya bekerja pada database SQLite',
          'INNER JOIN selalu membatalkan transaksi jika ada data NULL',
          'Tidak ada perbedaan'
        ],
        correctIndex: 0,
        explanation: 'INNER JOIN menyaring data yang cocok di kedua sisi, sedangkan LEFT JOIN tetap menyertakan record dari tabel kiri meskipun di tabel kanan bernilai NULL.'
      },
      {
        id: 'qd2',
        question: 'Dalam prinsip ACID pada basis data, huruf "I" mewakili apa dan apa maknanya?',
        options: [
          'Indexation: Mempercepat kecepatan pencarian',
          'Isolation: Memastikan transaksi yang berjalan bersamaan tidak saling menginterferensi hasil sementara',
          'Integration: Menggabungkan data cloud secara real-time',
          'Iteration: Kemampuan menjalankan perulangan SQL'
        ],
        correctIndex: 1,
        explanation: 'Isolation menjamin transaksi paralel berjalan secara independen seolah-olah terjadi secara berurutan tanpa race condition.'
      },
      {
        id: 'qd3',
        question: 'Kapan pembuatan INDEX pada kolom database TIDAK disarankan?',
        options: [
          'Pada kolom yang sering digunakan di klausa WHERE',
          'Pada kolom Foreign Key',
          'Pada tabel kecil dengan frekuensi INSERT/UPDATE sangat tinggi dan jarang di-query',
          'Pada kolom Primary Key'
        ],
        correctIndex: 2,
        explanation: 'Index menambah overhead penulisan (write overhead) setiap kali data di-insert atau di-update, sehingga tabel kecil berfrekuensi tulis tinggi tidak memerlukan index berlebih.'
      },
      {
        id: 'qd4',
        question: 'Perintah SQL manakah yang digunakan untuk membatalkan seluruh perubahan dalam blok transaksi yang gagal?',
        options: [
          'COMMIT;',
          'ROLLBACK;',
          'ABORT CASCADE;',
          'DELETE ALL;'
        ],
        correctIndex: 1,
        explanation: 'ROLLBACK mengembalikan status database ke titik sebelum transaksi dimulai jika terjadi kesalahan selama eksekusi.'
      }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2026-08-18',
    time: '06:55 WIB',
    subject: 'Pemrograman Web & Mobile (PWPB)',
    status: 'Hadir',
    location: 'Lab Komputer PPLG 2 (Ruang 304)',
    notes: 'Tepat waktu sebelum bel masuk jam ke-1',
    verifiedByTeacher: true
  },
  {
    id: 'att-2',
    date: '2026-08-17',
    time: '07:00 WIB',
    subject: 'Upacara HUT RI & Basis Data',
    status: 'Hadir',
    location: 'Lapangan Utama & Lab Basis Data',
    notes: 'Hadir lengkap seragam seremonial',
    verifiedByTeacher: true
  },
  {
    id: 'att-3',
    date: '2026-08-15',
    time: '06:48 WIB',
    subject: 'Pemrograman Berorientasi Objek (PBO)',
    status: 'Hadir',
    location: 'Lab Rekayasa Perangkat Lunak 1',
    notes: 'Presensi biometrik & selfie tervalidasi',
    verifiedByTeacher: true
  },
  {
    id: 'att-4',
    date: '2026-08-14',
    time: '06:52 WIB',
    subject: 'Pemodelan Perangkat Lunak & Agile (PPL)',
    status: 'Hadir',
    location: 'Lab Komputer PPLG 2',
    notes: 'Daily standup scrum sprint 2',
    verifiedByTeacher: true
  },
  {
    id: 'att-5',
    date: '2026-08-13',
    time: '07:15 WIB',
    subject: 'Produk Kreatif & Kewirausahaan (PKK)',
    status: 'Hadir',
    location: 'Coworking Space Taruna Bhakti',
    notes: 'Presentasi pitch deck produk',
    verifiedByTeacher: true
  }
];

export const CLASS_STUDENTS_ROSTER = [
  { id: 'std-001', name: 'Muhammad Farhan', nisn: '0068124921', status: 'Hadir', time: '06:55 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4', gpa: 92.4 },
  { id: 'std-002', name: 'Ahmad Rizky Pratama', nisn: '0068124922', status: 'Hadir', time: '06:58 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aditya&backgroundColor=c0aede', gpa: 89.1 },
  { id: 'std-003', name: 'Anindya Putri Kirana', nisn: '0068124923', status: 'Hadir', time: '06:45 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anisa&backgroundColor=ffd5dc', gpa: 94.8 },
  { id: 'std-004', name: 'Bagas Aditya Nugraha', nisn: '0068124924', status: 'Izin', time: '-', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bintang&backgroundColor=d1d4f9', gpa: 86.5 },
  { id: 'std-005', name: 'Cantika Dewi Lestari', nisn: '0068124925', status: 'Hadir', time: '06:50 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Cantika&backgroundColor=ffdfbf', gpa: 91.0 },
  { id: 'std-006', name: 'Dafa Arya Pratama', nisn: '0068124926', status: 'Hadir', time: '07:02 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dafa&backgroundColor=b6e3f4', gpa: 87.2 },
  { id: 'std-007', name: 'Eka Nur Fadhilah', nisn: '0068124927', status: 'Sakit', time: '-', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Eka&backgroundColor=bbf7d0', gpa: 88.6 },
  { id: 'std-008', name: 'Fikri Haikal Rahman', nisn: '0068124928', status: 'Hadir', time: '06:40 WIB', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fikri&backgroundColor=d1d4f9', gpa: 93.0 }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Jadwal Uji Kompetensi Keahlian (UKK) & Sertifikasi BNSP 2026',
    author: 'Admin Kurikulum RPL/PPLG',
    authorRole: 'Kepala Program Keahlian',
    date: '18 Agustus 2026',
    badge: 'Penting',
    priority: 'urgent',
    content: 'Diberitahukan kepada seluruh siswa kelas XII PPLG 2 bahwa pra-asesmen UKK skema Junior Web Developer dan Database Administrator BNSP akan diselenggarakan pada pekan ke-2 September. Pastikan seluruh repositori GitHub dan portofolio proyek sudah terorganisir.',
    tags: ['UKK 2026', 'Sertifikasi BNSP', 'Portofolio']
  },
  {
    id: 'ann-2',
    title: 'Update Deadline Tugas Besar PWPB Modul 3: Mini E-Commerce',
    author: 'Hendra Setiawan, M.Kom',
    authorRole: 'Guru Pengampu PWPB',
    date: '16 Agustus 2026',
    badge: 'Tugas',
    priority: 'important',
    content: 'Bagi kelompok yang memerlukan asistensi konfigurasi REST API dan deployment cloud gratis, sesi konsultasi tambahan dibuka setiap hari Rabu dan Jumat sepulang sekolah di Lab 304.',
    tags: ['PWPB', 'Asistensi', 'Lab 304']
  },
  {
    id: 'ann-3',
    title: 'Lomba Hackathon Pelajar Nasional 2026 Kategori AI & Web Solution',
    author: 'Bu Ratna Kartika, S.T',
    authorRole: 'Pembimbing Ekstrakurikuler Coding',
    date: '12 Agustus 2026',
    badge: 'Prestasi',
    priority: 'normal',
    content: 'Pendaftaran delegasi lomba Hackathon Pelajar resmi dibuka. Siswa yang berminat membentuk tim 3 orang harap mengumpulkan proposal ide aplikasi ke meja pembimbing paling lambat akhir pekan ini.',
    tags: ['Hackathon', 'Prestasi', 'Inovasi']
  }
];

export const INITIAL_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'disc-1',
    courseId: 'pwpb-12',
    courseTitle: 'Pemrograman Web & Mobile (PWPB)',
    title: 'Bagaimana cara mencegah race condition pada state update di React 19?',
    author: 'Muhammad Farhan',
    authorRole: 'Siswa XII PPLG 2',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4',
    createdAt: '2 jam yang lalu',
    content: 'Saat memanggil API beruntun pada filter input search yang cepat, kadang respon request pertama tiba lebih lambat daripada request kedua sehingga data tertukar. Apa best practice untuk membatalkannya?',
    views: 48,
    tags: ['React', 'Race Condition', 'AbortController'],
    replies: [
      {
        id: 'rep-1',
        author: 'Hendra Setiawan, M.Kom',
        authorRole: 'Guru Pengampu',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HendraTeacher&backgroundColor=b6e3f4',
        createdAt: '1 jam yang lalu',
        content: 'Pertanyaan sangat bagus Farhan! Solusi terbaik adalah menggunakan AbortController di dalam cleanup useEffect, atau menggunakan hook useDeferredValue / debounce library. Simak contohnya di modul 2.',
        isInstructorAnswer: true,
        upvotes: 12
      },
      {
        id: 'rep-2',
        author: 'Anindya Putri Kirana',
        authorRole: 'Siswa XII PPLG 2',
        authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anisa&backgroundColor=ffd5dc',
        createdAt: '45 menit yang lalu',
        content: 'Aku kemarin pakai custom hook useDebounce 300ms, jadi fetch baru ditembak setelah user selesai ngetik. Berhasil lancar!',
        upvotes: 6
      }
    ]
  },
  {
    id: 'disc-2',
    courseId: 'db-12',
    courseTitle: 'Basis Data & Database Management (BD)',
    title: 'Kapan kita harus menggunakan UUID dibanding BigInt Serial di PostgreSQL?',
    author: 'Ahmad Rizky Pratama',
    authorRole: 'Siswa XII PPLG 2',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aditya&backgroundColor=c0aede',
    createdAt: 'Kemarin',
    content: 'Apakah ada penurunan performa saat tabel memiliki jutaan baris jika Primary Key menggunakan UUIDv4?',
    views: 86,
    tags: ['PostgreSQL', 'UUID', 'Performance'],
    replies: [
      {
        id: 'rep-3',
        author: 'Pak Budi Prasetyo, M.T',
        authorRole: 'Guru Pengampu Basis Data',
        authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=ProfAris&backgroundColor=ffd5dc',
        createdAt: 'Kemarin sore',
        content: 'UUIDv4 bersifat acak sehingga menyebabkan fragmentasi B-Tree Index saat data sangat besar. Solusinya di sistem terdistribusi modern adalah memakai UUIDv7 yang sudah time-ordered (berurutan berdasarkan timestamp) sehingga performa write index tetap setara BigInt!',
        isInstructorAnswer: true,
        upvotes: 18
      }
    ]
  }
];

export const STUDENT_REPORT_DATA: StudentReport = {
  studentId: 'std-001',
  name: 'Muhammad Farhan',
  nisn: '0068124921',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4',
  overallGpa: 93.4,
  rank: 2,
  totalStudents: 34,
  attendanceRate: 98.5,
  subjectScores: [
    {
      courseId: 'pwpb-12',
      courseName: 'Pemrograman Web & Mobile (PWPB)',
      assignmentAvg: 95,
      quizAvg: 92,
      uasScore: 94,
      finalScore: 94,
      letterGrade: 'A',
      predicate: 'Sangat Baik (Kompeten)'
    },
    {
      courseId: 'pbo-12',
      courseName: 'Pemrograman Berorientasi Objek (PBO)',
      assignmentAvg: 90,
      quizAvg: 94,
      uasScore: 92,
      finalScore: 92,
      letterGrade: 'A',
      predicate: 'Sangat Baik (Kompeten)'
    },
    {
      courseId: 'db-12',
      courseName: 'Basis Data & Cloud DB',
      assignmentAvg: 92,
      quizAvg: 88,
      uasScore: 93,
      finalScore: 91,
      letterGrade: 'A',
      predicate: 'Sangat Baik (Kompeten)'
    },
    {
      courseId: 'ppl-12',
      courseName: 'Pemodelan Perangkat Lunak (PPL)',
      assignmentAvg: 96,
      quizAvg: 95,
      uasScore: 95,
      finalScore: 95,
      letterGrade: 'A',
      predicate: 'Sangat Baik (Kompeten)'
    },
    {
      courseId: 'pkk-12',
      courseName: 'Produk Kreatif & Kewirausahaan (PKK)',
      assignmentAvg: 94,
      quizAvg: 90,
      uasScore: 96,
      finalScore: 94,
      letterGrade: 'A',
      predicate: 'Sangat Baik (Kompeten)'
    }
  ]
};

export const CODE_PLAYGROUND_TEMPLATES = [
  {
    id: 'tpl-react',
    name: 'React 19 Component Counter & State',
    language: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen p-6 font-sans">
  <div id="root"></div>

  <script type="text/babel">
    function CounterApp() {
      const [count, setCount] = React.useState(0);
      const [history, setHistory] = React.useState([]);

      const handleIncrement = () => {
        setCount(c => c + 1);
        setHistory(prev => [count + 1, ...prev.slice(0, 4)]);
      };

      const handleReset = () => {
        setCount(0);
        setHistory([]);
      };

      return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center max-w-sm w-full">
          <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            XII PPLG 2 Sandbox
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Live React Counter</h2>
          <div className="text-6xl font-extrabold text-indigo-400 my-6 font-mono">
            {count}
          </div>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => setCount(c => Math.max(0, c - 1))}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 transition rounded-xl font-bold">
              - Kurang
            </button>
            <button 
              onClick={handleIncrement}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition rounded-xl font-bold">
              + Tambah
            </button>
          </div>
          <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white mt-4 underline">
            Reset Nilai
          </button>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<CounterApp />);
  </script>
</body>
</html>`
  },
  {
    id: 'tpl-js-algo',
    name: 'Algorithm: QuickSort & Array Manipulation',
    language: 'javascript',
    code: `// Implementasi Algoritma QuickSort Klasik di JavaScript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Data Nilai Siswa 12 PPLG 2
const nilaiSiswa = [88, 95, 76, 92, 64, 98, 85, 90, 78];

console.log("== UJI ALGORITMA 12 PPLG 2 ==");
console.log("Data Awal: ", JSON.stringify(nilaiSiswa));
const hasilSorting = quickSort(nilaiSiswa);
console.log("Data Terurut (Ascending): ", JSON.stringify(hasilSorting));
console.log("Nilai Tertinggi: ", hasilSorting[hasilSorting.length - 1]);
console.log("Nilai Terendah: ", hasilSorting[0]);
const rataRata = hasilSorting.reduce((acc, curr) => acc + curr, 0) / hasilSorting.length;
console.log("Rata-rata Kelas: ", rataRata.toFixed(2));
`
  },
  {
    id: 'tpl-dom',
    name: 'DOM Calculator & Interactive UI',
    language: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-indigo-900 to-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
    <h3 class="text-lg font-bold text-slate-800 mb-1">Kalkulator Nilai Akhir</h3>
    <p class="text-xs text-slate-500 mb-4">Bobot: Tugas 40%, Kuis 30%, UAS 30%</p>
    <div class="space-y-3">
      <div>
        <label class="text-xs font-semibold text-slate-600">Nilai Tugas (0-100)</label>
        <input id="tugas" type="number" value="95" class="w-full border rounded-lg p-2 text-sm">
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-600">Nilai Kuis (0-100)</label>
        <input id="kuis" type="number" value="90" class="w-full border rounded-lg p-2 text-sm">
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-600">Nilai UAS (0-100)</label>
        <input id="uas" type="number" value="92" class="w-full border rounded-lg p-2 text-sm">
      </div>
      <button onclick="hitung()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition">
        Hitung Nilai Rapor
      </button>
      <div id="hasil" class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center text-indigo-900 font-bold text-base mt-3">
        Klik tombol untuk hitung
      </div>
    </div>
  </div>

  <script>
    function hitung() {
      const t = parseFloat(document.getElementById('tugas').value) || 0;
      const k = parseFloat(document.getElementById('kuis').value) || 0;
      const u = parseFloat(document.getElementById('uas').value) || 0;
      const total = (t * 0.4) + (k * 0.3) + (u * 0.3);
      let predikat = 'D';
      if (total >= 90) predikat = 'A (Sangat Baik)';
      else if (total >= 80) predikat = 'B (Baik)';
      else if (total >= 70) predikat = 'C (Cukup)';
      
      document.getElementById('hasil').innerHTML = 
        'Skor Akhir: ' + total.toFixed(1) + ' <br><span class="text-xs text-indigo-600">Predikat: ' + predikat + '</span>';
    }
  </script>
</body>
</html>`
  }
];
