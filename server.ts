import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  connectToDatabase,
  getDbStatus,
  ClassRoomModel,
  UserModel,
  ExamModel,
  AssessmentModel,
  TaskModel,
  MaterialModel,
  QuizModel,
  AttendanceModel,
  AnnouncementModel,
  SubjectModel,
  inMemoryStore,
} from './server/db';
import { EXECUTIVE_DATA } from './src/data/schoolData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));

  // Initialize DB Connection
  await connectToDatabase();

  // Health Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Web Ulangan Online & LMS Sekolah (Node.js + MongoDB Atlas)',
      timestamp: new Date().toISOString(),
      database: getDbStatus(),
    });
  });

  // --- 0. KELAS & MANAJEMEN USER (ADMIN ONLY REGISTRATION) ---

  // Get all classes
  app.get('/api/classes', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const classes = await ClassRoomModel.find().lean();
        return res.json(classes);
      }
      return res.json(inMemoryStore.classes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new class (Admin only)
  app.post('/api/classes', async (req, res) => {
    try {
      const { gradeLevel, majorName, majorCode, roomNumber, homeroomTeacher, isPlus } = req.body;
      const cleanGrade = gradeLevel || '10';
      const cleanMajorCode = (majorCode || 'PPLG').toUpperCase();
      const cleanRoom = roomNumber || '1';
      const isPlusBool = Boolean(isPlus);
      const className = isPlusBool
        ? `${cleanGrade} ${cleanMajorCode} ${cleanRoom} +`
        : `${cleanGrade} ${cleanMajorCode} ${cleanRoom}`; // e.g. "10 PPLG 1 +" or "10 PPLG 1"

      const newClass = {
        id: `cls-${cleanGrade}-${cleanMajorCode.toLowerCase()}-${isPlusBool ? 'plus-' : ''}${cleanRoom}-${Date.now().toString().slice(-4)}`,
        name: className,
        gradeLevel: cleanGrade,
        majorName: majorName || 'Pengembangan Perangkat Lunak & Gim',
        majorCode: cleanMajorCode,
        roomNumber: cleanRoom,
        isPlus: isPlusBool,
        homeroomTeacher: homeroomTeacher || 'Belum Ditentukan',
        totalStudents: 0,
        academicYear: '2025/2026',
        createdAt: new Date().toLocaleDateString('id-ID'),
      };

      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const created = await ClassRoomModel.create(newClass);
        return res.status(201).json(created);
      }
      (inMemoryStore.classes as any[]).unshift(newClass);
      return res.status(201).json(newClass);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all users (filtered by role or class)
  app.get('/api/users', async (req, res) => {
    try {
      const { role, class: userClass } = req.query;
      const { isMongoConnected } = getDbStatus();

      if (isMongoConnected) {
        const filter: any = {};
        if (role) filter.role = role;
        if (userClass) filter.class = userClass;
        const users = await UserModel.find(filter).lean();
        return res.json(users);
      }

      let filtered = (inMemoryStore.users as any[]);
      if (role) filtered = filtered.filter((u: any) => u.role === role);
      if (userClass) filtered = filtered.filter((u: any) => u.class === userClass);
      return res.json(filtered);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new user (Admin only registration for Siswa, Guru, Kurikulum, Kepsek, Admin)
  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      const newUser = {
        id: `usr-${Date.now()}`,
        name: userData.name,
        nisn: userData.nisn || '-',
        nip: userData.nip || '-',
        role: userData.role || 'student',
        titleRole:
          userData.titleRole ||
          (userData.role === 'student'
            ? `Siswa ${userData.class || ''}`
            : userData.role === 'teacher'
            ? `Guru ${userData.subjectTaught || 'Produktif'}`
            : userData.role === 'kurikulum'
            ? 'Staf Kurikulum'
            : userData.role === 'kepalasekolah'
            ? 'Kepala Sekolah'
            : 'Admin IT'),
        avatar:
          userData.avatar ||
          (userData.gender === 'Perempuan'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'),
        email: userData.email,
        class: userData.class || '-',
        points: Number(userData.points) || 1000,
        attendanceRate: 100,
        streakDays: 1,
        gender: userData.gender || 'Laki-laki',
        phoneNumber: userData.phoneNumber || '-',
        subjectTaught: userData.subjectTaught || '-',
        password: userData.password || 'password123',
        status: 'Aktif',
        bio: userData.bio || '',
        address: userData.address || '',
        birthPlace: userData.birthPlace || '',
        birthDate: userData.birthDate || '',
        religion: userData.religion || 'Islam',
        guardianName: userData.guardianName || '',
        guardianPhone: userData.guardianPhone || '',
      };

      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const created = await UserModel.create(newUser);
        return res.status(201).json(created);
      }
      (inMemoryStore.users as any[]).unshift(newUser);
      return res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update user (Admin edit data akun)
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { isMongoConnected } = getDbStatus();

      if (isMongoConnected) {
        const updated = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (!updated) {
          return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        return res.json(updated);
      }

      const index = (inMemoryStore.users as any[]).findIndex((u: any) => u.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      const existing = (inMemoryStore.users as any[])[index];
      const merged = { ...existing, ...updates };
      (inMemoryStore.users as any[])[index] = merged;
      return res.json(merged);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete user (Admin only)
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await UserModel.deleteOne({ id });
      } else {
        inMemoryStore.users = (inMemoryStore.users as any[]).filter((u: any) => u.id !== id);
      }
      return res.json({ success: true, message: 'Akun berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 0.1 MANAJEMEN MATA PELAJARAN (ADMIN MASTER SUBJECTS) ---

  // Get all subjects
  app.get('/api/subjects', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        let subjects = await SubjectModel.find().lean();
        if (!subjects || subjects.length === 0) {
          const { INITIAL_SUBJECTS } = await import('./src/data/schoolData');
          await SubjectModel.insertMany(INITIAL_SUBJECTS);
          subjects = await SubjectModel.find().lean();
        }
        return res.json(subjects);
      }
      return res.json((inMemoryStore as any).subjects || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new subject (Admin only)
  app.post('/api/subjects', async (req, res) => {
    try {
      const { code, name, category, targetGrade, kkm, hoursPerWeek, teacherInCharge, description, colorTheme } = req.body;
      const cleanCode = (code || 'MAPEL').trim().toUpperCase();
      const cleanName = (name || '').trim();

      if (!cleanName) {
        return res.status(400).json({ error: 'Nama mata pelajaran wajib diisi' });
      }

      const newSubject = {
        id: `sbj-${cleanCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        code: cleanCode,
        name: cleanName,
        category: category || 'Mata Pelajaran Umum (Wajib)',
        targetGrade: targetGrade || 'Semua Tingkat',
        kkm: Number(kkm) || 75,
        hoursPerWeek: Number(hoursPerWeek) || 3,
        teacherInCharge: teacherInCharge || 'Belum Ditugaskan',
        description: description || '',
        colorTheme: colorTheme || 'indigo',
        createdAt: new Date().toLocaleDateString('id-ID'),
      };

      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const created = await SubjectModel.create(newSubject);
        return res.status(201).json(created);
      }

      if (!(inMemoryStore as any).subjects) {
        (inMemoryStore as any).subjects = [];
      }
      (inMemoryStore as any).subjects.unshift(newSubject);
      return res.status(201).json(newSubject);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update subject (Admin)
  app.put('/api/subjects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.code) updates.code = updates.code.trim().toUpperCase();
      if (updates.kkm) updates.kkm = Number(updates.kkm);
      if (updates.hoursPerWeek) updates.hoursPerWeek = Number(updates.hoursPerWeek);

      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const updated = await SubjectModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (!updated) {
          return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' });
        }
        return res.json(updated);
      }

      const subjects = (inMemoryStore as any).subjects || [];
      const index = subjects.findIndex((s: any) => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' });
      }

      const existing = subjects[index];
      const merged = { ...existing, ...updates };
      subjects[index] = merged;
      return res.json(merged);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete subject (Admin)
  app.delete('/api/subjects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await SubjectModel.deleteOne({ id });
      } else {
        (inMemoryStore as any).subjects = ((inMemoryStore as any).subjects || []).filter((s: any) => s.id !== id);
      }
      return res.json({ success: true, message: 'Mata pelajaran berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 1. ULANGAN ONLINE / CBT API ---
  app.get('/api/exams', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const exams = await ExamModel.find().lean();
        return res.json(exams);
      }
      return res.json(inMemoryStore.exams);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Buat Ulangan Baru (Guru / Kurikulum)
  app.post('/api/exams', async (req, res) => {
    try {
      const examData = req.body;
      const { isMongoConnected } = getDbStatus();
      const newExam = {
        id: `exam-${Date.now()}`,
        code: examData.code || `CBT-${Date.now().toString().slice(-4)}`,
        title: examData.title,
        subject: examData.subject || 'Produktif PPLG',
        teacher: examData.teacher || 'Hendra Setiawan, M.Kom.',
        teacherAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
        targetClass: examData.targetClass || 'XII PPLG 2',
        examType: examData.examType || 'Ulangan Harian',
        token: (examData.token || 'PPLG26').toUpperCase(),
        durationMinutes: Number(examData.durationMinutes) || 45,
        startDate: examData.startDate || 'Hari Ini',
        endDate: examData.endDate || 'Hari Ini, 23:59 WIB',
        totalQuestions: examData.questions?.length || 0,
        passingScore: Number(examData.passingScore) || 75,
        status: 'active',
        antiCheat: examData.antiCheat || {
          lockdownFullscreen: true,
          tabSwitchLimit: 3,
          shuffleQuestions: true,
          shuffleOptions: true,
        },
        questions: examData.questions || [],
        results: [],
      };

      if (isMongoConnected) {
        const created = await ExamModel.create(newExam);
        return res.status(201).json(created);
      } else {
        inMemoryStore.exams.unshift(newExam);
        return res.status(201).json(newExam);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Validasi Token Ujian
  app.post('/api/exams/:id/verify-token', async (req, res) => {
    try {
      const { id } = req.params;
      const { token } = req.body;
      const { isMongoConnected } = getDbStatus();

      let exam: any = null;
      if (isMongoConnected) {
        exam = await ExamModel.findOne({ id }).lean();
      } else {
        exam = inMemoryStore.exams.find((e) => e.id === id);
      }

      if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan' });

      if (exam.token.trim().toUpperCase() === (token || '').trim().toUpperCase()) {
        return res.json({ valid: true, exam });
      } else {
        return res.status(400).json({ valid: false, error: 'Token ujian salah! Hubungi guru pengawas.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Submit Hasil Pengerjaan Siswa (Auto-Grade)
  app.post('/api/exams/:id/submit', async (req, res) => {
    try {
      const { id } = req.params;
      const { studentId, studentName, studentClass, answers, violationsCount, flaggedQuestions } = req.body;
      const { isMongoConnected } = getDbStatus();

      let exam: any = null;
      if (isMongoConnected) {
        exam = await ExamModel.findOne({ id });
      } else {
        exam = inMemoryStore.exams.find((e) => e.id === id);
      }

      if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan' });

      // Hitung skor otomatis
      let earnedPoints = 0;
      let totalPoints = 0;

      exam.questions.forEach((q: any) => {
        const weight = q.scoreWeight || 20;
        totalPoints += weight;
        const studentAns = answers[q.id];
        if (q.type === 'multiple_choice' && studentAns === q.correctIndex) {
          earnedPoints += weight;
        }
      });

      const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
      const isPassed = finalScore >= exam.passingScore;

      const result = {
        studentId: studentId || 'std-1201',
        studentName: studentName || 'Muhammad Farhan Ramadhan',
        studentClass: studentClass || 'XII PPLG 2',
        startedAt: new Date().toLocaleTimeString('id-ID'),
        finishedAt: new Date().toLocaleTimeString('id-ID'),
        answers,
        flaggedQuestions: flaggedQuestions || [],
        score: finalScore,
        maxScore: 100,
        isPassed,
        violationsCount: Number(violationsCount) || 0,
        gradedByTeacher: true,
      };

      if (isMongoConnected) {
        // Hapus submission sebelumnya jika ada
        exam.results = exam.results.filter((r: any) => r.studentId !== result.studentId);
        exam.results.push(result);
        exam.myResult = result;
        await exam.save();
        return res.json({ success: true, result, exam });
      } else {
        if (!exam.results) exam.results = [];
        exam.results = exam.results.filter((r: any) => r.studentId !== result.studentId);
        exam.results.push(result);
        exam.myResult = result;
        return res.json({ success: true, result, exam });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus Ulangan (Guru / Admin)
  app.delete('/api/exams/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await ExamModel.deleteOne({ id });
      } else {
        inMemoryStore.exams = (inMemoryStore.exams as any[]).filter((e: any) => e.id !== id);
      }
      return res.json({ success: true, message: 'Ulangan berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 2. ASESMEN KURIKULUM MERDEKA API ---
  app.get('/api/assessments', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const assessments = await AssessmentModel.find().lean();
        return res.json(assessments);
      }
      return res.json(inMemoryStore.assessments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/assessments', async (req, res) => {
    try {
      const data = req.body;
      const { isMongoConnected } = getDbStatus();
      const newAss = {
        id: `ass-${Date.now()}`,
        title: data.title,
        subject: data.subject || 'PWPB',
        teacher: data.teacher || 'Hendra Setiawan, M.Kom.',
        type: data.type || 'Formatif',
        competencyTarget: data.competencyTarget || 'Tujuan Pembelajaran Capaian Kompetensi',
        targetClass: data.targetClass || 'XII PPLG 2',
        deadline: data.deadline || '28 Agu 2026',
        status: 'active',
        instructions: data.instructions || [],
        rubric: data.rubric || [],
        submissions: [],
      };

      if (isMongoConnected) {
        const saved = await AssessmentModel.create(newAss);
        return res.status(201).json(saved);
      } else {
        inMemoryStore.assessments.unshift(newAss);
        return res.status(201).json(newAss);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/assessments/:id/submit', async (req, res) => {
    try {
      const { id } = req.params;
      const { studentId, studentName, content, fileUrl } = req.body;
      const { isMongoConnected } = getDbStatus();

      const sub = {
        studentId: studentId || 'std-1201',
        studentName: studentName || 'Muhammad Farhan',
        submittedAt: new Date().toLocaleDateString('id-ID'),
        fileUrl: fileUrl || '',
        content: content || '',
        predicate: 'Menunggu Penilaian',
      };

      if (isMongoConnected) {
        const ass = await AssessmentModel.findOne({ id });
        if (!ass) return res.status(404).json({ error: 'Asesmen not found' });
        ass.submissions.push(sub);
        await ass.save();
        return res.json(ass);
      } else {
        const ass = inMemoryStore.assessments.find((a) => a.id === id);
        if (!ass) return res.status(404).json({ error: 'Asesmen not found' });
        ass.submissions.push(sub);
        return res.json(ass);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus Asesmen (Guru / Admin)
  app.delete('/api/assessments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await AssessmentModel.deleteOne({ id });
      } else {
        inMemoryStore.assessments = (inMemoryStore.assessments as any[]).filter((a: any) => a.id !== id);
      }
      return res.json({ success: true, message: 'Asesmen berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 3. TUGAS HARIAN API ---
  app.get('/api/tasks', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const tasks = await TaskModel.find().lean();
        return res.json(tasks);
      }
      return res.json(inMemoryStore.tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const data = req.body;
      const { isMongoConnected } = getDbStatus();
      const newTask = {
        id: `task-${Date.now()}`,
        title: data.title,
        subject: data.subject || 'PWPB',
        teacher: data.teacher || 'Hendra Setiawan, M.Kom.',
        targetClass: data.targetClass || 'XII PPLG 2',
        assignedDate: 'Hari ini',
        dueDate: data.dueDate || 'Besok, 23:59 WIB',
        instructions: data.instructions || '',
        maxScore: Number(data.maxScore) || 100,
        attachments: data.attachments || [],
        submissions: [],
      };

      if (isMongoConnected) {
        const saved = await TaskModel.create(newTask);
        return res.status(201).json(saved);
      } else {
        inMemoryStore.tasks.unshift(newTask);
        return res.status(201).json(newTask);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks/:id/submit', async (req, res) => {
    try {
      const { id } = req.params;
      const { studentId, studentName, workContent, githubUrl, attachmentUrl } = req.body;
      const { isMongoConnected } = getDbStatus();

      const sub = {
        studentId: studentId || 'std-1201',
        studentName: studentName || 'Muhammad Farhan',
        submittedAt: new Date().toLocaleDateString('id-ID'),
        workContent: workContent || '',
        githubUrl: githubUrl || '',
        attachmentUrl: attachmentUrl || '',
        status: 'submitted',
      };

      if (isMongoConnected) {
        const task = await TaskModel.findOne({ id });
        if (!task) return res.status(404).json({ error: 'Tugas not found' });
        task.submissions.push(sub);
        task.mySubmission = sub;
        await task.save();
        return res.json(task);
      } else {
        const task = inMemoryStore.tasks.find((t) => t.id === id);
        if (!task) return res.status(404).json({ error: 'Tugas not found' });
        task.submissions.push(sub);
        task.mySubmission = sub;
        return res.json(task);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus Tugas (Guru / Admin)
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await TaskModel.deleteOne({ id });
      } else {
        inMemoryStore.tasks = (inMemoryStore.tasks as any[]).filter((t: any) => t.id !== id);
      }
      return res.json({ success: true, message: 'Tugas berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 4. MATERI PEMBELAJARAN API ---
  app.get('/api/materials', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const materials = await MaterialModel.find().lean();
        return res.json(materials);
      }
      return res.json(inMemoryStore.materials);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/materials', async (req, res) => {
    try {
      const data = req.body;
      const { isMongoConnected } = getDbStatus();
      const newMat = {
        id: `mat-${Date.now()}`,
        title: data.title,
        subject: data.subject || 'PWPB',
        teacher: data.teacher || 'Hendra Setiawan, M.Kom.',
        teacherAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
        targetClass: data.targetClass || 'XII PPLG 2',
        chapter: data.chapter || 'Bab Materi Baru',
        type: data.type || 'document',
        readTime: data.readTime || '15 Menit',
        summary: data.summary || '',
        contentMarkdown: data.contentMarkdown || '',
        codeSnippet: data.codeSnippet,
        viewsCount: 1,
        completedByStudent: false,
      };

      if (isMongoConnected) {
        const saved = await MaterialModel.create(newMat);
        return res.status(201).json(saved);
      } else {
        inMemoryStore.materials.unshift(newMat);
        return res.status(201).json(newMat);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus Materi (Guru / Admin)
  app.delete('/api/materials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await MaterialModel.deleteOne({ id });
      } else {
        inMemoryStore.materials = (inMemoryStore.materials as any[]).filter((m: any) => m.id !== id);
      }
      return res.json({ success: true, message: 'Materi berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 5. KUIS INTERAKTIF API ---
  app.get('/api/quizzes', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const quizzes = await QuizModel.find().lean();
        return res.json(quizzes);
      }
      return res.json(inMemoryStore.quizzes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/quizzes', async (req, res) => {
    try {
      const data = req.body;
      const { isMongoConnected } = getDbStatus();
      const newQuiz = {
        id: `quiz-${Date.now()}`,
        title: data.title,
        subject: data.subject || 'PWPB',
        teacher: data.teacher || 'Hendra Setiawan, M.Kom.',
        targetClass: data.targetClass || 'XII PPLG 2',
        topic: data.topic || 'Pemrograman',
        deadline: data.deadline || '',
        durationMinutes: Number(data.durationMinutes) || 30,
        passingScore: Number(data.passingScore) || 75,
        totalQuestions: data.questions?.length || 0,
        questions: data.questions || [],
      };

      if (isMongoConnected) {
        const created = await QuizModel.create(newQuiz);
        return res.status(201).json(created);
      } else {
        inMemoryStore.quizzes.unshift(newQuiz);
        return res.status(201).json(newQuiz);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/quizzes/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const { score } = req.body;
      const { isMongoConnected } = getDbStatus();

      if (isMongoConnected) {
        const quiz = await QuizModel.findOne({ id });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        quiz.isCompleted = true;
        quiz.lastScore = Number(score);
        await quiz.save();
        return res.json(quiz);
      } else {
        const quiz = inMemoryStore.quizzes.find((q) => q.id === id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        quiz.isCompleted = true;
        quiz.lastScore = Number(score);
        return res.json(quiz);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus Kuis (Guru / Admin)
  app.delete('/api/quizzes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        await QuizModel.deleteOne({ id });
      } else {
        inMemoryStore.quizzes = (inMemoryStore.quizzes as any[]).filter((q: any) => q.id !== id);
      }
      return res.json({ success: true, message: 'Kuis berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 6. PENGUMUMAN SEKOLAH & GURU (ANNOUNCEMENTS API) ---
  app.get('/api/announcements', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const announcements = await AnnouncementModel.find().sort({ pinned: -1, createdAt: -1 }).lean();
        return res.json(announcements);
      }
      // Sort pinned first
      const sorted = [...inMemoryStore.announcements].sort((a: any, b: any) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
      return res.json(sorted);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/announcements', async (req, res) => {
    try {
      const data = req.body;
      const { isMongoConnected } = getDbStatus();

      const newAnnouncement = {
        id: `ann-${Date.now()}`,
        title: data.title,
        author: data.author || 'Guru Pengampu',
        authorRole: data.authorRole || 'Guru / Wali Kelas',
        date: data.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        content: data.content,
        badge: data.badge || 'Penting',
        priority: data.priority || 'normal',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : ['Pengumuman']),
        targetClass: data.targetClass || 'Semua Kelas',
        pinned: Boolean(data.pinned),
        attachmentName: data.attachmentName || undefined,
        attachmentUrl: data.attachmentUrl || undefined,
      };

      if (isMongoConnected) {
        const created = await AnnouncementModel.create(newAnnouncement);
        return res.status(201).json(created);
      } else {
        inMemoryStore.announcements.unshift(newAnnouncement);
        return res.status(201).json(newAnnouncement);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();

      if (isMongoConnected) {
        await AnnouncementModel.deleteOne({ id });
      } else {
        inMemoryStore.announcements = inMemoryStore.announcements.filter((a: any) => a.id !== id);
      }
      return res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/announcements/:id/pin', async (req, res) => {
    try {
      const { id } = req.params;
      const { isMongoConnected } = getDbStatus();

      if (isMongoConnected) {
        const item = await AnnouncementModel.findOne({ id });
        if (!item) return res.status(404).json({ error: 'Announcement not found' });
        item.pinned = !item.pinned;
        await item.save();
        return res.json(item);
      } else {
        const item = inMemoryStore.announcements.find((a: any) => a.id === id);
        if (!item) return res.status(404).json({ error: 'Announcement not found' });
        item.pinned = !item.pinned;
        return res.json(item);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 7. PRESENSI & STATISTIK EKSEKUTIF ---
  app.get('/api/attendance', async (req, res) => {
    try {
      const { isMongoConnected } = getDbStatus();
      if (isMongoConnected) {
        const att = await AttendanceModel.find().sort({ createdAt: -1 }).lean();
        return res.json(att);
      }
      return res.json(inMemoryStore.attendance);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/executive/stats', (req, res) => {
    res.json(EXECUTIVE_DATA);
  });

  // --- Vite Dev Middleware or Production Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] LMS & Ulangan Online Node.js Server ready on:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Network: http://127.0.0.1:${PORT}`);
  });
}

startServer();
