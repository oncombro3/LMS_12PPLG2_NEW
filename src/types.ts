export type UserRole = 'student' | 'teacher' | 'kurikulum' | 'kepalasekolah' | 'admin';

export type TabType =
  | 'dashboard'
  | 'profile'
  | 'announcements'
  | 'exams'
  | 'tasks'
  | 'assessments'
  | 'materials'
  | 'quizzes'
  | 'my_class'
  | 'teacher_roster'
  | 'monitoring_kurikulum_kepsek'
  | 'executive_analytics'
  | 'admin_panel'
  | 'admin_subjects'
  | 'admin_students'
  | 'admin_teachers'
  | 'admin_kepsek'
  | 'admin_kurikulum'
  | 'admin_admins';

export interface SubjectItem {
  id: string;
  code: string; // e.g. "MTK", "IPA", "IPS", "B-IND", "B-ING", "PWPB", "PBO", "PAI", "PJOK"
  name: string; // e.g. "Matematika", "Ilmu Pengetahuan Alam (IPA)"
  description?: string;
  colorTheme?: string; // e.g. "indigo", "emerald", "amber", "blue", "purple", "rose", "cyan"
  category?: string;
  targetGrade?: string;
  kkm?: number;
  hoursPerWeek?: number;
  teacherInCharge?: string;
  createdAt?: string;
}

export type Subject = SubjectItem;

export interface ClassRoom {
  id: string;
  name: string; // e.g. "10 TKJ 1", "12 PPLG 2", "10 PPLG + 1"
  gradeLevel: '10' | '11' | '12' | string; // Tingkat: 10, 11, 12
  majorName: string; // Nama Jurusan: "Teknik Jaringan Komputer dan Telekomunikasi", "PPLG", etc.
  majorCode: string; // "TJKT", "PPLG", "PM", "PH", "DKV", "MPLB"
  roomNumber: string; // No Kelas / Rombel: "1", "2", "3"
  isPlus?: boolean; // Opsi Kelas Plus / Unggulan (+)
  homeroomTeacher?: string; // Guru Penanggung Jawab Kelas (Opsional)
  totalStudents: number;
  academicYear: string; // e.g. "2025/2026"
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  nisn: string;
  nip?: string;
  role: UserRole;
  avatar: string;
  email: string;
  class: string;
  points?: number;
  attendanceRate?: number;
  streakDays?: number;
  titleRole?: string;
  gender?: 'Laki-laki' | 'Perempuan' | string;
  phoneNumber?: string;
  subject?: string;
  subjectTaught?: string; // Untuk guru: mapel yang diampu
  status?: 'Aktif' | 'Nonaktif';
  password?: string;
  bio?: string;
  address?: string;
  birthPlace?: string;
  birthDate?: string;
  religion?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export type ExamType = 'Ulangan Harian' | 'Penilaian Tengah Semester (PTS)' | 'Penilaian Akhir Semester (PAS)' | 'Asesmen Sumatif' | 'Ujian Sekolah (US/CBT)';

export interface ExamQuestion {
  id: string;
  number: number;
  type: 'multiple_choice' | 'essay';
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctIndex?: number;
  essayAnswerKey?: string;
  scoreWeight: number;
  explanation: string;
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  studentClass: string;
  startedAt: string;
  finishedAt: string;
  answers: { [questionId: string]: number | string };
  flaggedQuestions: string[];
  score: number;
  maxScore: number;
  isPassed: boolean;
  violationsCount: number; // Anti-cheat violation count
  gradedByTeacher?: boolean;
}

export interface OnlineExam {
  id: string;
  code: string;
  title: string;
  subject: string;
  teacher: string;
  teacherAvatar: string;
  targetClass: string;
  examType: ExamType;
  token: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  totalQuestions: number;
  passingScore: number; // KKM
  status: 'draft' | 'active' | 'completed' | 'upcoming';
  antiCheat: {
    lockdownFullscreen: boolean;
    tabSwitchLimit: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };
  questions: ExamQuestion[];
  results: ExamResult[];
  myResult?: ExamResult;
}

export type AssessmentType = 'Diagnostik' | 'Formatif' | 'Sumatif' | 'Projek Profil (P5)' | 'P5';

export interface AssessmentRubric {
  criterion: string;
  weight: number;
  levels: { level: string; points: number; descriptor: string }[];
}

export interface AssessmentItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  type: AssessmentType;
  competencyTarget: string;
  targetClass: string;
  deadline: string;
  status: 'active' | 'in_review' | 'closed';
  instructions: string[];
  rubric: AssessmentRubric[];
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    fileUrl?: string;
    content?: string;
    score?: number;
    predicate?: 'Sangat Mahir' | 'Mahir' | 'Cukup' | 'Perlu Bimbingan' | string;
    teacherNotes?: string;
  }[];
}

