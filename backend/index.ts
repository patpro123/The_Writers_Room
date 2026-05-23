import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { evaluateDebatePosition, evaluatePassageAnalysis, generateDeepDive, chatAboutBook, generateShelfPassage, generateQuestionForPassage, critiqueDailyObservation } from './services/ai';

const prisma = new PrismaClient();
const app = express();

const appOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: appOrigin,
  credentials: true
}));
app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'TODO_ADD_CLIENT_ID';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const DISABLE_AUTH = false;

// Middleware to verify our custom JWT
const authMiddleware = async (req: any, res: any, next: any) => {
  if (DISABLE_AUTH) {
    let mockUser = await prisma.user.findFirst();
    if (!mockUser) {
      mockUser = await prisma.user.create({
        data: { name: 'Mock User', email: 'mock@example.com' }
      });
      await prisma.progress.create({ data: { userId: mockUser.id, badges: '' } });
    }
    req.user = { id: mockUser.id };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (GOOGLE_CLIENT_ID === 'TODO_ADD_CLIENT_ID') {
      return res.status(500).json({ error: 'Server missing GOOGLE_CLIENT_ID configuration' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub }
    });

    if (!user) {
      // Check if user exists by email (fallback)
      user = await prisma.user.findUnique({ where: { email: payload.email } });
      
      if (user) {
        // Link google account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub, avatarUrl: payload.picture }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatarUrl: payload.picture
          }
        });
        // Initialize progress for new user
        await prisma.progress.create({
          data: { userId: user.id, badges: '' }
        });
      }
    }

    // Issue JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({ 
        error: 'Username must be 3-20 characters long and contain only letters, numbers, or underscores' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedUsername },
          { email: trimmedUsername },
          { email: trimmedEmail }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        passwordHash,
        email: trimmedEmail,
        name: trimmedUsername
      }
    });

    // Initialize progress for user
    await prisma.progress.create({
      data: { userId: user.id, badges: '' }
    });

    // Issue JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: trimmedEmail }
    });

    if (!user) {
      // Return generic success response for security
      return res.json({ message: 'If this email is registered, a temporary password has been sent.' });
    }

    // Generate secure temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specials = '@$!%*?&#';
    
    let tempPassword = 'Tmp';
    for (let i = 0; i < 4; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 2; i++) {
      tempPassword += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    tempPassword += specials.charAt(Math.floor(Math.random() * specials.length));

    // Hash new password
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    // Save password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Log the simulated email containing the temporary password to the terminal console
    console.log('\n==================================================');
    console.log(`✉️ [SIMULATED EMAIL SENT] TO: ${user.email}`);
    console.log(`Subject: Your Temporary Password Reset`);
    console.log(`Hello ${user.name || user.username},`);
    console.log(`We received a request to reset your password.`);
    console.log(`Your temporary password is: ${tempPassword}`);
    console.log(`Please use this temporary password to log in and reset/change your password.`);
    console.log('==================================================\n');

    res.json({ message: 'If this email is registered, a temporary password has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const trimmedUsername = username.trim();

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedUsername },
          { email: trimmedUsername }
        ]
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Issue JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl, preferredLanguage: user.preferredLanguage } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/user/me
app.get('/api/user/me', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/user/language
app.put('/api/user/language', authMiddleware, async (req: any, res: any) => {
  try {
    const { language } = req.body;
    if (language !== 'en' && language !== 'bn') {
      return res.status(400).json({ error: 'Invalid language preference. Must be "en" or "bn"' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferredLanguage: language }
    });

    res.json({ message: 'Language preference updated successfully', preferredLanguage: user.preferredLanguage });
  } catch (error) {
    console.error("Failed to update language:", error);
    res.status(500).json({ error: 'Failed to update language preference' });
  }
});

// GET /api/spark/today
app.get('/api/spark/today', authMiddleware, async (req, res) => {
  try {
    const sparksCount = await prisma.dailySpark.count();
    if (sparksCount === 0) {
      return res.status(404).json({ error: 'No daily sparks found' });
    }
    
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const dayNumber = (dayOfYear % sparksCount) + 1;
    
    const spark = await prisma.dailySpark.findUnique({
      where: { dayNumber }
    });
    
    res.json(spark);
  } catch (error) {
    console.error("Error fetching spark:", error);
    res.status(500).json({ error: 'Failed to fetch spark' });
  }
});

// POST /api/journal
app.post('/api/journal', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { dailySparkId, content } = req.body;
    
    const entry = await prisma.journalEntry.create({
      data: { userId, dailySparkId, content }
    });
    
    // Update streak logic
    const progress = await prisma.progress.findUnique({ where: { userId } });
    if (progress) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastSparkDate = progress.lastSparkDate ? new Date(progress.lastSparkDate) : null;
      if (lastSparkDate) {
        lastSparkDate.setHours(0, 0, 0, 0);
      }
      
      let newStreak = progress.currentStreak;
      const msInDay = 24 * 60 * 60 * 1000;
      
      if (!lastSparkDate) {
        newStreak = 1;
      } else {
        const diffDays = Math.round((today.getTime() - lastSparkDate.getTime()) / msInDay);
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // reset streak
        }
      }
      
      const longestStreak = Math.max(progress.longestStreak, newStreak);
      
      let badgesStr = progress.badges;
      let badgesArray = badgesStr ? badgesStr.split(',') : [];
      if (newStreak >= 3 && !badgesArray.includes('3-Day Streak')) badgesArray.push('3-Day Streak');
      if (newStreak >= 7 && !badgesArray.includes('7-Day Streak')) badgesArray.push('7-Day Streak');
      if (!badgesArray.includes('First Spark')) badgesArray.push('First Spark');
      
      await prisma.progress.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak,
          lastSparkDate: new Date(),
          badges: badgesArray.join(',')
        }
      });
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// GET /api/journal (gets own journal entries)
app.get('/api/journal', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: { dailySpark: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// DELETE /api/journal/:entryId
app.delete('/api/journal/:entryId', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const entryId = parseInt(req.params.entryId);

    const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.userId !== userId) return res.status(404).json({ error: 'Journal entry not found' });

    await prisma.dailyObservationLyraChat.deleteMany({ where: { journalEntryId: entryId } });
    await prisma.journalEntry.delete({ where: { id: entryId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// GET /api/journal/:entryId/lyra-chat
app.get('/api/journal/:entryId/lyra-chat', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const entryId = parseInt(req.params.entryId);

    const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.userId !== userId) return res.status(404).json({ error: 'Journal entry not found' });

    const chats = await prisma.dailyObservationLyraChat.findMany({
      where: { journalEntryId: entryId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST /api/journal/:entryId/lyra-chat
app.post('/api/journal/:entryId/lyra-chat', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const entryId = parseInt(req.params.entryId);
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { dailySpark: true }
    });
    if (!entry || entry.userId !== userId) return res.status(404).json({ error: 'Journal entry not found' });

    await prisma.dailyObservationLyraChat.create({ data: { journalEntryId: entryId, role: 'user', message } });

    const history = await prisma.dailyObservationLyraChat.findMany({
      where: { journalEntryId: entryId },
      orderBy: { createdAt: 'asc' }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const preferredLang = user?.preferredLanguage || 'en';

    const aiReply = await critiqueDailyObservation(
      entry.dailySpark.prompt,
      entry.content,
      history.slice(0, -1).map(h => ({ role: h.role, message: h.message })),
      preferredLang
    );

    const aiMessage = await prisma.dailyObservationLyraChat.create({
      data: { journalEntryId: entryId, role: 'model', message: aiReply }
    });

    res.json({ reply: aiReply, messageId: aiMessage.id });
  } catch (error) {
    console.error("Daily observation chat error:", error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// POST /api/mood
app.post('/api/mood', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { mood, reflection } = req.body;
    const log = await prisma.moodLog.create({
      data: { userId, mood, reflection }
    });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

// GET /api/progress
app.get('/api/progress', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    let progress = await prisma.progress.findUnique({
      where: { userId }
    });
    
    if (!progress) {
      progress = await prisma.progress.create({
        data: { userId, currentStreak: 0, longestStreak: 0, badges: '' }
      });
    }
    
    res.json({
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      badges: progress.badges ? progress.badges.split(',') : [],
      xp: progress.xp || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/deepdives
app.get('/api/deepdives', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const deepDives = await prisma.deepDive.findMany();
    
    const progressRecords = await prisma.deepDiveProgress.findMany({
      where: { userId }
    });
    
    // Map progress to deep dives
    const result = deepDives.map(dd => {
      const p = progressRecords.find(pr => pr.deepDiveId === dd.id);
      return {
        ...dd,
        status: p ? p.status : 'NOT_STARTED'
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deep dives' });
  }
});

// POST /api/deepdives/generate
app.post('/api/deepdives/generate', authMiddleware, async (req: any, res: any) => {
  try {
    const { period } = req.body;
    if (!period) return res.status(400).json({ error: 'Period is required' });
    
    const data = await generateDeepDive(period);
    
    const newDeepDive = await prisma.deepDive.create({
      data: {
        title: data.title,
        author: data.author,
        description: data.description,
        coverColor: data.coverColor || 'var(--color-primary)',
        period: period,
        passages: {
          create: data.passages?.map((p: any) => ({
            passageText: p.passageText,
            questionText: p.questionText
          })) || []
        },
        debates: {
          create: data.debates?.map((d: any) => ({
            claim: d.claim
          })) || []
        }
      },
      include: { passages: true, debates: true }
    });
    
    res.json(newDeepDive);
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: 'Failed to generate deep dive' });
  }
});

// GET /api/deepdives/:id
app.get('/api/deepdives/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const deepDiveId = parseInt(req.params.id);
    
    const deepDive = await prisma.deepDive.findUnique({
      where: { id: deepDiveId },
      include: {
        passages: true,
        debates: true
      }
    });
    
    if (!deepDive) {
      return res.status(404).json({ error: 'Deep Dive not found' });
    }
    
    const progress = await prisma.deepDiveProgress.findUnique({
      where: { userId_deepDiveId: { userId, deepDiveId } }
    });
    
    res.json({
      deepDive,
      progress: progress || { status: 'NOT_STARTED', answers: '{}' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deep dive details' });
  }
});

// POST /api/deepdives/:id/progress
app.post('/api/deepdives/:id/progress', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const deepDiveId = parseInt(req.params.id);
    const { status, newAnswers } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const preferredLang = user?.preferredLanguage || 'en';

    let progress = await prisma.deepDiveProgress.findUnique({
      where: { userId_deepDiveId: { userId, deepDiveId } }
    });
    
    let answersObj: Record<string, any> = {};
    if (progress && progress.answers) {
      try { answersObj = JSON.parse(progress.answers); } catch (e) {}
    }
    
    if (newAnswers) {
      let xpGained = 0;
      answersObj = { ...answersObj, ...newAnswers };
      
      for (const key of Object.keys(newAnswers)) {
        if (key.startsWith('debate_')) {
          xpGained += 25;
          const debateId = parseInt(key.split('_')[1]);
          const debate = await prisma.debateCard.findUnique({ where: { id: debateId } });
          if (debate) {
             const aiResponse = await evaluateDebatePosition(debate.claim, newAnswers[key], preferredLang);
             answersObj[`debate_feedback_${debateId}`] = aiResponse;
          }
        } else if (key.startsWith('passage_')) {
          xpGained += 25;
          const passageId = parseInt(key.split('_')[1]);
          const passage = await prisma.passageQuiz.findUnique({ where: { id: passageId } });
          if (passage) {
             const aiResponse = await evaluatePassageAnalysis(passage.passageText, passage.questionText, newAnswers[key], preferredLang);
             answersObj[`passage_feedback_${passageId}`] = aiResponse;
          }
        }
      }
      
      if (xpGained > 0) {
        await prisma.progress.update({
          where: { userId },
          data: { xp: { increment: xpGained } }
        });
      }
    }
    
    const updatedStatus = status || (progress ? progress.status : 'EXPLORING');
    
    progress = await prisma.deepDiveProgress.upsert({
      where: { userId_deepDiveId: { userId, deepDiveId } },
      create: {
        userId,
        deepDiveId,
        status: updatedStatus,
        answers: JSON.stringify(answersObj)
      },
      update: {
        status: updatedStatus,
        answers: JSON.stringify(answersObj)
      }
    });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// ── Reading Shelf ──────────────────────────────────────────────────────────────

// GET /api/books/google-search?q=
app.get('/api/books/google-search', authMiddleware, async (req: any, res: any) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const preferredLang = user?.preferredLanguage === 'bn' ? 'bn' : '';
    const lang = req.query.lang || preferredLang;
    const langParam = lang ? `&langRestrict=${lang}` : '';

    const apiKey = process.env.GOOGLE_BOOKS_API;
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q as string)}&maxResults=10&printType=books${keyParam}${langParam}`;
    const response = await fetch(url);
    const data: any = await response.json();

    const books = (data.items || []).map((item: any) => ({
      googleId: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      author: (item.volumeInfo?.authors || ['Unknown Author']).join(', '),
      genre: (item.volumeInfo?.categories || [])[0] || null,
      coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    }));

    res.json(books);
  } catch (error) {
    console.error("Google Books search error:", error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// GET /api/books
app.get('/api/books', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const books = await prisma.book.findMany({
      where: { userId },
      include: { notes: { orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// POST /api/books
app.post('/api/books', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { title, author, genre, coverUrl, status } = req.body;

    if (!title || !author || !status) {
      return res.status(400).json({ error: 'title, author, and status are required' });
    }

    const book = await prisma.book.create({
      data: { title, author, genre: genre || null, coverUrl: coverUrl || null, status, userId }
    });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// PUT /api/books/:id
app.put('/api/books/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);
    const { status, currentChapter } = req.body;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(status !== undefined && { status }),
        ...(currentChapter !== undefined && { currentChapter: currentChapter === null ? null : parseInt(currentChapter) })
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /api/books/:id
app.delete('/api/books/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    await prisma.bookChat.deleteMany({ where: { bookId } });
    await prisma.bookNote.deleteMany({ where: { bookId } });
    await prisma.book.delete({ where: { id: bookId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// POST /api/books/:id/notes
app.post('/api/books/:id/notes', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);
    const { content, noteType } = req.body;

    if (!content) return res.status(400).json({ error: 'content is required' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const note = await prisma.bookNote.create({
      data: { bookId, content, noteType: noteType || null }
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /api/books/:bookId/notes/:noteId
app.delete('/api/books/:bookId/notes/:noteId', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.bookId);
    const noteId = parseInt(req.params.noteId);

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    await prisma.bookNote.delete({ where: { id: noteId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// GET /api/books/:id/chat
app.get('/api/books/:id/chat', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const chats = await prisma.bookChat.findMany({
      where: { bookId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST /api/books/:id/chat
app.post('/api/books/:id/chat', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { notes: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    await prisma.bookChat.create({ data: { bookId, role: 'user', message } });

    const history = await prisma.bookChat.findMany({
      where: { bookId },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const preferredLang = user?.preferredLanguage || 'en';

    const aiReply = await chatAboutBook(
      { title: book.title, author: book.author, currentChapter: book.currentChapter },
      book.notes.map(n => n.content),
      history.slice(0, -1).map(h => ({ role: h.role, message: h.message })),
      message,
      preferredLang
    );

    const aiMessage = await prisma.bookChat.create({
      data: { bookId, role: 'model', message: aiReply }
    });

    res.json({ reply: aiReply, messageId: aiMessage.id });
  } catch (error) {
    console.error("Book chat error:", error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// ── Shelf Passage Study ────────────────────────────────────────────────────────

// GET /api/books/:id/passages
app.get('/api/books/:id/passages', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const passages = await prisma.bookPassage.findMany({
      where: { bookId },
      include: { answers: { where: { userId } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(passages.map(p => ({
      id: p.id,
      bookId: p.bookId,
      passageText: p.passageText,
      questionText: p.questionText,
      createdAt: p.createdAt,
      savedAnswer: p.answers[0]?.answer || '',
      aiFeedback: p.answers[0]?.aiFeedback || ''
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch passages' });
  }
});

// POST /api/books/:id/passages/generate — AI picks a passage from the book
app.post('/api/books/:id/passages/generate', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const { passageText, questionText } = await generateShelfPassage(book.title, book.author);

    const passage = await prisma.bookPassage.create({
      data: { bookId, passageText, questionText }
    });

    res.json({ ...passage, savedAnswer: '', aiFeedback: '' });
  } catch (error) {
    console.error("Shelf passage generate error:", error);
    res.status(500).json({ error: 'Failed to generate passage' });
  }
});

// POST /api/books/:id/passages/custom — user pastes an excerpt, AI generates question
app.post('/api/books/:id/passages/custom', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const bookId = parseInt(req.params.id);
    const { passageText } = req.body;

    if (!passageText) return res.status(400).json({ error: 'passageText required' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== userId) return res.status(404).json({ error: 'Book not found' });

    const questionText = await generateQuestionForPassage(book.title, book.author, passageText);

    const passage = await prisma.bookPassage.create({
      data: { bookId, passageText, questionText }
    });

    res.json({ ...passage, savedAnswer: '', aiFeedback: '' });
  } catch (error) {
    console.error("Custom passage error:", error);
    res.status(500).json({ error: 'Failed to create passage' });
  }
});

// POST /api/books/passages/:passageId/answer — submit analysis, get AI feedback
app.post('/api/books/passages/:passageId/answer', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const passageId = parseInt(req.params.passageId);
    const { answer } = req.body;

    if (!answer) return res.status(400).json({ error: 'answer required' });

    const passage = await prisma.bookPassage.findUnique({
      where: { id: passageId },
      include: { book: true }
    });
    if (!passage || passage.book.userId !== userId) return res.status(404).json({ error: 'Passage not found' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const preferredLang = user?.preferredLanguage || 'en';

    const aiFeedback = await evaluatePassageAnalysis(passage.passageText, passage.questionText, answer, preferredLang);

    const result = await prisma.bookPassageAnswer.upsert({
      where: { userId_passageId: { userId, passageId } },
      create: { userId, passageId, answer, aiFeedback },
      update: { answer, aiFeedback }
    });

    res.json(result);
  } catch (error) {
    console.error("Passage answer error:", error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
