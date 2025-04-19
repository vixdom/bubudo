import { GoogleGenerativeAI } from "@google/generative-ai";

// Define Interfaces
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface SubTask {
  id: string; // Added unique ID
  title: string;
  completed: boolean;
  dependsOn: (string | number)[]; // Added dependency array
  estimatedTime?: string; // Optional estimated time
}

export interface TaskWithSubTasks extends Task {
  subTasks: SubTask[];
  totalEstimatedTime?: string; // Added total estimated time for the main task
  dueDate?: Date | null;         // Added due date
}

// ==================================
// --- PROMPT DEFINITIONS START ---
// ==================================

// --- Prompt A (Updated detailed prompt) ---
// Helper to fetch and cache prompts
const promptCache: Record<string, string> = {};
async function loadPrompt(promptName: 'A' | 'B'): Promise<string> {
  const filename = promptName === 'A' ? '/prompts/promptA.txt' : '/prompts/promptB.txt';
  if (promptCache[promptName]) return promptCache[promptName];
  const response = await fetch(filename);
  if (!response.ok) throw new Error(`Failed to load prompt ${promptName}`);
  const text = await response.text();
  promptCache[promptName] = text;
  return text;
}

// Returns the prompt with ${taskTitle} replaced
async function getPromptWithTaskTitle(promptName: 'A' | 'B', taskTitle: string): Promise<string> {
  const template = await loadPrompt(promptName);
  return template.replace(/\$\{taskTitle\}/g, taskTitle);
}


// ==================================
// --- PROMPT DEFINITIONS END ---
// ==================================

// --- Service Initialization ---

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("CRITICAL ERROR: Missing REACT_APP_GEMINI_API_KEY environment variable.");
}

const geminiService = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// --- API Call Function ---

export type PromptSelection = 'A' | 'B'; // Type for selecting prompt

// *** IMPORTANT: Ensure breakDownTask function is updated like this ***
export async function breakDownTask(
  taskTitle: string,
  promptVersion: PromptSelection // Added parameter to select prompt
): Promise<SubTask[]> {
  if (!geminiService) {
    console.error("Gemini service not initialized due to missing API key.");
    throw new Error("API Key configuration error. Cannot contact AI service.");
  }

  try {
    const genAI = geminiService;
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Select the prompt based on the argument
    // Load the prompt from file and substitute taskTitle
    const prompt = await getPromptWithTaskTitle(promptVersion, taskTitle);

    console.log(`Using Prompt ${promptVersion} for task: "${taskTitle}"`); // Log which prompt is used

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Clean the response text
    text = text.replace(/```json\n?|```/g, '').trim();
    console.log("Cleaned Gemini Response:", text);

    // Now expecting pure JSON output from Gemini (Prompt A updated)
    let parsedSubtasks: SubTask[];
    // Extract JSON array from the response (find first [ and last ])
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = text.substring(jsonStart, jsonEnd + 1);
      try {
        parsedSubtasks = JSON.parse(jsonStr);
        // Add unique IDs and ensure completed status is false
        parsedSubtasks = parsedSubtasks.map(subtask => ({
          ...subtask,
          dependsOn: Array.isArray(subtask.dependsOn) ? subtask.dependsOn : [],
          completed: false,
          uuid: Date.now().toString() + Math.random().toString(36).substring(2, 9) // for React key if needed
        }));
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON substring:", parseError, "Raw JSON:", jsonStr);
        // Handle the "no breakdown needed" case from Prompt B gracefully
        if (text.includes("No breakdown needed") || text.includes("task seems straightforward")) {
          console.log("Detected 'no breakdown needed' response type.");
          return [{
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            title: "No breakdown needed / Simple task",
            completed: false,
            dependsOn: [],
            estimatedTime: ""
          }];
        }
        throw new Error('Failed to parse task breakdown response');
      }
    } else {
      // If no JSON found, handle as before
      console.error("No JSON array found in Gemini response.");
      if (text.includes("No breakdown needed") || text.includes("task seems straightforward")) {
        return [{
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          title: "No breakdown needed / Simple task",
          completed: false,
          dependsOn: [],
          estimatedTime: ""
        }];
      }
      throw new Error('Failed to parse task breakdown response');
    }

    console.log("Parsed Subtasks:", parsedSubtasks);
    return parsedSubtasks;
  } catch (error) {
    console.error("Error breaking down task:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error('Invalid API Key. Please check your .env file and Google AI Studio settings.');
    }
    if (error instanceof Error && error.message.includes("400")) {
      console.error("Potential issue with prompt or model request.");
      throw new Error('Error processing task breakdown with AI. Check console for details.');
    }
    throw new Error('Failed to break down task');
  }
}
