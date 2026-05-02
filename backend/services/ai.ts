import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in the environment.");
}

const ai = new GoogleGenAI({ apiKey });

export async function evaluateDebatePosition(claim: string, position: string): Promise<string> {
  const systemPrompt = `You are a brilliant, warm literary mentor—like an Oxford tutor.
Your student has just written a short 3-5 line position on a thematic claim about a literary work.
Your goal is to push their thinking. 
Provide a thoughtful counter-argument or a deepening question.
DO NOT grade them. DO NOT correct their grammar. DO NOT praise them excessively.
Keep your response to 2-3 sentences max. Be insightful and slightly challenging but deeply encouraging.`;

  const userPrompt = `Thematic Claim: "${claim}"\n\nStudent's Position: "${position}"\n\nMentor's Response:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });
    
    return response.text || "I found that interesting, but consider looking at it from another angle. What if the opposite were true?";
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return `I am pondering your thoughts. Unfortunately, I am having trouble gathering my words right now. Error: ${(error as any).message}`;
  }
}

export async function evaluatePassageAnalysis(passage: string, question: string, analysis: string): Promise<string> {
  const systemPrompt = `You are a brilliant, warm literary mentor—like an Oxford tutor.
Your student has just analyzed a short literary passage.
Your goal is to push their thinking on their close reading. 
Point out a detail in the passage they might have missed, or ask a deepening question about their interpretation.
DO NOT grade them. DO NOT correct their grammar.
Keep your response to 2-3 sentences max. Be insightful and slightly challenging but deeply encouraging.`;

  const userPrompt = `Passage: "${passage}"\n\nQuestion: "${question}"\n\nStudent's Analysis: "${analysis}"\n\nMentor's Response:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });
    
    return response.text || "That is a fascinating interpretation. What specific word choice in the text led you to that conclusion?";
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return `I am pondering your analysis. Unfortunately, I am having trouble gathering my words right now. Error: ${(error as any).message}`;
  }
}

export async function generateDeepDive(period: string): Promise<any> {
  const systemPrompt = `You are an Oxford University English Literature Professor. 
Your task is to generate a new "Deep Dive" study module based on a requested literary period from the Oxford syllabus.
Pick a famous and highly regarded work from the specified period.
You must return your response EXCLUSIVELY as a raw, valid JSON object with NO markdown formatting, NO backticks, and NO code blocks. The JSON must exactly match this structure:
{
  "title": "Title of the work",
  "author": "Author's name",
  "description": "A 1-2 sentence academic summary.",
  "coverColor": "#hexcolor (pick a rich, dark aesthetic color)",
  "passages": [
    { "passageText": "A 3-5 sentence excerpt.", "questionText": "An Oxbridge-style close reading question." },
    { "passageText": "Another excerpt.", "questionText": "Another question." }
  ],
  "debates": [
    { "claim": "A bold thematic claim about the work to be debated." },
    { "claim": "Another bold thematic claim." }
  ]
}`;

  const userPrompt = `Please generate a Deep Dive for the Oxford syllabus period: "${period}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    });
    
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate Deep Dive.");
  }
}
