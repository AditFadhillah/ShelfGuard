/**
 * Database Service Layer
 *
 * This module provides a singleton PrismaClient instance
 * for use throughout the backend application.
 *
 * Usage:
 *   import { prisma } from './prisma.service';
 *   const items = await prisma.inventoryItem.findMany();
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server and database connection');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and database connection');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
