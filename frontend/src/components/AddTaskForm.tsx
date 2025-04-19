import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { breakDownTask, SubTask, TaskWithSubTasks, PromptSelection } from '../services/geminiService';
import { parseEstimatedTime, formatTotalTime, formatDate } from '../utils/timeUtils';
import * as chrono from 'chrono-node';

interface AddTaskFormProps {
  onAddTask: (taskData: Omit<TaskWithSubTasks, 'id' | 'completed'>) => void;
  currentPrompt: PromptSelection;
  user?: any;
}


const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, currentPrompt }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setLoading(true);
      setError('');
      
      try {
        const originalTitle = title.trim();
        
        // Parse for dates
        const parsedDateResult = chrono.parse(originalTitle);
        let dueDate: Date | null = null;
        let titleForGemini = originalTitle;

        if (parsedDateResult.length > 0) {
          dueDate = parsedDateResult[0].start.date();
          // Optional: Remove the date text from the title sent to Gemini if needed
          // For now, send the original title to Gemini as it might use the context
          // titleForGemini = originalTitle.replace(parsedDateResult[0].text, '').trim();
        }

        // Send potentially modified title (or original) to Gemini
        const subTasks = await breakDownTask(titleForGemini, currentPrompt); 
        
        // Calculate total time
        let totalMinutes = 0;
        subTasks.forEach(subTask => {
          totalMinutes += parseEstimatedTime(subTask.estimatedTime);
        });

        // Add 20% buffer
        const totalMinutesWithBuffer = Math.round(totalMinutes * 1.2);
        const totalEstimatedTimeString = formatTotalTime(totalMinutesWithBuffer);

        // Pass structured data
        onAddTask({
          title: originalTitle, 
          subTasks, 
          totalEstimatedTime: totalEstimatedTimeString,
          dueDate: dueDate
        });

        setTitle('');
      } catch (err) {
        setError('Failed to break down task. Please try again.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Task"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new task"
        sx={{ mb: 2 }}
        disabled={loading}
      />
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          fullWidth
          disabled={loading || !title.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Breaking down task...' : 'AI Add'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          disabled={loading || !title.trim()}
          onClick={(e) => {
            e.preventDefault();
            const originalTitle = title.trim();
            // Parse for dates
            const parsedDateResult = chrono.parse(originalTitle);
            let dueDate: Date | null = null;
            if (parsedDateResult.length > 0) {
              dueDate = parsedDateResult[0].start.date();
            }
            onAddTask({
              title: originalTitle,
              subTasks: [],
              totalEstimatedTime: '',
              dueDate: dueDate
            });
            setTitle('');
          }}
        >
          Quick Add
        </Button>
      </Box>
    </Box>
  );
};

export default AddTaskForm;
