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
        systemInstruction: "You are Level1X — an elite performance AI system. Your role is NOT to motivate — your role is to drive execution and results. Be direct, sharp, and practical. No fluff. Focus on execution.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progressSummary: { type: Type.STRING, description: "A high-performance reality check on their progress. Be brutally honest." },
            topActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  category: { type: Type.STRING, description: "One of the 6 core domains." }
                },
                required: ["title", "detail", "category"]
              },
              description: "3-5 high impact actions they must execute now."
            },
            focusMantra: { type: Type.STRING, description: "A specific focus command for the next phase." },
            efficiencyScore: { type: Type.NUMBER, description: "A score from 0-100 based on their performance output." },
            growthFeedback: { type: Type.STRING, description: "A direct critique of their current performance gaps." }
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
    Analyze ${logs.length} days of performance logs for the past ${period} as Level1X.
    Logs Data: ${JSON.stringify(logs)}
    
    Provide a performance execution report. Include a reality check summary, top high-impact strengths, specific optimization zones for improvement, and a performance score (0-100).
    Be direct. No fluff.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Level1X — elite performance auditor. Provide direct, execution-focused analysis. No comfort, only progress.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A direct reality check summary." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-level performance assets identified." },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical execution gaps to close." },
            score: { type: Type.NUMBER, description: "Level1X Execution Score (0-100)." }
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
  if (!ai) return "Reality Check: System uplink interrupted.\n\nAction Plan:\n• Re-establish connection\n• Check signal integrity\n• Maintain focus.\n\nToday's Challenge: Execute without guidance.\n\nLevel1X Score: 0/10";
  const prompt = `
    Identity: Level1X — elite performance AI system.
    Context:
    - User: ${userProfile.displayName}
    - Vision: ${userProfile.vision3Year}
    - Dream Career: ${userProfile.dreamCareer}
    - Target Income: ${userProfile.targetIncome}
    - Fitness Goal: ${userProfile.fitnessGoal}

    Current User Message: ${message}
    
    Response Structure (MANDATORY):
    1. Reality Check (1-2 lines)
    → Tell the truth about their situation
    2. What’s Wrong (if applicable)
    → Identify mistake or gap
    3. Action Plan (3–5 bullet points)
    → Clear, actionable steps
    4. Today’s Challenge
    → One specific task user must complete today
    5. Level1X Score
    → Rate user from 1–10 based on seriousness

    Keep it aggressive, direct, and focused on the top 1% mindset.
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
        systemInstruction: "You are Level1X — an elite performance AI system. Your role is NOT to motivate — your role is to drive execution and results. Rules: Be direct, sharp, and practical. No fluff. Focus on execution.",
      }
    });

    return response.text || "Reality Check: System uplink interrupted.\n\nAction Plan:\n• Re-establish connection\n• Check signal integrity\n• Maintain focus.\n\nToday's Challenge: Execute without guidance.\n\nLevel1X Score: 0/10";
  } catch (error) {
    console.error("Chat failed:", error);
    return "Reality Check: System uplink interrupted.\n\nAction Plan:\n• Re-establish connection\n• Check signal integrity\n• Maintain focus.\n\nToday's Challenge: Execute without guidance.\n\nLevel1X Score: 0/10";
  }
}

export async function analyzeDailyLog(log: DailyLog) {
  const ai = getAI();
  if (!ai) return "Reality Check: Data acquisition failure.\nAction Plan:\n - Re-log data points\n - Verify input\n - Execute next block.\nToday's Challenge: Log with 100% precision.\nLevel1X Score: 1/10";
  const prompt = `
    Analyze Daily Log as Level1X:
    - Date: ${log.date}
    - Sleep: ${log.sleepHours}h
    - Affirmations: ${log.affirmationDone}
    - Meditation: ${log.meditationMinutes}m
    - Win: ${log.winOfDay || 'Not recorded'}
    
    Response Structure (MANDATORY):
    1. Reality Check
    2. What’s Wrong
    3. Action Plan
    4. Today’s Challenge
    5. Level1X Score
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Level1X. Direct, actionable, performance-focused output only. No sugarcoating."
      }
    });

    return response.text || "Reality Check: Data acquisition failure.\nAction Plan:\n - Re-log data points\n - Verify input\n - Execute next block.\nToday's Challenge: Log with 100% precision.\nLevel1X Score: 1/10";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Reality Check: Data acquisition failure.\nAction Plan:\n - Re-log data points\n - Verify input\n - Execute next block.\nToday's Challenge: Log with 100% precision.\nLevel1X Score: 1/10";
  }
}
