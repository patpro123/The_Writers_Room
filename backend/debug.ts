import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.dailySpark.count().then(console.log).catch(console.error);
