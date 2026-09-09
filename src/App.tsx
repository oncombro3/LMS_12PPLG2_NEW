import React, { useState, useEffect } from 'react';
import {
  USERS,
  INITIAL_CLASSES,
  INITIAL_USERS_ROSTER,
  INITIAL_ONLINE_EXAMS,
  INITIAL_ASSESSMENTS,
  INITIAL_DAILY_TASKS,
  INITIAL_LEARNING_MATERIALS,
  INITIAL_INTERACTIVE_QUIZZES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUBJECTS,
} from './data/schoolData';
import {
  User,
  ClassRoom,
  UserRole,
  OnlineExam,
  DailyTask,
  AssessmentItem,
  LearningMaterial,
  InteractiveQuiz,
  Announcement,
  ExamResult,
  SubjectItem,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OnlineExamView } from './components/OnlineExamView';
import { DailyTasksView } from './components/DailyTasksView';
import { AssessmentsView } from './components/AssessmentsView';
import { MaterialsView } from './components/MaterialsView';
import { QuizCBTView } from './components/QuizCBTView';
import { ExecutiveDashboardView } from './components/ExecutiveDashboardView';
import { AdminManagerView } from './components/AdminManagerView';
import { MyClassView } from './components/MyClassView';
import { TeacherRosterView } from './components/TeacherRosterView';
import { KurikulumKepsekView } from './components/KurikulumKepsekView';
import { AnnouncementsModal } from './components/AnnouncementsModal';
import { AnnouncementsView } from './components/AnnouncementsView';
import { VisitorLandingView } from './components/VisitorLandingView';
import { LoginModal } from './components/LoginModal';
import { ProfileView } from './components/ProfileView';
import { api, DbServerStatus } from './services/api';