export interface DailyTask {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  targetClass: string;
  assignedDate: string;
  dueDate: string;
  instructions: string;
  maxScore: number;
  attachments?: { name: string; url: string; size: string }[];
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    workContent?: string;
    attachmentUrl?: string;
    githubUrl?: string;
    score?: number;
    feedback?: string;
    status: 'submitted' | 'graded';
  }[];
  mySubmission?: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    workContent?: string;
    attachmentUrl?: string;
    githubUrl?: string;
    score?: number;
    feedback?: string;
    status: 'submitted' | 'graded';
  };
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  teacherAvatar: string;
  targetClass: string;
  chapter: string;
  type: 'video' | 'pdf' | 'interactive_code' | 'document';
  readTime: string;
  summary: string;
  contentMarkdown: string;
  downloadUrl?: string;
  videoUrl?: string;
  codeSnippet?: {
    language: string;
    code: string;
    output?: string;
  };
  viewsCount: number;
  completedByStudent: boolean;
}

export interface QuizQuestion {
  id: string;
  type?: 'multiple_choice' | 'essay';
  question: string;
  options?: string[];
  correctIndex?: number;
  essayAnswerKey?: string;
  scoreWeight?: number;
  explanation: string;
  codeSnippet?: string;
  language?: string;
}

export interface InteractiveQuiz {
  id: string;
  courseId?: string;
  courseTitle?: string;
  description?: string;
  title: string;
  subject?: string;
  teacher?: string;
  targetClass?: string;
  difficulty?: 'Mudah' | 'Sedang' | 'Sulit' | string;
  topic?: string;
  deadline?: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  isCompleted?: boolean;
  lastScore?: number;
  completedAt?: string;
  questions: QuizQuestion[];
}

export type Quiz = InteractiveQuiz;

export interface AttendanceRecord {
  id: string;
  date: string;
  time: string;
  subject: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | string;
  notes?: string;
  location?: string;
  verifiedByTeacher?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  content: string;
  badge: string;
  priority: 'normal' | 'important' | 'urgent';
  tags: string[];
  targetClass?: string;
  pinned?: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt?: string;
}

export interface ExecutiveStats {
  totalStudents: number;
  totalTeachers: number;
  totalExamsConducted: number;
  averagePassRate: number;
  schoolAverageScore: number;
  attendanceOverall: number;
  subjectAverages: { subject: string; avgScore: number; passingCount: number; failingCount: number }[];
  classPerformances: { className: string; gpa: number; activeStudents: number; examCompletionRate: number }[];
}

// --- Compatible Types for legacy/extended components ---
export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'github' | 'video' | 'link';
  size?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  explanation: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  type: 'theory' | 'practice' | 'quiz' | 'project';
  description: string;
  contentMarkdown: string;
  codeSnippet?: CodeSnippet;
  resources: ResourceItem[];
  completed: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  description: string;
  iconName: string;
  gradient: string;
  category: string;
  semester: string;
  totalHours: number;
  progress: number;
  modules: CourseModule[];
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  codeContent?: string;
  note?: string;
  fileAttachment?: string;
  githubUrl?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  instructions: string[];
  deadline: string;
  maxScore: number;
  starterCode?: string;
  language?: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  mySubmission?: StudentSubmission;
  allSubmissions?: StudentSubmission[];
}

export interface DiscussionReply {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  createdAt: string;
  content: string;
  isInstructorAnswer?: boolean;
  upvotes: number;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  createdAt: string;
  category?: string;
  content: string;
  tags: string[];
  views: number;
  replies: DiscussionReply[];
}

export interface SubjectGrade {
  courseCode: string;
  courseTitle: string;
  instructor: string;
  credits: number;
  kkm: number;
  assignmentAvg: number;
  quizAvg: number;
  midExam: number;
  finalExam: number;
  finalScore: number;
  letterGrade: 'A' | 'B' | 'C' | 'D';
  status: 'Lulus' | 'Remedial';
  attendancePercentage: number;
  subjectName?: string;
  score?: number;
}

export interface StudentReport {
  studentId: string;
  studentName?: string;
  name?: string;
  avatar?: string;
  nisn: string;
  class?: string;
  academicYear?: string;
  semester?: string;
  gpa?: number;
  overallGpa?: number;
  rank: number;
  totalStudents: number;
  overallAttendance?: number;
  attendanceRate?: number;
  totalPoints?: number;
  subjects?: SubjectGrade[];
  subjectScores?: any[];
}
