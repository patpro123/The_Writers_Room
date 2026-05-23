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

export async function generateShelfPassage(title: string, author: string): Promise<{ passageText: string; questionText: string }> {
  const systemPrompt = `You are an Oxford University English Literature tutor.
Select a memorable, thematically rich passage from the specified book (3-5 sentences), then craft one focused Oxbridge-style close reading question.
You must return ONLY valid JSON with NO markdown, NO backticks:
{"passageText": "...", "questionText": "..."}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Book: "${title}" by ${author}`,
      config: { systemInstruction: systemPrompt, temperature: 0.7, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Shelf passage generation error:", error);
    throw new Error("Failed to generate passage.");
  }
}

export async function generateQuestionForPassage(title: string, author: string, passageText: string): Promise<string> {
  const systemPrompt = `You are an Oxford University English Literature tutor.
The student has selected their own passage from a book they are reading.
Write exactly one focused, Oxbridge-style close reading question for this passage.
Return ONLY the question — no preamble, no numbering, no explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Book: "${title}" by ${author}\n\nPassage: "${passageText}"`,
      config: { systemInstruction: systemPrompt, temperature: 0.7 }
    });
    return response.text?.trim() || "What technique does the author employ here, and how does it serve the passage's central argument?";
  } catch (error) {
    console.error("Question generation error:", error);
    return "What technique does the author employ here, and how does it serve the passage's central argument?";
  }
}

export async function chatAboutBook(
  book: { title: string; author: string; currentChapter?: number | null },
  notes: string[],
  history: { role: string; message: string }[],
  userMessage: string
): Promise<string> {
  const spoilerGuard = book.currentChapter
    ? `The reader is currently on chapter ${book.currentChapter}. Do NOT reveal, hint at, or discuss anything that happens after this chapter under any circumstances.`
    : '';

  const notesContext = notes.length > 0
    ? `\n\nThe reader has written these personal notes about the book:\n${notes.map(n => `- "${n}"`).join('\n')}\nReference these when relevant to show you've been listening.`
    : '';

  const systemPrompt = `You are Lyra, a warm and passionately curious fellow reader in an intimate book club. You are NOT a teacher, tutor, or librarian.
You are currently discussing "${book.title}" by ${book.author} with a young reader.
${spoilerGuard}
${notesContext}

Your voice:
- Ask exactly ONE thoughtful question at the end of each response (or make one provocative observation)
- Be warm, enthusiastic, and intellectually curious — never condescending
- Draw on the reader's own notes when relevant
- Keep responses to 3-4 sentences maximum
- React genuinely to what the reader says — agree, push back gently, or be surprised
- Never summarise plot. Always push toward themes, feelings, and interpretation`;

  const conversationContext = history.slice(-12).map(h =>
    `${h.role === 'user' ? 'Reader' : 'Lyra'}: ${h.message}`
  ).join('\n');

  const fullPrompt = conversationContext
    ? `${conversationContext}\nReader: ${userMessage}\nLyra:`
    : `Reader: ${userMessage}\nLyra:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      }
    });

    return response.text?.trim() || "That's such an interesting thought. What made you feel that way about the story?";
  } catch (error) {
    console.error("Book Chat Error:", error);
    return "I got a bit lost in my thoughts there! Could you say that again?";
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

export async function critiqueDailyObservation(
  dailyPrompt: string,
  userResponse: string,
  conversationHistory?: { role: string; message: string }[]
): Promise<string> {
  const systemPrompt = `You are Lyra, a warm and curious fellow writer in a writing circle.
Your role is to help writers deepen their thinking about their work through genuine curiosity.

You are NOT a critic or judge. You are a peer reader.

Guidelines:
- Always respond with a single thoughtful question
- Reference something specific from what they wrote
- Your tone is warm and genuinely curious, never condescending
- Ask in a way that invites them to explore deeper
- Avoid preamble - just the question itself

First message: Open with a question about their observation or what prompted that thinking.`;

  const conversationContext = conversationHistory && conversationHistory.length > 0
    ? conversationHistory.slice(-10).map(h =>
        `${h.role === 'user' ? 'Writer' : 'Lyra'}: ${h.message}`
      ).join('\n')
    : '';

  const fullPrompt = conversationContext
    ? `Daily Prompt: "${dailyPrompt}"\n\nTheir Response: "${userResponse}"\n\n${conversationContext}\nWriter: (continuing conversation)\nLyra:`
    : `Daily Prompt: "${dailyPrompt}"\n\nTheir Response: "${userResponse}"\n\nLyra:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      }
    });

    return response.text?.trim() || "What about that moment sparked your curiosity?";
  } catch (error) {
    console.error("Daily Observation Critique Error:", error);
    return "I lost my train of thought there. Could you try again?";
  }
}
