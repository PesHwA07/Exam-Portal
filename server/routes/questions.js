import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/auth.js';
import QuestionSet from '../models/Question.js';
import { parseQuestions } from '../utils/questionParser.js';

// Multer config — use memory storage for serverless compatibility
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/plain',
  ];
  const extAllowed = ['.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(file.mimetype) || extAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// ────────────────────────────────────────────
// POST /api/questions/upload
// Upload a file, parse it, return preview JSON
// ────────────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Extract text directly from buffer (memory storage)
    const rawText = req.file.buffer.toString('utf-8');

    // Parse questions
    const { questions, errors, examTitle } = parseQuestions(rawText);

    res.json({
      success: true,
      examTitle: examTitle || req.file.originalname.replace(/\.[^.]+$/, ''),
      sourceFileName: req.file.originalname,
      questionCount: questions.length,
      questions,
      errors,
    });
  } catch (err) {
    console.error('Upload parse error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse file.' });
  }
});

// ────────────────────────────────────────────
// POST /api/questions/publish
// Save parsed questions to DB and publish
// ────────────────────────────────────────────
router.post('/publish', authMiddleware, async (req, res) => {
  try {
    const {
      examTitle,
      questions,
      sourceFileName,
      randomizeQuestions,
      randomizeOptions,
    } = req.body;

    if (!examTitle || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Exam title and questions are required.' });
    }

    // Check version — count existing sets with same title
    const existingCount = await QuestionSet.countDocuments({ examTitle });
    const version = existingCount + 1;

    const questionSet = new QuestionSet({
      examTitle,
      version,
      questions,
      sourceFileName: sourceFileName || '',
      isPublished: true,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions: randomizeOptions || false,
    });

    await questionSet.save();

    res.status(201).json({
      success: true,
      message: `Published "${examTitle}" v${version} with ${questions.length} questions.`,
      id: questionSet._id,
      version,
    });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ error: 'Failed to publish questions.' });
  }
});

// ────────────────────────────────────────────
// GET /api/questions/active
// Public — fetch currently published questions
// ────────────────────────────────────────────
router.get('/active', async (req, res) => {
  try {
    const active = await QuestionSet.findOne({ isPublished: true }).sort({ updatedAt: -1 });

    if (!active) {
      return res.json({
        available: false,
        examTitle: '',
        questions: [],
        randomizeQuestions: false,
        randomizeOptions: false,
      });
    }

    // Strip correct answers from response for students
    const safeQuestions = active.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      category: q.category,
      options: q.options,
      // correctAnswer intentionally omitted for students
    }));

    res.json({
      available: true,
      examTitle: active.examTitle,
      questions: safeQuestions,
      randomizeQuestions: active.randomizeQuestions,
      randomizeOptions: active.randomizeOptions,
    });
  } catch (err) {
    console.error('Fetch active questions error:', err);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// ────────────────────────────────────────────
// GET /api/questions/active/answers
// Internal — fetch answers for grading (POST exam)
// ────────────────────────────────────────────
router.get('/active/answers', async (req, res) => {
  try {
    const active = await QuestionSet.findOne({ isPublished: true }).sort({ updatedAt: -1 });

    if (!active) {
      return res.status(404).json({ error: 'No active exam found.' });
    }

    const answerMap = {};
    active.questions.forEach(q => {
      answerMap[q.id] = q.correctAnswer;
    });

    res.json({ answers: answerMap });
  } catch (err) {
    console.error('Fetch answers error:', err);
    res.status(500).json({ error: 'Failed to fetch answers.' });
  }
});

// ────────────────────────────────────────────
// GET /api/questions/history
// Admin — list all question sets
// ────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const sets = await QuestionSet.find()
      .select('examTitle version sourceFileName isPublished questions createdAt updatedAt')
      .sort({ createdAt: -1 });

    // Add question count
    const result = sets.map(s => ({
      _id: s._id,
      examTitle: s.examTitle,
      version: s.version,
      sourceFileName: s.sourceFileName,
      isPublished: s.isPublished,
      questionCount: s.questions?.length || 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ error: 'Failed to fetch question history.' });
  }
});

// ────────────────────────────────────────────
// GET /api/questions/:id
// Admin — get a specific question set
// ────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const set = await QuestionSet.findById(req.params.id);
    if (!set) return res.status(404).json({ error: 'Question set not found.' });
    res.json(set);
  } catch (err) {
    console.error('Fetch set error:', err);
    res.status(500).json({ error: 'Failed to fetch question set.' });
  }
});

// ────────────────────────────────────────────
// PUT /api/questions/:id
// Admin — update a question set
// ────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { examTitle, questions, isPublished, randomizeQuestions, randomizeOptions } = req.body;
    const update = {};
    if (examTitle !== undefined) update.examTitle = examTitle;
    if (questions !== undefined) update.questions = questions;
    if (isPublished !== undefined) update.isPublished = isPublished;
    if (randomizeQuestions !== undefined) update.randomizeQuestions = randomizeQuestions;
    if (randomizeOptions !== undefined) update.randomizeOptions = randomizeOptions;
    update.updatedAt = new Date();

    // If publishing, unpublish others
    if (isPublished) {
      await QuestionSet.updateMany(
        { _id: { $ne: req.params.id }, isPublished: true },
        { isPublished: false }
      );
    }

    const set = await QuestionSet.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!set) return res.status(404).json({ error: 'Question set not found.' });

    res.json({ success: true, message: 'Updated successfully.', set });
  } catch (err) {
    console.error('Update set error:', err);
    res.status(500).json({ error: 'Failed to update question set.' });
  }
});

// ────────────────────────────────────────────
// DELETE /api/questions/:id
// Admin — delete a question set
// ────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const set = await QuestionSet.findByIdAndDelete(req.params.id);
    if (!set) return res.status(404).json({ error: 'Question set not found.' });
    res.json({ success: true, message: 'Question set deleted.' });
  } catch (err) {
    console.error('Delete set error:', err);
    res.status(500).json({ error: 'Failed to delete question set.' });
  }
});

export default router;
