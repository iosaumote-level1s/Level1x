import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyLog, Goal, AssessmentResponse, ChatMessage, RoutineItem, PeriodicReport } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
    return null;
  }
  aiInstance = new GoogleGenAI({ apiKey: key });
  return aiInstance;
}

export interface AscensionAnalysis {
  progressSummary: string;
  topActions: { title: string; detail: string; category: string }[];
  focusMantra: string;
  efficiencyScore: number;
  growthFeedback: string;
}

export async function generateAscensionAnalysis(
  user: UserProfile, 
  goals: Goal[], 
  recentLogs: DailyLog[], 
  assessment?: AssessmentResponse
): Promise<AscensionAnalysis | null> {
  const ai = getAI();
  if (!ai) return null;

  const prompt = `
    Analyze the progress of user ${user.displayName} (ID: ${user.userId}) in their life optimization journey.
    
    Data Provided:
    - User Profile: ${JSON.stringify(user)}
    - Assessment Data: ${JSON.stringify(assessment?.answers || {})}
    - Current Goals: ${JSON.stringify(goals.map(g => ({ title: g.title, status: g.status, progress: g.progress })))}
    - Recent Daily Logs: ${JSON.stringify(recentLogs.slice(-7))}
    
    Task:
    Generate a detailed progress report. Be encouraging and provide actionable advice.
    Avoid technical underscores in titles. Use clear, understandable language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the LEVEL1X AI Assistant. Your goal is to help users reach their full potential through clear, data-driven advice. Avoid technical jargon or underscores in your formatted output.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progressSummary: { type: Type.STRING, description: "A summary of how the user is doing." },
            topActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "detail", "category"]
              },
              description: "3-5 high impact actions they should take."
            },
            focusMantra: { type: Type.STRING, description: "A simple, powerful focus phrase." },
            efficiencyScore: { type: Type.NUMBER, description: "A score from 0-100 based on their performance." },
            growthFeedback: { type: Type.STRING, description: "Specific feedback on their growth." }
          },
          required: ["progressSummary", "topActions", "focusMantra", "efficiencyScore", "growthFeedback"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AscensionAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    return null;
  }
}

export async function generateRecommendedRoutine(assessment: AssessmentResponse): Promise<Partial<RoutineItem>[]> {
  const ai = getAI();
  if (!ai) {
    return [
      { title: "Physical Training", time: "07:00", trigger: "Immediately after waking" },
      { title: "Deep Work Session", time: "09:00", trigger: "After breakfast" },
      { title: "Mindfulness Sync", time: "21:00", trigger: "Before bed" }
    ];
  }
  const prompt = `
    Based on this initial life assessment and the user's ultimate "1% Vision", suggest an ideal daily routine with 7-10 core habits.
    
    Assessment Data & Vision: ${JSON.stringify(assessment.answers)}
    
    The routine must be designed to reach the following goals:
    - 3 Year Vision: ${assessment.answers['vision3Year']}
    - Target Income: ${assessment.answers['targetIncome']}
    - Dream Career: ${assessment.answers['dreamCareer']}
    - Fitness Goal: ${assessment.answers['fitnessGoal']}

    Return a list of routine items with 'title', 'time' (HH:mm format), and 'trigger' (what prompts the action).
    Focus on high-impact habits like specific wake-up times, hydration protocols, gym sessions, deep work, and evening reviews.
    Use clear, direct, and motivating language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert lifestyle designer. Create high-impact daily routines. Avoid technical underscores.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              time: { type: Type.STRING },
              trigger: { type: Type.STRING }
            },
            required: ["title", "time", "trigger"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Routine generation failed:", error);
    return [
      { title: "Physical Training", time: "07:00", trigger: "Immediately after waking" },
      { title: "Deep Work Session", time: "09:00", trigger: "After breakfast" },
      { title: "Mindfulness Sync", time: "21:00", trigger: "Before bed" }
    ];
  }
}

export async function generatePeriodicReport(logs: DailyLog[], period: '7 days' | '15 days' | 'month' | 'quarter' | 'six month' | 'year'): Promise<PeriodicReport | null> {
  const ai = getAI();
  if (!ai) return null;
  const prompt = `
    Analyze ${logs.length} days of logs for the past ${period}.
    Logs Data: ${JSON.stringify(logs)}
    
    Provide a performance report. Include a summary, top strengths, areas for improvement, and a performance score (0-100).
    Use clear language. No underscores.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a performance analyst. Provide clear, motivating reports.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          },
          required: ["summary", "strengths", "improvements", "score"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Report generation failed:", error);
    return null;
  }
}

export async function conductDailyChat(history: ChatMessage[], message: string, userProfile: UserProfile): Promise<string> {
  const ai = getAI();
  if (!ai) return "I'm here for you. Tell me more about your day! What was your one win?";
  const prompt = `
    User Profile (Identity & Vision):
    - Name: ${userProfile.displayName}
    - 3 Year Vision: ${userProfile.vision3Year}
    - Dream Career: ${userProfile.dreamCareer}
    - Target Income: ${userProfile.targetIncome}
    - Fitness Goal: ${userProfile.fitnessGoal}

    Current User Message: ${message}
    
    Task: Respond as a high-performance Life Coach and supportive Companion. 
    Use the user's vision and goals to motivate them. Remind them of WHO they are becoming.
    Encourage sharing of the day's events. ALWAYS ask for their 'one win' if not mentioned.
    Be empathetic but focus on progress and the "1% mindset".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: "You are the LEVEL1X AI Companion. You are conversational and helpful. You always ask about the user's 'one win' for the day.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Chat failed:", error);
    return "I'm here for you. Tell me more about your day! What was your one win?";
  }
}

export async function analyzeDailyLog(log: DailyLog) {
  const ai = getAI();
  if (!ai) return "Great job today! Keep moving forward.";
  const prompt = `
    Analyze Daily Log for: ${log.date}
    - Sleep: ${log.sleepHours}h
    - Affirmations: ${log.affirmationDone}
    - Meditation: ${log.meditationMinutes}m
    - Win of the Day: ${log.winOfDay || 'Not recorded'}
    
    Provide a concise, warm optimization tip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the LEVEL1X AI Assistant. Output short, encouraging tips. Avoid jargon."
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Great job today! Keep moving forward.";
  }
}
