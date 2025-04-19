import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates subtasks for a given task using Google's Gemini API
 * @param {string} taskTitle - The title of the task
 * @param {string} taskDescription - Optional description of the task
 * @returns {Promise<Array>} - Array of generated subtasks with titles and optional links
 */
export const generateSubtasksWithGemini = async (taskTitle, taskDescription = '') => {
  try {
    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for task breakdown
    const prompt = `Break down the following task into 3-5 simple, actionable subtasks that will help someone get started and feel less overwhelmed:

TASK: ${taskTitle}
${taskDescription ? `DESCRIPTION: ${taskDescription}` : ''}

For each subtask:
1. Make it short and actionable (one sentence)
2. Focus on what should be done first
3. Make it feel easy and achievable
4. Include a helpful link where relevant (e.g., recipes, tutorials, videos)

Respond in the following JSON format only:
[
  {
    "title": "Short, actionable subtask description",
    "link": "URL to helpful resource (or null if not applicable)"
  },
  ...
]
`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case the model includes additional text)
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON pattern found, try parsing the entire response
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Return fallback subtasks if parsing fails
      return [
        {
          title: 'Break down the task into smaller steps',
          link: null
        },
        {
          title: 'Set a timer for 25 minutes and focus on just the first step',
          link: 'https://pomofocus.io/'
        },
        {
          title: 'Take a short break, then continue with the next step',
          link: null
        }
      ];
    }
  } catch (error) {
    console.error('Error generating subtasks with Gemini:', error);
    throw new Error('Failed to generate subtasks');
  }
};

/**
 * Generates a helpful tip or suggestion based on the task
 * @param {string} taskTitle - The title of the task
 * @returns {Promise<string>} - A helpful tip
 */
export const generateTaskTip = async (taskTitle) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Based on this task: "${taskTitle}", provide a single, short, helpful tip for getting started or staying motivated. Keep it under 100 characters.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating task tip:', error);
    return 'Start with just 5 minutes of focused work to build momentum.';
  }
};
