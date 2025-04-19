import express from 'express';
import * as taskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Task routes
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Subtask routes
router.post('/:id/subtasks', taskController.createSubtask);
router.get('/:id/subtasks', taskController.getSubtasks);
router.put('/:taskId/subtasks/:subtaskId', taskController.updateSubtask);
router.delete('/:taskId/subtasks/:subtaskId', taskController.deleteSubtask);

// AI-powered task breakdown
router.post('/:id/breakdown', taskController.generateTaskBreakdown);

export default router;
