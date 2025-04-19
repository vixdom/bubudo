import React from 'react';
import { useTask } from '../context/TaskContext';

interface Subtask {
  id: string;
  title: string;
  link: string | null;
  status: 'pending' | 'in-progress' | 'completed';
}

interface SubtaskItemProps {
  subtask: Subtask;
  taskId: string;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, taskId }) => {
  const { updateSubtask, deleteSubtask } = useTask();

  const handleStatusChange = () => {
    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    updateSubtask(taskId, subtask.id, { status: newStatus });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      deleteSubtask(taskId, subtask.id);
    }
  };

  return (
    <div 
      className={`subtask-card flex items-start ${subtask.status === 'completed' ? 'bg-gray-50' : ''}`}
      onClick={handleStatusChange}
    >
      <input
        type="checkbox"
        checked={subtask.status === 'completed'}
        onChange={handleStatusChange}
        className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
      />
      <div className="flex-1">
        <p className={`${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {subtask.title}
        </p>
        {subtask.link && (
          <a 
            href={subtask.link} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary-600 hover:underline text-sm mt-1 inline-block"
          >
            Helpful Resource →
          </a>
        )}
      </div>
      <button 
        onClick={handleDelete}
        className="text-gray-400 hover:text-red-500 ml-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default SubtaskItem;