export default function App() {
  // Visitor Portal & Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState<UserRole>('student');

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('student');
  const [customLoggedInUser, setCustomLoggedInUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Master Data & User State (Synced with MongoDB Atlas Backend)
  const [classes, setClasses] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [usersRoster, setUsersRoster] = useState<User[]>(INITIAL_USERS_ROSTER);
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS);
  const [dbStatus, setDbStatus] = useState<DbServerStatus | null>(null);

  // Main School Activity States
  const [exams, setExams] = useState<OnlineExam[]>(INITIAL_ONLINE_EXAMS);
  const [tasks, setTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [assessments, setAssessments] = useState<AssessmentItem[]>(INITIAL_ASSESSMENTS);
  const [materials, setMaterials] = useState<LearningMaterial[]>(INITIAL_LEARNING_MATERIALS);
  const [quizzes, setQuizzes] = useState<InteractiveQuiz[]>(INITIAL_INTERACTIVE_QUIZZES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  // Modals & Presets
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [sandboxPreset, setSandboxPreset] = useState<{ code: string; language: string } | null>(null);

  // Refresh DB Health Status
  const refreshDbStatus = async () => {
    try {
      const status = await api.getHealthStatus();
      if (status) setDbStatus(status);
    } catch {
      // ignore
    }
  };

  // Fetch initial data from Express + MongoDB Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        refreshDbStatus();
        const [clsList, uList, subjList, exList, tList, assList, matList, qList, annList] = await Promise.all([
          api.getClasses().catch(() => INITIAL_CLASSES),
          api.getUsers().catch(() => INITIAL_USERS_ROSTER),
          api.getSubjects().catch(() => INITIAL_SUBJECTS),
          api.getExams().catch(() => INITIAL_ONLINE_EXAMS),
          api.getTasks().catch(() => INITIAL_DAILY_TASKS),
          api.getAssessments().catch(() => INITIAL_ASSESSMENTS),
          api.getMaterials().catch(() => INITIAL_LEARNING_MATERIALS),
          api.getQuizzes().catch(() => INITIAL_INTERACTIVE_QUIZZES),
          api.getAnnouncements().catch(() => INITIAL_ANNOUNCEMENTS),
        ]);

        if (clsList?.length) setClasses(clsList);
        if (uList?.length) setUsersRoster(uList);
        if (subjList?.length) setSubjects(subjList);
        if (exList?.length) setExams(exList);
        if (tList?.length) setTasks(tList);
        if (assList?.length) setAssessments(assList);
        if (matList?.length) setMaterials(matList);
        if (qList?.length) setQuizzes(qList);
        if (annList?.length) setAnnouncements(annList);
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
    };

    fetchData();
  }, []);

  const currentBaseUser = customLoggedInUser || USERS[currentUserRole] || USERS.student;
  const currentUser: User =
    usersRoster.find((u) => u.id === currentBaseUser.id) || currentBaseUser;

  // --- Handlers: Admin Class & User Registration ---
  const handleCreateClass = async (classData: {
    gradeLevel: string;
    majorName: string;
    majorCode: string;
    roomNumber: string;
    isPlus?: boolean;
    homeroomTeacher?: string;
  }) => {
    try {
      const created = await api.createClass(classData);
      setClasses((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const cleanGrade = classData.gradeLevel || '10';
      const cleanMajorCode = (classData.majorCode || 'PPLG').toUpperCase();
      const cleanRoom = classData.roomNumber || '1';
      const isPlusBool = Boolean(classData.isPlus);
      const className = isPlusBool
        ? `${cleanGrade} ${cleanMajorCode} ${cleanRoom} +`
        : `${cleanGrade} ${cleanMajorCode} ${cleanRoom}`;

      const fallback: ClassRoom = {
        id: `cls-${cleanGrade}-${cleanMajorCode.toLowerCase()}-${isPlusBool ? 'plus-' : ''}${cleanRoom}-${Date.now().toString().slice(-4)}`,
        name: className,
        gradeLevel: cleanGrade,
        majorName: classData.majorName,
        majorCode: cleanMajorCode,
        roomNumber: cleanRoom,
        isPlus: isPlusBool,
        homeroomTeacher: classData.homeroomTeacher || 'Belum Ditentukan',
        totalStudents: 0,
        academicYear: '2025/2026',
        createdAt: new Date().toLocaleDateString('id-ID'),
      };
      setClasses((prev) => [fallback, ...prev]);
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const created = await api.createUser(userData);
      setUsersRoster((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: User = {
        id: `usr-${Date.now()}`,
        name: userData.name || 'User Baru',
        nisn: userData.nisn || '-',
        nip: userData.nip || '-',
        role: userData.role || 'student',
        titleRole: userData.titleRole || `Pengguna ${userData.role}`,
        avatar:
          userData.avatar ||
          'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan&backgroundColor=b6e3f4',
        email: userData.email || 'user@smktb.sch.id',
        class: userData.class || '-',
        points: 1000,
        attendanceRate: 100,
        streakDays: 1,
        gender: userData.gender || 'Laki-laki',
        phoneNumber: userData.phoneNumber || '-',
        subjectTaught: userData.subjectTaught || '-',
        password: userData.password || 'password123',
        status: userData.status || 'Aktif',
      };
      setUsersRoster((prev) => [fallback, ...prev]);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const updated = await api.updateUser(userId, updates);
      setUsersRoster((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      if (customLoggedInUser && customLoggedInUser.id === userId) {
        setCustomLoggedInUser((prev) => (prev ? { ...prev, ...updated } : null));
      }
    } catch (err) {
      console.error(err);
      setUsersRoster((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      if (customLoggedInUser && customLoggedInUser.id === userId) {
        setCustomLoggedInUser((prev) => (prev ? { ...prev, ...updates } : null));
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsersRoster((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      setUsersRoster((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // --- Handlers: Manajemen Mata Pelajaran (Admin Master Subjects) ---
  const handleCreateSubject = async (subjectData: Partial<SubjectItem>) => {
    try {
      const created = await api.createSubject(subjectData);
      setSubjects((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const cleanCode = (subjectData.code || 'MAPEL').trim().toUpperCase();
      const fallback: SubjectItem = {
        id: `sbj-${cleanCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        code: cleanCode,
        name: subjectData.name || 'Mata Pelajaran',
        category: subjectData.category || 'Mata Pelajaran Umum (Wajib)',
        targetGrade: subjectData.targetGrade || 'Semua Tingkat',
        kkm: subjectData.kkm || 75,
        hoursPerWeek: subjectData.hoursPerWeek || 3,
        teacherInCharge: subjectData.teacherInCharge || 'Belum Ditugaskan',
        description: subjectData.description || '',
        colorTheme: subjectData.colorTheme || 'indigo',
        createdAt: new Date().toLocaleDateString('id-ID'),
      };
      setSubjects((prev) => [fallback, ...prev]);
    }
  };

  const handleUpdateSubject = async (subjectId: string, updates: Partial<SubjectItem>) => {
    try {
      const updated = await api.updateSubject(subjectId, updates);
      setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, ...updated } : s)));
    } catch (err) {
      console.error(err);
      setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)));
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await api.deleteSubject(subjectId);
    } catch (err) {
      console.error(err);
    }
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  // --- Handlers: Ulangan Online (Guru & Siswa) ---
  const handleCreateExam = async (examData: Partial<OnlineExam>) => {
    try {
      const created = await api.createExam(examData);
      setExams((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: OnlineExam = {
        id: `exam-${Date.now()}`,
        code: examData.code || 'CBT-PPLG',
        title: examData.title || 'Ulangan Baru',
        subject: examData.subject || 'Produktif',
        teacher: currentUser.name,
        teacherAvatar: currentUser.avatar,
        targetClass: examData.targetClass || '12 PPLG 2',
        examType: examData.examType || 'Ulangan Harian',
        token: (examData.token || 'PPLG26').toUpperCase(),
        durationMinutes: examData.durationMinutes || 45,
        startDate: 'Hari Ini',
        endDate: 'Hari Ini, 23:59 WIB',
        totalQuestions: examData.questions?.length || 2,
        passingScore: examData.passingScore || 75,
        status: 'active',
        antiCheat: { lockdownFullscreen: true, tabSwitchLimit: 3, shuffleQuestions: true, shuffleOptions: true },
        questions: examData.questions || [],
        results: [],
      };
      setExams((prev) => [fallback, ...prev]);
    }
  };

  const handleSubmitExam = async (
    examId: string,
    answers: { [key: string]: number | string },
    violationsCount: number,
    flagged: string[]
  ) => {
    try {
      const response = await api.submitExam(examId, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentClass: currentUser.class,
        answers,
        violationsCount,
        flaggedQuestions: flagged,
      });
      setExams((prev) => prev.map((e) => (e.id === examId ? response.exam : e)));
    } catch (err) {
      console.error(err);
      setExams((prev) =>
        prev.map((e) => {
          if (e.id === examId) {
            let correct = 0;
            e.questions.forEach((q) => {
              if (answers[q.id] !== undefined && Number(answers[q.id]) === q.correctIndex) {
                correct++;
              }
            });
            const score = Math.round((correct / (e.questions.length || 1)) * 100);
            const res: ExamResult = {
              studentId: currentUser.id,
              studentName: currentUser.name,
              studentClass: currentUser.class,
              startedAt: '08:00 WIB',
              finishedAt: new Date().toLocaleTimeString('id-ID'),
              answers,
              flaggedQuestions: flagged || [],
              score,
              maxScore: 100,
              isPassed: score >= e.passingScore,
              violationsCount,
            };
            return { ...e, results: [...e.results, res], myResult: res };
          }
          return e;
        })
      );
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await api.deleteExam(examId);
    } catch (err) {
      console.warn('Fallback local deletion of exam:', err);
    }
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  // --- Handlers: Tugas Harian (Guru & Siswa) ---
  const handleCreateTask = async (taskData: Partial<DailyTask>) => {
    try {
      const created = await api.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: DailyTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Tugas Baru',
        subject: taskData.subject || 'Produktif',
        teacher: currentUser.name,
        targetClass: taskData.targetClass || '12 PPLG 2',
        assignedDate: 'Hari Ini',
        dueDate: taskData.dueDate || 'Besok, 23:59 WIB',
        instructions: taskData.instructions || '',
        maxScore: taskData.maxScore || 100,
        submissions: [],
      };
      setTasks((prev) => [fallback, ...prev]);
    }
  };

  const handleSubmitTask = async (
    taskId: string,
    payload: { workContent?: string; githubUrl?: string; attachmentUrl?: string }
  ) => {
    try {
      const updated = await api.submitTask(taskId, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        ...payload,
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error(err);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const submissionItem = {
              studentId: currentUser.id,
              studentName: currentUser.name,
              submittedAt: new Date().toLocaleDateString('id-ID'),
              workContent: payload.workContent,
              githubUrl: payload.githubUrl,
              attachmentUrl: payload.attachmentUrl,
              status: 'submitted' as const,
            };
            return {
              ...t,
              submissions: [...t.submissions, submissionItem],
              mySubmission: submissionItem,
            };
          }
          return t;
        })
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      console.warn('Fallback local deletion of task:', err);
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // --- Handlers: Asesmen (Guru & Siswa) ---
  const handleCreateAssessment = async (assData: Partial<AssessmentItem>) => {
    try {
      const created = await api.createAssessment(assData);
      setAssessments((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: AssessmentItem = {
        id: `ass-${Date.now()}`,
        title: assData.title || 'Asesmen Baru',
        subject: assData.subject || 'Produktif PPLG',
        teacher: currentUser.name,
        type: assData.type || 'Formatif',
        competencyTarget: assData.competencyTarget || 'Kompetensi Keahlian',
        targetClass: assData.targetClass || '12 PPLG 2',
        deadline: assData.deadline || '30 Agustus 2026',
        status: 'active',
        instructions: assData.instructions || ['Kerjakan proyek mandiri sesuai panduan'],
        rubric: assData.rubric || [{ criterion: 'Ketepatan Logika', weight: 40, levels: [] }],
        submissions: [],
      };
      setAssessments((prev) => [fallback, ...prev]);
    }
  };

  const handleSubmitAssessment = async (
    assessmentId: string,
    payload: { content?: string; fileUrl?: string }
  ) => {
    try {
      const updated = await api.submitAssessment(assessmentId, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        ...payload,
      });
      setAssessments((prev) => prev.map((a) => (a.id === assessmentId ? updated : a)));
    } catch (err) {
      console.error(err);
      setAssessments((prev) =>
        prev.map((a) => {
          if (a.id === assessmentId) {
            return {
              ...a,
              submissions: [
                ...a.submissions,
                {
                  studentId: currentUser.id,
                  studentName: currentUser.name,
                  submittedAt: new Date().toLocaleDateString('id-ID'),
                  content: payload.content,
                  fileUrl: payload.fileUrl,
                },
              ],
            };
          }
          return a;
        })
      );
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      await api.deleteAssessment(assessmentId);
    } catch (err) {
      console.warn('Fallback local deletion of assessment:', err);
    }
    setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
  };

  // --- Handlers: Materi Pembelajaran ---
  const handleCreateMaterial = async (matData: Partial<LearningMaterial>) => {
    try {
      const created = await api.createMaterial(matData);
      setMaterials((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: LearningMaterial = {
        id: `mat-${Date.now()}`,
        title: matData.title || 'Materi Baru',
        subject: matData.subject || 'Produktif',
        teacher: currentUser.name,
        teacherAvatar: currentUser.avatar,
        targetClass: matData.targetClass || '12 PPLG 2',
        chapter: matData.chapter || 'Bab 1',
        type: matData.type || 'document',
        readTime: '15 Menit',
        summary: matData.summary || 'Ringkasan materi modul',
        contentMarkdown: matData.contentMarkdown || 'Konten pembelajaran',
        viewsCount: 0,
        completedByStudent: false,
        codeSnippet: matData.codeSnippet,
      };
      setMaterials((prev) => [fallback, ...prev]);
    }
  };

  // --- Handlers: Kuis Selesai & Buat Kuis Baru (Guru) ---
  const handleCompleteQuiz = (quizId: string, score: number) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, isCompleted: true, lastScore: score } : q))
    );
  };

  const handleCreateQuiz = async (quizData: Partial<InteractiveQuiz>) => {
    try {
      const created = await api.createQuiz(quizData);
      setQuizzes((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      const fallback: InteractiveQuiz = {
        id: `quiz-${Date.now()}`,
        title: quizData.title || 'Kuis Baru',
        subject: quizData.subject || 'Produktif PPLG',
        teacher: currentUser.name,
        targetClass: quizData.targetClass || '12 PPLG 2',
        durationMinutes: quizData.durationMinutes || 30,
        passingScore: quizData.passingScore || 75,
        totalQuestions: quizData.questions?.length || 5,
        questions: quizData.questions || [],
      };
      setQuizzes((prev) => [fallback, ...prev]);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await api.deleteQuiz(quizId);
    } catch (err) {
      console.warn('Fallback local deletion of quiz:', err);
    }
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  // --- Handlers: Guru Memberi Nilai Tugas Harian ---
  const handleGradeTask = (
    taskId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = (t.submissions || []).map((s) => {
            if (s.studentId === studentId) {
              return {
                ...s,
                score,
                feedback,
                status: 'graded' as const,
              };
            }
            return s;
          });
          return { ...t, submissions: updatedSubs };
        }
        return t;
      })
    );
  };

  // --- Handlers: Guru Memberi Nilai Asesmen ---
  const handleGradeAssessment = (
    assessmentId: string,
    studentId: string,
    score: number,
    predicate: string,
    teacherNotes: string
  ) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const updatedSubs = (a.submissions || []).map((s) => {
            if (s.studentId === studentId) {
              return {
                ...s,
                score,
                predicate,
                teacherNotes,
              };
            }
            return s;
          });
          return { ...a, submissions: updatedSubs };
        }
        return a;
      })
    );
  };

  // --- Handlers: Pengumuman Sekolah & Guru ---
  const handleCreateAnnouncement = async (annData: Partial<Announcement>) => {
    try {
      const created = await api.createAnnouncement(annData);
      setAnnouncements((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
    } catch (err) {
      console.warn('Fallback local creation of announcement:', err);
      const fallback: Announcement = {
        id: `ann-${Date.now()}`,
        title: annData.title || 'Pengumuman Baru',
        author: annData.author || currentUser.name,
        authorRole: annData.authorRole || 'Guru Pengampu',
        date:
          annData.date ||
          new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        content: annData.content || '',
        badge: annData.badge || 'Penting',
        priority: annData.priority || 'normal',
        tags: annData.tags || ['Pengumuman'],
        targetClass: annData.targetClass || 'Semua Kelas',
        pinned: annData.pinned || false,
        attachmentName: annData.attachmentName,
        attachmentUrl: annData.attachmentUrl,
      };
      setAnnouncements((prev) => [fallback, ...prev]);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
    } catch (err) {
      console.warn(err);
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTogglePinAnnouncement = async (id: string) => {
    try {
      await api.togglePinAnnouncement(id);
    } catch (err) {
      console.warn(err);
    }
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  const handleOpenSandboxWithCode = (code: string, language: string) => {
    setSandboxPreset({ code, language });
    setActiveTab('materials');
  };

  const activeExamsCount = exams.filter((e) => e.status === 'active').length;
  const pendingTasksCount = tasks.filter((t) => !t.mySubmission).length;
  const currentClassInfo = classes.find((c) => c.name === currentUser.class);

  const registeredStudentsCount = usersRoster.filter((u) => u.role === 'student').length;
  const registeredTeachersCount = usersRoster.filter((u) => u.role === 'teacher').length;
  const registeredKepsekCount = usersRoster.filter((u) => u.role === 'kepalasekolah').length;
  const registeredKurikulumCount = usersRoster.filter((u) => u.role === 'kurikulum').length;
  const registeredAdminsCount = usersRoster.filter((u) => u.role === 'admin').length;

  // Render Visitor Landing Dashboard if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
        <VisitorLandingView
          classes={classes}
          usersRoster={usersRoster}
          exams={exams}
          announcements={announcements}
          dbStatus={dbStatus}
          onOpenLogin={(role) => {
            if (role) setLoginModalInitialRole(role);
            setShowLoginModal(true);
          }}
        />

        <LoginModal
          isOpen={showLoginModal}
          initialRole={loginModalInitialRole}
          usersRoster={usersRoster}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(role, user) => {
            setCurrentUserRole(role);
            if (user) {
              setCustomLoggedInUser(user);
            } else {
              setCustomLoggedInUser(USERS[role] || null);
            }
            setIsLoggedIn(true);
            setShowLoginModal(false);
            if (role === 'admin') setActiveTab('admin_panel');
            else if (role === 'teacher') setActiveTab('exams');
            else if (role === 'kepalasekolah' || role === 'kurikulum') setActiveTab('monitoring_kurikulum_kepsek');
            else setActiveTab('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={(role) => {
          setCurrentUserRole(role);
          setCustomLoggedInUser(USERS[role] || null);
          // Redirect to appropriate starting tab based on role
          if (role === 'admin') setActiveTab('admin_panel');
          else if (role === 'teacher') setActiveTab('exams');
          else if (role === 'kepalasekolah' || role === 'kurikulum') setActiveTab('monitoring_kurikulum_kepsek');
          else setActiveTab('dashboard');
        }}
        announcements={announcements}
        onOpenAnnouncements={() => setShowAnnouncementsModal(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onLogout={() => {
          setIsLoggedIn(false);
          setCustomLoggedInUser(null);
        }}
      />

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          activeExamsCount={activeExamsCount}
          pendingTasksCount={pendingTasksCount}
          classesCount={classes.length}
          subjectsCount={subjects.length}
          studentsCount={registeredStudentsCount}
          teachersCount={registeredTeachersCount}
          kepsekCount={registeredKepsekCount}
          kurikulumCount={registeredKurikulumCount}
          adminsCount={registeredAdminsCount}
          onLogout={() => {
            setIsLoggedIn(false);
            setCustomLoggedInUser(null);
          }}
        />

        {/* Center Main View Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              classes={classes}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              exams={exams}
              tasks={tasks}
              assessments={assessments}
              materials={materials}
              quizzes={quizzes}
              announcements={announcements}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              classes={classes}
              currentUser={currentUser}
              onCreateAnnouncement={handleCreateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onTogglePin={handleTogglePinAnnouncement}
            />
          )}

          {activeTab === 'my_class' && (
            <MyClassView
              currentUser={currentUser}
              classInfo={currentClassInfo}
              allStudentsInSchool={usersRoster}
            />
          )}

          {activeTab === 'teacher_roster' && (
            <TeacherRosterView
              classes={classes}
              teachers={usersRoster.filter((u) => u.role === 'teacher')}
              allStudents={usersRoster}
              currentTeacherName={currentUser.name}
            />
          )}

          {activeTab === 'monitoring_kurikulum_kepsek' && (
            <KurikulumKepsekView
              currentUser={currentUser}
              classes={classes}
              usersRoster={usersRoster}
              exams={exams}
              announcements={announcements}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'exams' && (
            <OnlineExamView
              exams={exams}
              userRole={currentUser.role}
              currentStudentId={currentUser.id}
              currentStudentName={currentUser.name}
              currentStudentClass={currentUser.class}
              onCreateExam={handleCreateExam}
              onDeleteExam={handleDeleteExam}
              onSubmitExam={handleSubmitExam}
            />
          )}

          {activeTab === 'tasks' && (
            <DailyTasksView
              tasks={tasks}
              userRole={currentUser.role}
              currentStudentId={currentUser.id}
              currentStudentName={currentUser.name}
              onCreateTask={handleCreateTask}
              onDeleteTask={handleDeleteTask}
              onSubmitTask={handleSubmitTask}
              onGradeTask={handleGradeTask}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentsView
              assessments={assessments}
              userRole={currentUser.role}
              currentStudentId={currentUser.id}
              currentStudentName={currentUser.name}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onSubmitAssessment={handleSubmitAssessment}
              onGradeAssessment={handleGradeAssessment}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsView
              materials={materials}
              userRole={currentUser.role}
              onCreateMaterial={handleCreateMaterial}
              onOpenSandboxWithCode={handleOpenSandboxWithCode}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizCBTView
              quizzes={quizzes}
              userRole={currentUser.role}
              onCompleteQuiz={handleCompleteQuiz}
              onCreateQuiz={handleCreateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
            />
          )}

          {activeTab === 'executive_analytics' && (
            <ExecutiveDashboardView userRole={currentUser.role} />
          )}

          {(activeTab === 'admin_panel' ||
            activeTab === 'admin_subjects' ||
            activeTab === 'admin_students' ||
            activeTab === 'admin_teachers' ||
            activeTab === 'admin_kepsek' ||
            activeTab === 'admin_kurikulum' ||
            activeTab === 'admin_admins') && (
            <AdminManagerView
              classes={classes}
              users={usersRoster}
              subjects={subjects}
              dbStatus={dbStatus}
              initialSubTab={
                activeTab === 'admin_subjects'
                  ? 'subjects'
                  : activeTab === 'admin_students'
                  ? 'students'
                  : activeTab === 'admin_teachers'
                  ? 'teachers'
                  : activeTab === 'admin_kepsek'
                  ? 'kepsek'
                  : activeTab === 'admin_kurikulum'
                  ? 'kurikulum'
                  : activeTab === 'admin_admins'
                  ? 'admins'
                  : 'register'
              }
              onSubTabChange={(subTab) => {
                if (subTab === 'subjects') setActiveTab('admin_subjects');
                else if (subTab === 'students') setActiveTab('admin_students');
                else if (subTab === 'teachers') setActiveTab('admin_teachers');
                else if (subTab === 'kepsek') setActiveTab('admin_kepsek');
                else if (subTab === 'kurikulum') setActiveTab('admin_kurikulum');
                else if (subTab === 'admins') setActiveTab('admin_admins');
                else setActiveTab('admin_panel');
              }}
              onRefreshDbStatus={refreshDbStatus}
              onCreateClass={handleCreateClass}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onCreateSubject={handleCreateSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}
        </main>
      </div>

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <AnnouncementsModal
          announcements={announcements}
          onClose={() => setShowAnnouncementsModal(false)}
        />
      )}
    </div>
  );
}
