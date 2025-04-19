import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';

const TaskInput: React.FC = () => {
  const [taskTitle, setTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const { createTask, loading, error } = useTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) return;
    
    const newTask = await createTask(taskTitle, description);
    
    if (newTask) {
      // Reset form
      setTaskTitle('');
      setDescription('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">What do you need to get done?</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="input text-lg"
            placeholder="Enter a task..."
            value={taskTitle}
            onChange={(e) => {
              setTaskTitle(e.target.value);
              if (!isExpanded && e.target.value) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
          />
        </div>
        
        {isExpanded && (
          <div className="mb-3">
            <textarea
              className="input h-24"
              placeholder="Add more details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex justify-end">
          {isExpanded && (
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={() => {
                setIsExpanded(false);
                if (!taskTitle) {
                  setDescription('');
                }
              }}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!taskTitle.trim() || loading}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default TaskInput;
