import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dailySparks = [
  {
    dayNumber: 1,
    prompt: "Find a moment today where silence said more than words.",
    category: "Observation"
  },
  {
    dayNumber: 2,
    prompt: "What does your most flawed character refuse to admit?",
    category: "Character"
  },
  {
    dayNumber: 3,
    prompt: "Pick a belief you hold strongly. What's the best argument against it?",
    category: "Essay"
  },
  {
    dayNumber: 4,
    prompt: "Describe a room without mentioning the lighting, the color, or the size.",
    category: "Observation"
  },
  {
    dayNumber: 5,
    prompt: "Write a short scene where someone loses something inexpensive but invaluable.",
    category: "Narrative"
  },
  {
    dayNumber: 6,
    prompt: "If you could ask one author one question and be guaranteed the absolute truth, what would you ask?",
    category: "Essay"
  },
  // We can add up to 30 for phase 1. I'll add 10 here to start.
  {
    dayNumber: 7,
    prompt: "Write about a time you noticed someone else's habit before they did.",
    category: "Observation"
  },
  {
    dayNumber: 8,
    prompt: "What is a secret your protagonist thinks they are keeping well, but everyone knows?",
    category: "Character"
  },
  {
    dayNumber: 9,
    prompt: "Why do we read fiction if we know it isn't true?",
    category: "Essay"
  },
  {
    dayNumber: 10,
    prompt: "Describe the smell of the last place you felt truly safe.",
    category: "Observation"
  }
];

async function main() {
  for (const spark of dailySparks) {
    await prisma.dailySpark.upsert({
      where: { dayNumber: spark.dayNumber },
      update: spark,
      create: spark,
    });
  }
  console.log("Seeded Daily Sparks");

  // Seed Deep Dives
  const deepDivesCount = await prisma.deepDive.count();
  if (deepDivesCount === 0) {
    await prisma.deepDive.create({
      data: {
        title: "To the Lighthouse",
        author: "Virginia Woolf",
        description: "An exploration of memory, art, and the passage of time through the eyes of the Ramsay family.",
        coverColor: "#2A4B7C", // Deep ocean blue
        passages: {
          create: [
            {
              passageText: "What is the meaning of life? That was all—a simple question; one that tended to close in on one with years, the great revelation had never come. The great revelation perhaps never did come. Instead, there were little daily miracles, illuminations, matches struck unexpectedly in the dark; here was one.",
              questionText: "How does Woolf use the metaphor of 'matches struck unexpectedly in the dark' to redefine the concept of a 'revelation'?"
            }
          ]
        },
        debates: {
          create: [
            {
              claim: "Woolf argues that true connection between human beings is ultimately impossible, and that we are all isolated in our own consciousness."
            }
          ]
        }
      }
    });

    await prisma.deepDive.create({
      data: {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A critique of the American Dream, wrapped in a tragic love story and the decadence of the Jazz Age.",
        coverColor: "#C3A343", // Gold
        passages: {
          create: [
            {
              passageText: "He smiled understandingly-much more than understandingly. It was one of those rare smiles with a quality of eternal reassurance in it, that you may come across four or five times in life.",
              questionText: "Analyze Nick's description of Gatsby's smile. How does Fitzgerald use this moment to build Gatsby's myth before revealing his reality?"
            }
          ]
        },
        debates: {
          create: [
            {
              claim: "Gatsby is not driven by love for Daisy, but by his obsession with the idea of the past and his own constructed identity."
            }
          ]
        }
      }
    });
    console.log("Seeded Deep Dives");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
