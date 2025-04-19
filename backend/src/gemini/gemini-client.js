import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSubTasks(task) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Break this task into 3-5 simple steps:
  Task: ${task}
  Format as JSON array with "title", "description", and optional "links".
  Example: [{"title": "...", "description": "...", "links": [...]}]`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate sub-tasks');
  }
}
