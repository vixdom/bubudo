import { supabase } from './supabaseClient';
import { TaskWithSubTasks } from './geminiService';

const TABLE_NAME = 'tasks';

export async function fetchUserTasks(userId: string): Promise<TaskWithSubTasks[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(task => ({
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    subTasks: task.subTasks || []
  }));
}

// Helper: Check if string is a valid UUID (v4)
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function upsertUserTasks(userId: string, tasks: (Omit<TaskWithSubTasks, 'id'> & { id?: string })[]) {
  // Attach user_id to each task and only include 'id' if it's a valid UUID
  const tasksWithUser = tasks.map(task => {
    const { id, ...rest } = task;
    return id && isValidUUID(id)
      ? { ...rest, id, user_id: userId }
      : { ...rest, user_id: userId };
  });
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(tasksWithUser, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteUserTasks(userId: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// Delete a single task by id for a user
export async function deleteUserTasksById(userId: string, taskId: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('user_id', userId)
    .eq('id', taskId);
  if (error) throw error;
}
