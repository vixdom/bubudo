import React, { useState } from 'react';
import './SubtaskList.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Define the structure of a subtask
interface Subtask {
  id: string | number;
  title: string;
  dependsOn: (string | number)[];
  timeEstimate?: string;
  completed: boolean;
}

// Define the props for the SubtaskList component
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Close';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggleSubTask: (subTaskId: string | number) => void;
  onDeleteSubTask: (subTaskId: string | number) => void;
  onEditSubTask: (subTaskId: string | number, newTitle: string) => void;
}


const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onToggleSubTask, onDeleteSubTask, onEditSubTask }) => {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editValue, setEditValue] = useState('');
  if (!subtasks || subtasks.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 1 }}>No subtasks generated.</Typography>;
  }



  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper', mt: 1, pl: 4 }}>
      {subtasks.map((subtask) => (
        <ListItem
          key={subtask.id}
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mb: 1,
            py: 0.5,
            opacity: subtask.completed ? 0.6 : 1,
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
              <Checkbox
                checked={subtask.completed}
                onChange={() => onToggleSubTask(subtask.id)}
                size="small"
              />
            </ListItemIcon>
            {editingId === subtask.id ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontSize: 16, flex: 1, marginRight: 8 }}
                  autoFocus
                />
                <IconButton size="small" onClick={() => { onEditSubTask(subtask.id, editValue); setEditingId(null); }}><SaveIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => setEditingId(null)}><CancelIcon fontSize="small" /></IconButton>
              </>
            ) : (
              <>
                <ListItemText
                  primary={
                    <span>
                      <strong>{subtask.id}.</strong> {subtask.title}
                    </span>
                  }
                  primaryTypographyProps={{
                    sx: { textDecoration: subtask.completed ? 'line-through' : 'none' }
                  }}
                  secondary={subtask.timeEstimate ? `Est: ${subtask.timeEstimate}` : undefined}
                  secondaryTypographyProps={{ variant: 'caption' }}
                  sx={{ mb: subtask.dependsOn.length > 0 ? 0.5 : 0 }}
                />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1, minWidth: 0 }} className="subtask-actions">
                  <IconButton size="small" aria-label="Edit subtask" onClick={() => { setEditingId(subtask.id); setEditValue(subtask.title); }} sx={{ mr: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="Delete subtask" onClick={() => onDeleteSubTask(subtask.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </>
            )}
          </Stack>
          {subtask.dependsOn.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ pl: 5, pt: 0.5 }}>
              {subtask.dependsOn.map((depId: string | number) => (
                <Typography
                  key={`${subtask.id}-dep-${depId}`}
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Needs task {depId} to be completed
                </Typography>
              ))}
            </Stack>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default SubtaskList;
