import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Checkbox, Paper, Typography, Box, IconButton } from '@mui/material';
import { TaskWithSubTasks } from '../services/geminiService'; 
import { formatDate } from '../utils/timeUtils';
import SubtaskList from './SubtaskList'; 

interface TaskListProps {
  tasks: TaskWithSubTasks[];
  onToggleTask: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string | number) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteSubTask: (taskId: string, subTaskId: string | number) => void;
  onEditSubTask: (taskId: string, subTaskId: string | number, newTitle: string) => void;
  user?: any;
}


import DeleteIcon from '@mui/icons-material/Delete';

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onToggleSubTask, onDeleteTask, onDeleteSubTask, onEditSubTask }) => {
  return (
    <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
      {tasks.length === 0 ? (
        <ListItem>
          <ListItemText primary="No tasks yet. Add one above!" />
        </ListItem>
      ) : (
        <List>
          {tasks.map((task, idx) => (
            <Paper
              key={task.id}
              elevation={4}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                borderLeft: '6px solid #FFA000',
                boxShadow: 3,
                transition: 'box-shadow 0.2s, transform 0.2s',
                background: task.completed ? 'linear-gradient(90deg, #FFF9C4 60%, #E0E0E0 100%)' : '#FFFDE7',
                opacity: task.completed ? 0.85 : 1,
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-2px) scale(1.01)',
                },
              }}
            >
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    sx={{
                      color: '#FFA000',
                      '&.Mui-checked': {
                        color: '#FFA000',
                        animation: 'bounce-in 0.3s',
                      },
                      '@keyframes bounce-in': {
                        '0%': { transform: 'scale(1)' },
                        '40%': { transform: 'scale(1.3)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  primaryTypographyProps={{
                    variant: 'h6',
                    sx: { textDecoration: task.completed ? 'line-through' : 'none', fontWeight: 600, color: '#795548' }
                  }}
                  secondary={formatDate(task.dueDate)}
                  secondaryTypographyProps={{ variant: 'caption', color: '#888' }}
                />
                <IconButton aria-label="Delete task" edge="end" onClick={() => onDeleteTask(task.id)} sx={{ ml: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              {task.subTasks && task.subTasks.length > 0 && (
                <SubtaskList
                  subtasks={task.subTasks}
                  onToggleSubTask={(subTaskId) => onToggleSubTask(task.id, subTaskId)}
                  onDeleteSubTask={(subTaskId) => onDeleteSubTask(task.id, subTaskId)}
                  onEditSubTask={(subTaskId, newTitle) => onEditSubTask(task.id, subTaskId, newTitle)}
                />
              )}
              {idx < tasks.length - 1 && <Box sx={{ mt: 2, mb: 1 }}><hr style={{ border: 'none', borderTop: '1px solid #FFE082', margin: 0 }} /></Box>}
            </Paper>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TaskList;
