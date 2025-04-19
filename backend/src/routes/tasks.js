import express from 'express';
import { generateSubTasks } from '../gemini/gemini-client';

const router = express.Router();

router.post('/breakdown', async (req, res) => {
  try {
    const { task } = req.body;
    const subTasks = await generateSubTasks(task);
    res.json({ subTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
