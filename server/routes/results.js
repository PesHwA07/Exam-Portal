import { Router } from 'express';
import Result from '../models/Result.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.post('/', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json({ message: 'Result saved', id: result._id });
  } catch (err) {
    console.error('Failed to save result:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});
router.get('/', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find().sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Result.deleteMany({});
    res.json({ message: 'All results cleared' });
  } catch (err) {
    console.error('Failed to clear results:', err);
    res.status(500).json({ error: 'Failed to clear results' });
  }
});
export default router;
