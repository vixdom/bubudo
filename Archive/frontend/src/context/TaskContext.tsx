import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Subtask {
  id: string;
  title: string;
  link: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  task_id: string;
  created_at: string;
  completed_at?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  user_id: string;
  created_at: string;
  completed_at?: string;
  subtasks?: Subtask[];
}

interface TaskContextType {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (title: string, description?: string, dueDate?: string, priority?: 'low' | 'medium' | 'high') => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  generateSubtasks: (taskId: string) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper function to make authenticated API requests
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    return response.json();
  };

  // Fetch all tasks for the current user
  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest('/api/tasks');
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single task by ID
  const fetchTask = async (id: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest(`/api/tasks/${id}`);
      setCurrentTask(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (
    title: string,
    description: string = '',
    dueDate?: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Task | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority
        })
      });
      
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      // Update tasks list
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      
      // Update current task if it's the one being edited
      if (currentTask && currentTask.id === id) {
        setCurrentTask(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      // Remove task from list
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // Clear current task if it's the one being deleted
      if (currentTask && currentTask.id === id) {
        setCurrentTask(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Generate subtasks using AI
  const generateSubtasks = async (taskId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest(`/api/tasks/${taskId}/breakdown`, {
        method: 'POST'
      });
      
      // Update tasks list with new subtasks
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: data.subtasks
          };
        }
        return task;
      }));
      
      // Update current task if it's the one being processed
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask({
          ...currentTask,
          subtasks: data.subtasks
        });
      }
      
      return data.tip; // Return the AI-generated tip
    } catch (err: any) {
      setError(err.message || 'Failed to generate subtasks');
    } finally {
      setLoading(false);
    }
  };

  // Update a subtask
  const updateSubtask = async (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      // Update the subtask in the tasks list
      setTasks(prev => prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask => 
              subtask.id === subtaskId ? data : subtask
            )
          };
        }
        return task;
      }));
      
      // Update current task if it's the one containing the subtask
      if (currentTask && currentTask.id === taskId && currentTask.subtasks) {
        setCurrentTask({
          ...currentTask,
          subtasks: currentTask.subtasks.map(subtask => 
            subtask.id === subtaskId ? data : subtask
          )
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update subtask');
    } finally {
      setLoading(false);
    }
  };

  // Delete a subtask
  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });
      
      // Remove the subtask from the tasks list
      setTasks(prev => prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
          };
        }
        return task;
      }));
      
      // Update current task if it's the one containing the subtask
      if (currentTask && currentTask.id === taskId && currentTask.subtasks) {
        setCurrentTask({
          ...currentTask,
          subtasks: currentTask.subtasks.filter(subtask => subtask.id !== subtaskId)
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subtask');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setCurrentTask(null);
    }
  }, [user]);

  return (
    <TaskContext.Provider value={{
      tasks,
      currentTask,
      loading,
      error,
      fetchTasks,
      fetchTask,
      createTask,
      updateTask,
      deleteTask,
      generateSubtasks,
      updateSubtask,
      deleteSubtask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
