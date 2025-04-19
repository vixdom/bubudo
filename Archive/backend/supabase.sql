-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subtasks" ON subtasks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = subtasks.task_id AND 
            tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own subtasks" ON subtasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = subtasks.task_id AND 
            tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own subtasks" ON subtasks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = subtasks.task_id AND 
            tasks.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_order_index ON subtasks(order_index);
