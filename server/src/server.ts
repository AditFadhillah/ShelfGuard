import 'dotenv/config.js';
import { config } from 'dotenv';
import path from 'path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const app = Fastify({ logger: true });
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Initialize Prisma with PostgreSQL adapter
const pool = new Pool({
  connectionString: DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Register CORS with permissive settings for development
app.register(cors, {
  origin: true,
  credentials: true,
});

// ============================================================================
// INVENTORY ENDPOINTS
// ============================================================================

// GET /api/inventory - List all items with filtering
app.get<{ Querystring: { q?: string; status?: string } }>(
  '/api/inventory',
  async (request, reply) => {
    try {
      const { q, status } = request.query;

      let where: any = {};

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (status && status !== 'All') {
        if (status === 'Low Stock') {
          where.stock = { lte: 10 };
        } else if (status === 'Out of Stock') {
          where.stock = 0;
        } else if (status === 'In Stock') {
          where.stock = { gt: 10 };
        }
      }

      const items = await prisma.inventoryItem.findMany({
        where,
        include: { suppliers: true },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(items);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch inventory items' });
    }
  }
);

// GET /api/inventory/:id - Get single item
app.get<{ Params: { id: string } }>(
  '/api/inventory/:id',
  async (request, reply) => {
    try {
      const { id } = request.params;
      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: { suppliers: true },
      });

      if (!item) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      return reply.send(item);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch item' });
    }
  }
);

// GET /api/inventory/sku-exists - Check if SKU exists
app.get<{ Querystring: { sku: string } }>(
  '/api/inventory/sku-exists',
  async (request, reply) => {
    try {
      const { sku } = request.query;

      if (!sku) {
        return reply.status(400).send({ error: 'SKU is required' });
      }

      const exists = await prisma.inventoryItem.findUnique({
        where: { sku },
      });

      return reply.send({ exists: !!exists });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to check SKU' });
    }
  }
);

// POST /api/inventory - Create new item
app.post<{ Body: any }>(
  '/api/inventory',
  async (request, reply) => {
    try {
      const { name, sku, stock, category } = request.body;

      // Validation
      if (!name || !sku || stock === undefined) {
        return reply
          .status(400)
          .send({ error: 'Missing required fields: name, sku, stock' });
      }

      // Check if SKU already exists
      const existingSku = await prisma.inventoryItem.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return reply.status(409).send({ error: 'SKU already exists' });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          name,
          sku,
          stock: parseInt(stock),
          category: category || 'General',
        },
        include: { suppliers: true },
      });

      return reply.status(201).send(item);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create inventory item' });
    }
  }
);

// PUT /api/inventory/:id - Update item
app.put<{ Params: { id: string }; Body: any }>(
  '/api/inventory/:id',
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, sku, stock, category } = request.body;

      // Check if item exists
      const existing = await prisma.inventoryItem.findUnique({
        where: { id },
      });

      if (!existing) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      // Check if new SKU already exists (if changed)
      if (sku && sku !== existing.sku) {
        const conflictingSku = await prisma.inventoryItem.findUnique({
          where: { sku },
        });

        if (conflictingSku) {
          return reply.status(409).send({ error: 'SKU already exists' });
        }
      }

      const item = await prisma.inventoryItem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(sku && { sku }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
          ...(category && { category }),
        },
        include: { suppliers: true },
      });

      return reply.send(item);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update item' });
    }
  }
);

// DELETE /api/inventory/:id - Delete item
app.delete<{ Params: { id: string } }>(
  '/api/inventory/:id',
  async (request, reply) => {
    try {
      const { id } = request.params;

      const item = await prisma.inventoryItem.findUnique({
        where: { id },
      });

      if (!item) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      await prisma.inventoryItem.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete item' });
    }
  }
);

// POST /api/inventory/:id/receive - Receive stock
app.post<{ Params: { id: string }; Body: { quantity: number } }>(
  '/api/inventory/:id/receive',
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { quantity } = request.body;

      if (!quantity || quantity <= 0) {
        return reply.status(400).send({ error: 'Quantity must be a positive number' });
      }

      const item = await prisma.inventoryItem.findUnique({
        where: { id },
      });

      if (!item) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      const updated = await prisma.inventoryItem.update({
        where: { id },
        data: {
          stock: item.stock + quantity,
        },
        include: { suppliers: true },
      });

      return reply.send(updated);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to receive stock' });
    }
  }
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (request, reply) => {
  return reply.send({ status: 'ok' });
});

// ============================================================================
// START SERVER
// ============================================================================

const start = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    await app.listen({ port: PORT as number, host: '0.0.0.0' });
    console.log(`✅ Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📌 Shutting down gracefully...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
