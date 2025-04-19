import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Snackbar, Alert, ThemeProvider, CssBaseline, Tabs, Tab, AppBar, Toolbar, Paper } from '@mui/material';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import AuthHeader from './components/AuthHeader';
import { TaskWithSubTasks, SubTask, PromptSelection } from './services/geminiService';
import { fetchUserTasks, upsertUserTasks } from './services/supabaseTasksService';
import theme, { themes } from './theme';
import { createTheme } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';

// App version: increment by 0.01 for each change
const APP_VERSION = '0.5-preview'; // Bubu Do [preview] version

export interface Task { // Base Task interface (for potential future use without subtasks)
  id: string;
  title: string;
  completed: boolean;
}

type ThemeKey = 'sunbeam' | 'fresh' | 'night';
const themeKeys: ThemeKey[] = ['sunbeam', 'fresh', 'night'];

import { deleteUserTasks, deleteUserTasksById } from './services/supabaseTasksService';

const App: React.FC = () => {
  // ...all hooks and logic above...

  // Set browser tab title
  useEffect(() => {
    document.title = 'Bubu Do [preview]';
  }, []);

  const [tasks, setTasks] = useState<TaskWithSubTasks[]>([]);
  const [promptSelection, setPromptSelection] = useState<PromptSelection>('A');
  const [user, setUser] = useState<any>(null);
  const [mergeNotice, setMergeNotice] = useState(false);
  const [tab, setTab] = useState(0); // 0: My Tasks, 1: My Accomplishments
  const [deleteNotice, setDeleteNotice] = useState(false);

  // Theme switcher state
  // Persist theme choice
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    const stored = localStorage.getItem('themeKey');
    if (stored && themeKeys.includes(stored as ThemeKey)) return stored as ThemeKey;
    return 'sunbeam';
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentTheme = themes[themeKey].theme;

  // Save theme to localStorage on change
  useEffect(() => {
    localStorage.setItem('themeKey', themeKey);
  }, [themeKey]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Load tasks from localStorage on initial mount (if not logged in)
  useEffect(() => {
    if (!user) {
      try {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          const parsedTasks: TaskWithSubTasks[] = JSON.parse(storedTasks);
          // Convert dueDate strings back to Date objects
          const tasksWithDates = parsedTasks.map(task => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
          }));
          setTasks(tasksWithDates);
          console.log('Tasks loaded from localStorage');
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
      }
    }
  }, [user]); // Only run when user changes

  // Handler to delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (user && user.id) {
        // Delete from Supabase
        // (Assumes deleteUserTasks can be adapted to delete a single task by id)
        await deleteUserTasksById(user.id, taskId);
      } else {
        // Update localStorage
        const stored = localStorage.getItem('tasks');
        if (stored) {
          const tasksArr = JSON.parse(stored).filter((task: any) => task.id !== taskId);
          localStorage.setItem('tasks', JSON.stringify(tasksArr));
        }
      }
      setDeleteNotice(true);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Save tasks to localStorage only if not logged in
  useEffect(() => {
    if (!user) {
      try {
        // Convert Date objects to ISO strings before saving
        const tasksToStore = tasks.map(task => ({
          ...task,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null
        }));
        localStorage.setItem('tasks', JSON.stringify(tasksToStore));
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    }
  }, [tasks, user]);

  // On login: sync/merge local tasks to Supabase, then clear local
  useEffect(() => {
    const doSync = async () => {
      if (user && user.id) {
        // 1. Fetch cloud tasks
        let cloudTasks: TaskWithSubTasks[] = [];
        try {
          cloudTasks = await fetchUserTasks(user.id);
        } catch (err) {
          console.error('Failed to fetch cloud tasks:', err);
        }
        // 2. Load local tasks
        let localTasks: TaskWithSubTasks[] = [];
        try {
          const stored = localStorage.getItem('tasks');
          if (stored) {
            localTasks = JSON.parse(stored).map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : null
            }));
          }
        } catch {}
        // 3. Merge: find local tasks not in cloud by ID
        const cloudIds = new Set(cloudTasks.map(t => t.id));
        const newLocalTasks = localTasks.filter(t => !cloudIds.has(t.id));
        let mergedTasks = [...cloudTasks, ...newLocalTasks];
        if (newLocalTasks.length > 0) {
          // 4. Upload merged tasks to Supabase
          try {
            await upsertUserTasks(user.id, mergedTasks);
            setMergeNotice(true);
          } catch (err) {
            console.error('Failed to upload merged tasks:', err);
          }
        }
        // 5. Clear local storage and use cloud
        localStorage.removeItem('tasks');
        setTasks(mergedTasks);
      }
    };
    doSync();
    // eslint-disable-next-line
  }, [user]);

  // Updated to accept task data object
  const addTask = async (taskData: Omit<TaskWithSubTasks, 'id' | 'completed'>) => {
    // Do not generate a fake id for Supabase
    const newTaskForSupabase = {
      ...taskData,
      completed: false,
      subTasks: taskData.subTasks.map(st => ({...st, completed: st.completed ?? false }))
    };
    // Locally, temporarily assign a random id for optimistic UI (will be replaced on sync)
    const tempId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newTaskForLocal: TaskWithSubTasks = {
      ...newTaskForSupabase,
      id: tempId,
    };
    const updatedTasks = [...tasks, newTaskForLocal];
    setTasks(updatedTasks);
    if (user && user.id) {
      try {
        // upsertUserTasks should not send the temp id, so filter it out before sending
        const tasksForSupabase = updatedTasks.map(({id, ...rest}) => rest);
        await upsertUserTasks(user.id, tasksForSupabase);
      } catch (err) {
        console.error('Failed to sync new task to Supabase:', err);
      }
    }
  };

  // Handler to toggle main task and its subtasks
  const handleToggleTask = async (taskId: string) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const newCompletedStatus = !task.completed;
        return {
          ...task,
          completed: newCompletedStatus,
          subTasks: task.subTasks.map(sub => ({ ...sub, completed: newCompletedStatus }))
        };
      }
      return task;
    });
    setTasks(updated);
    if (user && user.id) {
      try {
        await upsertUserTasks(user.id, updated);
      } catch (err) {
        console.error('Failed to sync toggle to Supabase:', err);
      }
    }
  };

  // Handler to edit a subtask
  const handleEditSubTask = async (taskId: string, subTaskId: string | number, newText: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.map(sub => sub.id === subTaskId ? { ...sub, text: newText } : sub)
        };
      }
      return task;
    }));
    if (user && user.id) {
      try {
        await upsertUserTasks(user.id, tasks);
      } catch (err) {
        console.error('Failed to sync edited subtask:', err);
      }
    }
  };

  // Handler to toggle a subtask
  const handleToggleSubTask = async (taskId: string, subTaskId: string | number) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.map(sub => sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub)
        };
      }
      return task;
    });
    setTasks(updated);
    if (user && user.id) {
      try {
        await upsertUserTasks(user.id, updated);
      } catch (err) {
        console.error('Failed to sync subtask toggle:', err);
      }
    }
  };

  // Theme switcher handlers
  const handleThemeClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleThemeClose = () => {
    setAnchorEl(null);
  };
  const handleThemeSelect = (key: ThemeKey) => {
    setThemeKey(key);
    setAnchorEl(null);
  };

  // Handler to delete a subtask
  const handleDeleteSubTask = async (taskId: string, subTaskId: string | number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.filter(sub => sub.id !== subTaskId)
        };
      }
      return task;
    }));
    if (user && user.id) {
      try {
        await upsertUserTasks(user.id, tasks);
      } catch (err) {
        console.error('Failed to sync deleted subtask:', err);
      }
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <React.Fragment>
        <AppBar position="fixed" color="primary" sx={{ borderRadius: 0, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="primary.contrastText" sx={{ fontWeight: 700, fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
                TaskFlow
              </Typography>
              <IconButton
                aria-label="Theme switcher"
                onClick={handleThemeClick}
                sx={{ ml: 1 }}
              >
                <span role="img" aria-label="theme">🎨</span>
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography variant="body2" color="primary.contrastText" sx={{ mr: 1 }}>
                  Prompt:
                </Typography>
                <select
                  value={promptSelection}
                  onChange={e => setPromptSelection(e.target.value as 'A' | 'B')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    fontSize: 14,
                    background: 'inherit',
                    color: 'inherit',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  aria-label="Select prompt version"
                >
                  <option value="A">Prompt A</option>
                  <option value="B">Prompt B</option>
                </select>
              </Box>
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleThemeClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, borderRadius: 8 } }}
              >
                <Box>
                  {Object.keys(themes).map((key) => (
                    <Typography
                      key={key}
                      variant="body2"
                      sx={{ cursor: 'pointer', p: 1, borderRadius: 2, mb: 1, bgcolor: themes[key as ThemeKey].theme.palette.mode === currentTheme.palette.mode ? 'primary.light' : 'transparent', '&:hover': { bgcolor: 'primary.lighter' } }}
                      onClick={() => handleThemeSelect(key as ThemeKey)}
                    >
                      {themes[key as ThemeKey].name}
                    </Typography>
                  ))}
                </Box>
              </Popover>
              {/* User Info */}
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  {user.avatar_url && <img src={user.avatar_url} alt={user.full_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 4 }} />}
                  <Typography variant="body2" color="primary.contrastText" sx={{ fontWeight: 500 }}>{user.full_name || user.email}</Typography>
                  <Button variant="contained" size="small" color="secondary" sx={{ ml: 1, borderRadius: 8 }} onClick={async () => { await import('./services/supabaseClient').then(({ supabase }) => supabase.auth.signOut()); setUser(null); }}>Logout</Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        {/* Main Content below AppBar */}
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 10, pb: 4 }}>
          <Container maxWidth="sm" sx={{ px: 0 }}>
            {/* Add Task Form */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 8, mb: 3, bgcolor: 'background.paper', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <AddTaskForm onAddTask={addTask} currentPrompt={promptSelection} user={user} />
            </Paper>
            {/* Tabs and Task Lists */}
            <Paper elevation={2} sx={{ borderRadius: 8, p: 2, bgcolor: 'background.paper', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2, borderRadius: 8, minHeight: 48 }}>
                <Tab label="To Do" sx={{ fontWeight: 600, fontSize: 16, fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }} />
                <Tab label="My Accomplishments" sx={{ fontWeight: 600, fontSize: 16, fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }} />
              </Tabs>
              {tab === 0 && (
                <TaskList 
                  tasks={incompleteTasks} 
                  onToggleTask={handleToggleTask} 
                  onToggleSubTask={handleToggleSubTask} 
                  onDeleteTask={handleDeleteTask}
                  onDeleteSubTask={handleDeleteSubTask}
                  onEditSubTask={handleEditSubTask}
                  user={user} 
                />
              )}
              {tab === 1 && (
                <TaskList 
                  tasks={completedTasks} 
                  onToggleTask={handleToggleTask} 
                  onToggleSubTask={handleToggleSubTask} 
                  onDeleteTask={handleDeleteTask}
                  onDeleteSubTask={handleDeleteSubTask}
                  onEditSubTask={handleEditSubTask}
                  user={user} 
                />
              )}
            </Paper>
          </Container>
        </Box>
        <Snackbar open={mergeNotice} autoHideDuration={4000} onClose={() => setMergeNotice(false)} anchorOrigin={{vertical:'top',horizontal:'center'}}>
          <Alert onClose={() => setMergeNotice(false)} severity="success" sx={{ width: '100%' }}>
            Local tasks have been uploaded and merged with your account!
          </Alert>
        </Snackbar>
        <Snackbar open={deleteNotice} autoHideDuration={3000} onClose={() => setDeleteNotice(false)} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
          <Alert onClose={() => setDeleteNotice(false)} severity="info" sx={{ width: '100%' }}>
            Task deleted!
          </Alert>
        </Snackbar>
      </React.Fragment>
    </ThemeProvider>
  );
};

export default App;
