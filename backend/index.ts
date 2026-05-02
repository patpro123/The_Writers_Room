import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { evaluateDebatePosition, evaluatePassageAnalysis, generateDeepDive } from './services/ai';

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'TODO_ADD_CLIENT_ID';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const DISABLE_AUTH = true;

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
             const aiResponse = await evaluateDebatePosition(debate.claim, newAnswers[key]);
             answersObj[`debate_feedback_${debateId}`] = aiResponse;
          }
        } else if (key.startsWith('passage_')) {
          xpGained += 25;
          const passageId = parseInt(key.split('_')[1]);
          const passage = await prisma.passageQuiz.findUnique({ where: { id: passageId } });
          if (passage) {
             const aiResponse = await evaluatePassageAnalysis(passage.passageText, passage.questionText, newAnswers[key]);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
