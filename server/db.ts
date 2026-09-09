import mongoose, { Schema } from 'mongoose';
import {
  INITIAL_CLASSES,
  INITIAL_USERS_ROSTER,
  INITIAL_ONLINE_EXAMS,
  INITIAL_ASSESSMENTS,
  INITIAL_DAILY_TASKS,
  INITIAL_LEARNING_MATERIALS,
  INITIAL_INTERACTIVE_QUIZZES,
  INITIAL_ATTENDANCE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUBJECTS,
} from '../src/data/schoolData';

// --- Mongoose Schemas ---

const ClassRoomSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g. "10 TKJ 1", "10 PPLG + 1"
    gradeLevel: { type: String, required: true }, // 10, 11, 12
    majorName: { type: String, required: true },
    majorCode: { type: String, required: true },
    roomNumber: { type: String, required: true },
    isPlus: { type: Boolean, default: false },
    homeroomTeacher: String,
    totalStudents: { type: Number, default: 0 },
    academicYear: { type: String, default: '2025/2026' },
    createdAt: String,
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nisn: String,
    nip: String,
    role: { type: String, required: true }, // student, teacher, kurikulum, kepalasekolah, admin
    avatar: String,
    email: { type: String, required: true },
    class: String,
    points: { type: Number, default: 1000 },
    attendanceRate: { type: Number, default: 100 },
    streakDays: { type: Number, default: 1 },
    titleRole: String,
    gender: String,
    phoneNumber: String,
    subjectTaught: String,
    password: { type: String, default: 'password123' },
    status: { type: String, default: 'Aktif' },
    bio: String,
    address: String,
    birthPlace: String,
    birthDate: String,
    religion: String,
    guardianName: String,
    guardianPhone: String,
  },
  { timestamps: true }
);

const ExamQuestionSchema = new Schema(
  {
    id: String,
    number: Number,
    type: { type: String, default: 'multiple_choice' },
    question: { type: String, required: true },
    codeSnippet: String,
    options: [String],
    correctIndex: Number,
    essayAnswerKey: String,
    scoreWeight: { type: Number, default: 20 },
    explanation: String,
  },
  { _id: false }
);

const ExamResultSchema = new Schema(
  {
    studentId: String,
    studentName: String,
    studentClass: String,
    startedAt: String,
    finishedAt: String,
    answers: { type: Map, of: Schema.Types.Mixed },
    flaggedQuestions: [String],
    score: Number,
    maxScore: { type: Number, default: 100 },
    isPassed: Boolean,
    violationsCount: { type: Number, default: 0 },
    gradedByTeacher: { type: Boolean, default: false },
  },
  { _id: false }
);

const ExamSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    code: String,
    title: { type: String, required: true },
    subject: String,
    teacher: String,
    teacherAvatar: String,
    targetClass: String,
    examType: { type: String, default: 'Ulangan Harian' },
    token: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    startDate: String,
    endDate: String,
    totalQuestions: Number,
    passingScore: { type: Number, default: 75 },
    status: { type: String, default: 'active' },
    antiCheat: {
      lockdownFullscreen: { type: Boolean, default: true },
      tabSwitchLimit: { type: Number, default: 3 },
      shuffleQuestions: { type: Boolean, default: true },
      shuffleOptions: { type: Boolean, default: true },
    },
    questions: [ExamQuestionSchema],
    results: [ExamResultSchema],
    myResult: ExamResultSchema,
  },
  { timestamps: true }
);

const AssessmentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subject: String,
    teacher: String,
    type: { type: String, default: 'Formatif' },
    competencyTarget: String,
    targetClass: String,
    deadline: String,
    status: { type: String, default: 'active' },
    instructions: [String],
    rubric: [
      {
        criterion: String,
        weight: Number,
        levels: [
          {
            level: String,
            points: Number,
            descriptor: String,
          },
        ],
      },
    ],
    submissions: [
      {
        studentId: String,
        studentName: String,
        submittedAt: String,
        fileUrl: String,
        content: String,
        score: Number,
        predicate: String,
        teacherNotes: String,
      },
    ],
  },
  { timestamps: true }
);

const TaskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subject: String,
    teacher: String,
    targetClass: String,
    assignedDate: String,
    dueDate: String,
    instructions: String,
    maxScore: { type: Number, default: 100 },
    attachments: [
      {
        name: String,
        url: String,
        size: String,
      },
    ],
    submissions: [
      {
        studentId: String,
        studentName: String,
        submittedAt: String,
        workContent: String,
        attachmentUrl: String,
        githubUrl: String,
        score: Number,
        feedback: String,
        status: { type: String, default: 'submitted' },
      },
    ],
    mySubmission: {
      studentId: String,
      studentName: String,
      submittedAt: String,
      workContent: String,
      attachmentUrl: String,
      githubUrl: String,
      score: Number,
      feedback: String,
      status: { type: String, default: 'submitted' },
    },
  },
  { timestamps: true }
);

const MaterialSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subject: String,
    teacher: String,
    teacherAvatar: String,
    targetClass: String,
    chapter: String,
    type: { type: String, default: 'document' },
    readTime: String,
    summary: String,
    contentMarkdown: String,
    downloadUrl: String,
    videoUrl: String,
    codeSnippet: {
      language: String,
      code: String,
      output: String,
    },
    viewsCount: { type: Number, default: 0 },
    completedByStudent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuizSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subject: String,
    topic: String,
    deadline: String,
    durationMinutes: Number,
    totalQuestions: Number,
    passingScore: Number,
    isCompleted: { type: Boolean, default: false },
    lastScore: Number,
    questions: [
      {
        id: String,
        question: String,
        options: [String],
        correctIndex: Number,
        explanation: String,
        codeSnippet: String,
      },
    ],
  },
  { timestamps: true }
);

const AttendanceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    date: String,
    time: String,
    subject: String,
    status: String,
    notes: String,
    location: String,
    verifiedByTeacher: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AnnouncementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    authorRole: { type: String, required: true },
    date: String,
    content: { type: String, required: true },
    badge: { type: String, default: 'Pengumuman' },
    priority: { type: String, default: 'normal' },
    tags: [String],
    targetClass: { type: String, default: 'Semua Kelas' },
    pinned: { type: Boolean, default: false },
    attachmentName: String,
    attachmentUrl: String,
  },
  { timestamps: true }
);

const SubjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Mata Pelajaran Umum (Wajib)' },
    targetGrade: { type: String, default: 'Semua Tingkat' },
    kkm: { type: Number, default: 75 },
    hoursPerWeek: { type: Number, default: 3 },
    teacherInCharge: { type: String, default: 'Belum Ditugaskan' },
    description: String,
    colorTheme: { type: String, default: 'indigo' },
    createdAt: String,
  },
  { timestamps: true }
);

// Models
export const ClassRoomModel = mongoose.models.ClassRoom || mongoose.model('ClassRoom', ClassRoomSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ExamModel = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
export const AssessmentModel = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const MaterialModel = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
export const QuizModel = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
export const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

// In-Memory Storage Fallback (used when MongoDB URI is offline or initializing)
export const inMemoryStore = {
  classes: JSON.parse(JSON.stringify(INITIAL_CLASSES)),
  users: JSON.parse(JSON.stringify(INITIAL_USERS_ROSTER)),
  exams: JSON.parse(JSON.stringify(INITIAL_ONLINE_EXAMS)),
  assessments: JSON.parse(JSON.stringify(INITIAL_ASSESSMENTS)),
  tasks: JSON.parse(JSON.stringify(INITIAL_DAILY_TASKS)),
  materials: JSON.parse(JSON.stringify(INITIAL_LEARNING_MATERIALS)),
  quizzes: JSON.parse(JSON.stringify(INITIAL_INTERACTIVE_QUIZZES)),
  attendance: JSON.parse(JSON.stringify(INITIAL_ATTENDANCE)),
  announcements: JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS)),
  subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
};

let isMongoConnected = false;

export function getDbStatus() {
  return {
    isMongoConnected,
    mode: isMongoConnected ? 'mongodb' : 'in-memory-fallback',
    hasEnvUri: Boolean(process.env.MONGODB_URI),
  };
}

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('ℹ️ [MongoDB] MONGODB_URI not detected in environment. Using in-memory fallback store.');
    return false;
  }

  try {
    if (mongoose.connection.readyState >= 1) {
      isMongoConnected = true;
      return true;
    }

    console.log('🔄 [MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isMongoConnected = true;
    console.log('✅ [MongoDB Atlas] Connected successfully to online school database.');

    await seedMongoIfEmpty();
    return true;
  } catch (error: any) {
    console.error('⚠️ [MongoDB] Connection warning, continuing with fallback:', error.message);
    isMongoConnected = false;
    return false;
  }
}

async function seedMongoIfEmpty() {
  try {
    const classCount = await ClassRoomModel.countDocuments();
    if (classCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial school classes...');
      await ClassRoomModel.insertMany(INITIAL_CLASSES);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial users roster...');
      await UserModel.insertMany(INITIAL_USERS_ROSTER);
    }

    const examCount = await ExamModel.countDocuments();
    if (examCount === 0) {
      await ExamModel.insertMany(INITIAL_ONLINE_EXAMS);
    }

    const assessmentCount = await AssessmentModel.countDocuments();
    if (assessmentCount === 0) {
      await AssessmentModel.insertMany(INITIAL_ASSESSMENTS);
    }

    const taskCount = await TaskModel.countDocuments();
    if (taskCount === 0) {
      await TaskModel.insertMany(INITIAL_DAILY_TASKS);
    }

    const materialCount = await MaterialModel.countDocuments();
    if (materialCount === 0) {
      await MaterialModel.insertMany(INITIAL_LEARNING_MATERIALS);
    }

    const quizCount = await QuizModel.countDocuments();
    if (quizCount === 0) {
      await QuizModel.insertMany(INITIAL_INTERACTIVE_QUIZZES);
    }

    const attendanceCount = await AttendanceModel.countDocuments();
    if (attendanceCount === 0) {
      await AttendanceModel.insertMany(INITIAL_ATTENDANCE);
    }

    const announcementCount = await AnnouncementModel.countDocuments();
    if (announcementCount === 0) {
      await AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS);
    }

    const subjectCount = await SubjectModel.countDocuments();
    if (subjectCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial school subjects...');
      await SubjectModel.insertMany(INITIAL_SUBJECTS);
    }
    console.log('✅ [MongoDB Atlas] Seeding check completed.');
  } catch (err: any) {
    console.warn('⚠️ [MongoDB] Seeding error:', err.message);
  }
}
