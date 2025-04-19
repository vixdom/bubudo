import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import SubtaskItem from './SubtaskItem';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  subtasks?: Array<{
    id: string;
    title: string;
    link: string | null;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [tip, setTip] = useState<string | null>(null);
  const { generateSubtasks, loading, updateTask, deleteTask } = useTask();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSubtasks = async () => {
    setIsGenerating(true);
    try {
      await generateSubtasks(task.id);
      // The task will be updated with new subtasks via the TaskContext
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    updateTask(task.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  // Format the date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Get the priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Calculate progress percentage based on completed subtasks
  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter(subtask => subtask.status === 'completed').length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="task-card mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.due_date && (
            <span className="text-sm text-gray-500">
              Due: {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-3">{task.description}</p>
      )}
      
      {/* Progress bar */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Subtasks:</h4>
          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <SubtaskItem 
                key={subtask.id} 
                subtask={subtask} 
                taskId={task.id} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleGenerateSubtasks}
            disabled={isGenerating}
            className="btn btn-secondary text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Subtasks with AI'}
          </button>
        </div>
      )}
      
      {/* AI Tip */}
      {tip && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
          <span className="font-medium">💡 Tip:</span> {tip}
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
        <div className="space-x-2">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="pending">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <Link to={`/task/${task.id}`} className="text-sm text-primary-600 hover:underline">
            View Details
          </Link>
        </div>
        
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
