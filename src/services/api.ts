import {
  User,
  ClassRoom,
  OnlineExam,
  AssessmentItem,
  DailyTask,
  LearningMaterial,
  InteractiveQuiz,
  AttendanceRecord,
  ExecutiveStats,
  Announcement,
  SubjectItem,
} from '../types';

export interface DbServerStatus {
  status: string;
  service: string;
  timestamp: string;
  database: {
    isMongoConnected: boolean;
    mode: 'mongodb' | 'in-memory-fallback';
    hasEnvUri: boolean;
  };
}

export const api = {
  async getHealthStatus(): Promise<DbServerStatus | null> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // 0. Classes & Users Management (Admin)
  async getClasses(): Promise<ClassRoom[]> {
    const res = await fetch('/api/classes');
    if (!res.ok) throw new Error('Failed to fetch classes');
    return await res.json();
  },

  async createClass(classData: {
    gradeLevel: string;
    majorName: string;
    majorCode: string;
    roomNumber: string;
    isPlus?: boolean;
    homeroomTeacher?: string;
  }): Promise<ClassRoom> {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    if (!res.ok) throw new Error('Failed to create class');
    return await res.json();
  },

  async getUsers(params?: { role?: string; class?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.class) query.append('class', params.class);
    const url = `/api/users${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to register user');
    return await res.json();
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
  },

  // 0.1 Subjects Management (Admin)
  async getSubjects(): Promise<SubjectItem[]> {
    const res = await fetch('/api/subjects');
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return await res.json();
  },

  async createSubject(subjectData: Partial<SubjectItem>): Promise<SubjectItem> {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return await res.json();
  },

  async updateSubject(subjectId: string, updates: Partial<SubjectItem>): Promise<SubjectItem> {
    const res = await fetch(`/api/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update subject');
    return await res.json();
  },

  async deleteSubject(subjectId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subject');
    return await res.json();
  },

  // 1. Online Exams (CBT)
  async getExams(): Promise<OnlineExam[]> {
    const res = await fetch('/api/exams');
    if (!res.ok) throw new Error('Failed to fetch exams');
    return await res.json();
  },

  async createExam(examData: Partial<OnlineExam>): Promise<OnlineExam> {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    if (!res.ok) throw new Error('Failed to create exam');
    return await res.json();
  },

  async verifyExamToken(examId: string, token: string): Promise<{ valid: boolean; exam?: OnlineExam; error?: string }> {
    const res = await fetch(`/api/exams/${examId}/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  },

  async submitExam(
    examId: string,
    payload: {
      studentId: string;
      studentName: string;
      studentClass: string;
      answers: { [key: string]: number | string };
      violationsCount: number;
      flaggedQuestions: string[];
    }
  ): Promise<{ success: boolean; result: any; exam: OnlineExam }> {
    const res = await fetch(`/api/exams/${examId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit exam');
    return await res.json();
  },

  async deleteExam(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/exams/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete exam');
    return await res.json();
  },

  // 2. Assessments (Asesmen Kurikulum Merdeka)
  async getAssessments(): Promise<AssessmentItem[]> {
    const res = await fetch('/api/assessments');
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return await res.json();
  },

  async createAssessment(data: Partial<AssessmentItem>): Promise<AssessmentItem> {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create assessment');
    return await res.json();
  },

  async submitAssessment(
    assessmentId: string,
    payload: { studentId: string; studentName: string; content?: string; fileUrl?: string }
  ): Promise<AssessmentItem> {
    const res = await fetch(`/api/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return await res.json();
  },

  async deleteAssessment(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/assessments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete assessment');
    return await res.json();
  },

  // 3. Daily Tasks (Tugas Harian)
  async getTasks(): Promise<DailyTask[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  },

  async createTask(data: Partial<DailyTask>): Promise<DailyTask> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return await res.json();
  },

  async submitTask(
    taskId: string,
    payload: { studentId: string; studentName: string; workContent?: string; githubUrl?: string; attachmentUrl?: string }
  ): Promise<DailyTask> {
    const res = await fetch(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit task');
    return await res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return await res.json();
  },

  // 4. Learning Materials (Materi)
  async getMaterials(): Promise<LearningMaterial[]> {
    const res = await fetch('/api/materials');
    if (!res.ok) throw new Error('Failed to fetch materials');
    return await res.json();
  },

  async createMaterial(data: Partial<LearningMaterial>): Promise<LearningMaterial> {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create material');
    return await res.json();
  },

  async deleteMaterial(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete material');
    return await res.json();
  },

  // 5. Quizzes
  async getQuizzes(): Promise<InteractiveQuiz[]> {
    const res = await fetch('/api/quizzes');
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return await res.json();
  },

  async createQuiz(data: Partial<InteractiveQuiz>): Promise<InteractiveQuiz> {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create quiz');
    return await res.json();
  },

  async completeQuiz(quizId: string, score: number): Promise<InteractiveQuiz> {
    const res = await fetch(`/api/quizzes/${quizId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });
    if (!res.ok) throw new Error('Failed to complete quiz');
    return await res.json();
  },

  async deleteQuiz(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/quizzes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete quiz');
    return await res.json();
  },

  // 6. Pengumuman (Announcements)
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch('/api/announcements');
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return await res.json();
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create announcement');
    return await res.json();
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return await res.json();
  },

  async togglePinAnnouncement(id: string): Promise<Announcement> {
    const res = await fetch(`/api/announcements/${id}/pin`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to pin announcement');
    return await res.json();
  },

  // 7. Attendance & Stats
  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch('/api/attendance');
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return await res.json();
  },

  async getExecutiveStats(): Promise<ExecutiveStats> {
    const res = await fetch('/api/executive/stats');
    if (!res.ok) throw new Error('Failed to fetch executive stats');
    return await res.json();
  },
};
