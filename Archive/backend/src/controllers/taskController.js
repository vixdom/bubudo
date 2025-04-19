import { supabase } from '../index.js';
import { generateSubtasksWithGemini, generateTaskTip } from '../services/geminiService.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const userId = req.user.id;

    // Create task in Supabase
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        due_date: dueDate,
        priority: priority || 'medium',
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all tasks for a user
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get tasks from Supabase
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a task by ID
export const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Get task from Supabase
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('id', taskId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if the task belongs to the user
    if (task.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Update task in Supabase
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        due_date: dueDate,
        priority,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    // Delete all subtasks first
    const { error: subtaskDeleteError } = await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', taskId);

    if (subtaskDeleteError) throw subtaskDeleteError;
    
    // Delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a subtask
export const createSubtask = async (req, res) => {
  try {
    const { title, link } = req.body;
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to add subtasks to this task' });
    }
    
    // Create subtask in Supabase
    const { data: subtask, error } = await supabase
      .from('subtasks')
      .insert({
        title,
        link,
        task_id: taskId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(subtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all subtasks for a task
export const getSubtasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view subtasks of this task' });
    }
    
    // Get subtasks from Supabase
    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    res.status(200).json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a subtask
export const updateSubtask = async (req, res) => {
  try {
    const { title, link, status } = req.body;
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtaskId = req.params.subtaskId;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update subtasks of this task' });
    }
    
    // Check if subtask exists
    const { data: existingSubtask, error: subtaskFetchError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', subtaskId)
      .eq('task_id', taskId)
      .single();

    if (subtaskFetchError || !existingSubtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }
    
    // Update subtask in Supabase
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    
    if (status === 'completed' && existingSubtask.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data: updatedSubtask, error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    
    res.status(200).json(updatedSubtask);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a subtask
export const deleteSubtask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtaskId = req.params.subtaskId;
    
    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (existingTask.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete subtasks of this task' });
    }
    
    // Check if subtask exists
    const { data: existingSubtask, error: subtaskFetchError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', subtaskId)
      .eq('task_id', taskId)
      .single();

    if (subtaskFetchError || !existingSubtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }
    
    // Delete the subtask
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
    
    res.status(200).json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate AI-powered task breakdown
export const generateTaskBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // Check if task exists and belongs to user
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to generate breakdown for this task' });
    }
    
    // Generate subtasks using Gemini AI
    const generatedSubtasks = await generateSubtasksWithGemini(task.title, task.description);
    
    // Add generated subtasks to the database
    const subtasksToInsert = generatedSubtasks.map(subtask => ({
      title: subtask.title,
      link: subtask.link,
      task_id: taskId,
      status: 'pending',
      created_at: new Date().toISOString()
    }));
    
    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .insert(subtasksToInsert)
      .select();

    if (error) throw error;
    
    // Generate a helpful tip
    const tip = await generateTaskTip(task.title);
    
    res.status(200).json({
      task,
      subtasks,
      tip
    });
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    res.status(500).json({ message: error.message });
  }
};
