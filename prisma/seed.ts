import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = ['Electronics', 'Apparel', 'Tools', 'Office', 'Food'];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.supplier.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.teamMember.deleteMany();

  // Seed Inventory Items
  const items = [
    {
      name: 'Laptop Computer',
      sku: 'LAP-10001',
      category: 'Electronics',
      stock: 15,
      suppliers: [
        { name: 'TechCorp', leadTimeDays: 5 },
        { name: 'ElectroPlus', leadTimeDays: 7 },
      ],
    },
    {
      name: 'Office Chair',
      sku: 'CHR-20001',
      category: 'Office',
      stock: 0,
      suppliers: [{ name: 'FurniturePro', leadTimeDays: 14 }],
    },
    {
      name: 'T-Shirt (Medium)',
      sku: 'TSH-30001',
      category: 'Apparel',
      stock: 50,
      suppliers: [
        { name: 'TextileWorld', leadTimeDays: 10 },
        { name: 'ClothMart', leadTimeDays: 12 },
      ],
    },
    {
      name: 'Power Drill',
      sku: 'DRL-40001',
      category: 'Tools',
      stock: 8,
      suppliers: [{ name: 'ToolBox', leadTimeDays: 3 }],
    },
    {
      name: 'Coffee Beans (1kg)',
      sku: 'COF-50001',
      category: 'Food',
      stock: 42,
      suppliers: [
        { name: 'FarmFresh', leadTimeDays: 2 },
        { name: 'CafePro', leadTimeDays: 4 },
      ],
    },
    {
      name: 'USB-C Cable',
      sku: 'USB-10002',
      category: 'Electronics',
      stock: 120,
      suppliers: [
        { name: 'TechCorp', leadTimeDays: 1 },
        { name: 'DigitalHub', leadTimeDays: 2 },
      ],
    },
    {
      name: 'Jeans (32x30)',
      sku: 'JEN-30002',
      category: 'Apparel',
      stock: 3,
      suppliers: [{ name: 'DenimCo', leadTimeDays: 8 }],
    },
    {
      name: 'Hammer (16oz)',
      sku: 'HMR-40002',
      category: 'Tools',
      stock: 25,
      suppliers: [
        { name: 'ToolBox', leadTimeDays: 2 },
        { name: 'HardwarePlus', leadTimeDays: 3 },
      ],
    },
    {
      name: 'Desk Lamp',
      sku: 'LAM-20002',
      category: 'Office',
      stock: 11,
      suppliers: [{ name: 'LightingCo', leadTimeDays: 6 }],
    },
    {
      name: 'Wireless Mouse',
      sku: 'MOU-10003',
      category: 'Electronics',
      stock: 55,
      suppliers: [
        { name: 'PeripheralPro', leadTimeDays: 3 },
        { name: 'TechCorp', leadTimeDays: 4 },
      ],
    },
    {
      name: 'Notebook Set',
      sku: 'NOT-20003',
      category: 'Office',
      stock: 0,
      suppliers: [{ name: 'PaperMill', leadTimeDays: 7 }],
    },
    {
      name: 'Winter Jacket',
      sku: 'JAC-30003',
      category: 'Apparel',
      stock: 7,
      suppliers: [{ name: 'OuterwearCo', leadTimeDays: 15 }],
    },
    {
      name: 'Circular Saw',
      sku: 'SAW-40003',
      category: 'Tools',
      stock: 6,
      suppliers: [
        { name: 'PowerTools', leadTimeDays: 5 },
        { name: 'ToolBox', leadTimeDays: 4 },
      ],
    },
    {
      name: 'Pasta (1lb)',
      sku: 'PAS-50002',
      category: 'Food',
      stock: 200,
      suppliers: [
        { name: 'GrainCo', leadTimeDays: 1 },
        { name: 'DryGoods', leadTimeDays: 3 },
      ],
    },
    {
      name: 'Monitor Stand',
      sku: 'MNT-20004',
      category: 'Office',
      stock: 9,
      suppliers: [{ name: 'ErgoFurniture', leadTimeDays: 5 }],
    },
    {
      name: 'Graphics Card',
      sku: 'GPU-10004',
      category: 'Electronics',
      stock: 2,
      suppliers: [{ name: 'GamingPro', leadTimeDays: 10 }],
    },
    {
      name: 'Work Gloves',
      sku: 'GLV-30004',
      category: 'Apparel',
      stock: 85,
      suppliers: [{ name: 'ProtectiveWear', leadTimeDays: 4 }],
    },
    {
      name: 'Screwdriver Set',
      sku: 'SCR-40004',
      category: 'Tools',
      stock: 18,
      suppliers: [
        { name: 'ToolBox', leadTimeDays: 1 },
        { name: 'HardwarePlus', leadTimeDays: 2 },
      ],
    },
  ];

  for (const item of items) {
    const { suppliers, ...itemData } = item;
    const createdItem = await prisma.inventoryItem.create({
      data: {
        ...itemData,
        suppliers: {
          create: suppliers,
        },
      },
    });
    console.log(`✓ Created: ${createdItem.name} (${createdItem.sku})`);
  }

  // Seed Team Members
  const teamMembers = [
    { name: 'Alice Johnson', email: 'alice@shelfguard.local', role: 'Admin' },
    { name: 'Bob Smith', email: 'bob@shelfguard.local', role: 'Admin' },
    { name: 'Carol White', email: 'carol@shelfguard.local', role: 'Viewer' },
    { name: 'David Brown', email: 'david@shelfguard.local', role: 'Viewer' },
    { name: 'Eve Davis', email: 'eve@shelfguard.local', role: 'Viewer' },
  ];

  for (const member of teamMembers) {
    const createdMember = await prisma.teamMember.create({
      data: member,
    });
    console.log(`✓ Added team member: ${createdMember.name} (${createdMember.role})`);
  }

  console.log('✅ Seed complete!');
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
