const { OpenAI } = require('openai');
const { PromptTemplate } = require('langchain/prompts');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate subtasks for a given task using AI
 * @param {string} taskTitle - The title of the task
 * @param {string} taskDescription - The description of the task
 * @returns {Promise<Array>} - Array of generated subtasks
 */
exports.generateTaskBreakdownWithAI = async (taskTitle, taskDescription) => {
  try {
    // Create prompt for task breakdown
    const prompt = `Break down the following task into 3-7 actionable subtasks:

Task Title: ${taskTitle}
Task Description: ${taskDescription || 'No description provided'}

Provide a list of subtasks in JSON format with title and description for each subtask.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant that helps break down tasks into actionable subtasks." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the response
    const content = response.choices[0].message.content;
    let subtasks = [];

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        subtasks = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response as JSON
        subtasks = JSON.parse(content);
      }

      // Ensure each subtask has the required fields
      return subtasks.map(subtask => ({
        title: subtask.title,
        description: subtask.description || '',
        status: 'pending',
        createdAt: new Date()
      }));
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback: create a simple subtask if parsing fails
      return [{
        title: 'Review task requirements',
        description: 'Review the task requirements and plan your approach',
        status: 'pending',
        createdAt: new Date()
      }];
    }
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    throw new Error('Failed to generate task breakdown');
  }
};

/**
 * Generate suggestions for task completion based on current progress
 * @param {Object} task - The task object with subtasks
 * @returns {Promise<string>} - Suggestion for next steps
 */
exports.generateTaskSuggestions = async (task) => {
  try {
    // Create a summary of the current task state
    const completedSubtasks = task.subtasks.filter(st => st.status === 'completed').length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    
    const subtasksInfo = task.subtasks.map(st => (
      `- ${st.title} (${st.status}): ${st.description}`
    )).join('\n');
    
    const prompt = `Task: ${task.title}\n\nDescription: ${task.description || 'No description'}\n\nProgress: ${progress.toFixed(0)}% complete (${completedSubtasks}/${totalSubtasks} subtasks)\n\nSubtasks:\n${subtasksInfo}\n\nBased on the current progress, provide a helpful suggestion for what the user should focus on next to make progress on this task. Keep your suggestion concise and actionable.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant that helps users complete tasks efficiently." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return 'Focus on completing your next pending subtask to make progress.';
  }
};
