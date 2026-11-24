/**
 * Prisma Query Examples for ShelfGuard
 *
 * This file demonstrates common Prisma patterns used in the ShelfGuard backend.
 * These examples show how to query, create, update, and delete data with type safety.
 */

import { prisma } from './prisma.service';

// ============================================================================
// BASIC CRUD OPERATIONS
// ============================================================================

/**
 * Get all inventory items
 */
export async function getAllInventoryItems() {
  return await prisma.inventoryItem.findMany({
    include: {
      suppliers: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single item by ID
 */
export async function getInventoryItemById(id: string) {
  return await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Get item by SKU
 */
export async function getInventoryItemBySku(sku: string) {
  return await prisma.inventoryItem.findUnique({
    where: { sku },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Create a new inventory item with suppliers
 */
export async function createInventoryItem(data: {
  name: string;
  sku: string;
  category: string;
  stock: number;
  suppliers: Array<{ name: string; leadTimeDays: number }>;
}) {
  return await prisma.inventoryItem.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      stock: data.stock,
      suppliers: {
        create: data.suppliers,
      },
    },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Update item stock
 */
export async function updateItemStock(id: string, stock: number) {
  return await prisma.inventoryItem.update({
    where: { id },
    data: { stock },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Delete an item (suppliers are auto-deleted due to cascade)
 */
export async function deleteInventoryItem(id: string) {
  return await prisma.inventoryItem.delete({
    where: { id },
  });
}

// ============================================================================
// FILTERING & SEARCHING
// ============================================================================

/**
 * Search items by name or SKU (case-insensitive)
 */
export async function searchInventoryItems(query: string) {
  return await prisma.inventoryItem.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Filter items by stock status
 */
export async function getItemsByStockStatus(status: 'In Stock' | 'Low Stock' | 'Out of Stock') {
  let where;

  switch (status) {
    case 'Out of Stock':
      where = { stock: 0 };
      break;
    case 'Low Stock':
      where = { stock: { gt: 0, lte: 10 } };
      break;
    case 'In Stock':
      where = { stock: { gt: 10 } };
      break;
  }

  return await prisma.inventoryItem.findMany({
    where,
    include: {
      suppliers: true,
    },
    orderBy: { stock: 'asc' },
  });
}

/**
 * Filter items by category
 */
export async function getItemsByCategory(category: string) {
  return await prisma.inventoryItem.findMany({
    where: { category },
    include: {
      suppliers: true,
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Combined search and filter
 */
export async function searchAndFilterItems(query: string, status?: string, category?: string) {
  return await prisma.inventoryItem.findMany({
    where: {
      AND: [
        // Search condition
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        // Status filter
        status === 'Out of Stock'
          ? { stock: 0 }
          : status === 'Low Stock'
            ? { stock: { gt: 0, lte: 10 } }
            : status === 'In Stock'
              ? { stock: { gt: 10 } }
              : {},
        // Category filter
        category ? { category } : {},
      ],
    },
    include: {
      suppliers: true,
    },
  });
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Paginated results
 */
export async function getPaginatedItems(page: number, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      skip,
      take: pageSize,
      include: {
        suppliers: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.inventoryItem.count(),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================================================
// SUPPLIER OPERATIONS
// ============================================================================

/**
 * Add supplier to item
 */
export async function addSupplierToItem(itemId: string, supplier: { name: string; leadTimeDays: number }) {
  return await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      suppliers: {
        create: supplier,
      },
    },
    include: {
      suppliers: true,
    },
  });
}

/**
 * Remove supplier
 */
export async function removeSupplier(supplierId: string) {
  return await prisma.supplier.delete({
    where: { id: supplierId },
  });
}

/**
 * Get all suppliers for an item
 */
export async function getSuppliersByItemId(itemId: string) {
  return await prisma.supplier.findMany({
    where: { inventoryItemId: itemId },
  });
}

// ============================================================================
// TEAM OPERATIONS
// ============================================================================

/**
 * Get all team members
 */
export async function getAllTeamMembers() {
  return await prisma.teamMember.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get team member by ID
 */
export async function getTeamMemberById(id: string) {
  return await prisma.teamMember.findUnique({
    where: { id },
  });
}

/**
 * Get team members by role
 */
export async function getTeamMembersByRole(role: 'Admin' | 'Viewer') {
  return await prisma.teamMember.findMany({
    where: { role },
    orderBy: { name: 'asc' },
  });
}

/**
 * Create a team member
 */
export async function createTeamMember(data: { name: string; email: string; role: string }) {
  return await prisma.teamMember.create({
    data,
  });
}

/**
 * Update team member
 */
export async function updateTeamMember(id: string, data: Partial<{ name: string; email: string; role: string }>) {
  return await prisma.teamMember.update({
    where: { id },
    data,
  });
}

/**
 * Delete team member
 */
export async function deleteTeamMember(id: string) {
  return await prisma.teamMember.delete({
    where: { id },
  });
}

// ============================================================================
// STATISTICS & REPORTING
// ============================================================================

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  const items = await prisma.inventoryItem.findMany({
    select: {
      stock: true,
      category: true,
    },
  });

  const stats = {
    totalItems: items.length,
    totalStock: items.reduce((sum, item) => sum + item.stock, 0),
    outOfStock: items.filter((i) => i.stock === 0).length,
    lowStock: items.filter((i) => i.stock > 0 && i.stock <= 10).length,
    byCategory: {} as Record<string, number>,
  };

  items.forEach((item) => {
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
  });

  return stats;
}

/**
 * Get items needing restock
 */
export async function getRestockNeeded() {
  return await prisma.inventoryItem.findMany({
    where: { stock: { lte: 10 } },
    include: {
      suppliers: {
        select: {
          name: true,
          leadTimeDays: true,
        },
      },
    },
    orderBy: { stock: 'asc' },
  });
}

// ============================================================================
// TRANSACTIONS (Advanced)
// ============================================================================

/**
 * Update stock across multiple items (atomic operation)
 */
export async function updateMultipleStocks(updates: Array<{ id: string; stock: number }>) {
  return await prisma.$transaction(
    updates.map((update) =>
      prisma.inventoryItem.update({
        where: { id: update.id },
        data: { stock: update.stock },
      }),
    ),
  );
}

/**
 * Transfer stock between items (atomic)
 */
export async function transferStock(fromId: string, toId: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    const fromItem = await tx.inventoryItem.findUniqueOrThrow({ where: { id: fromId } });

    if (fromItem.stock < amount) {
      throw new Error('Insufficient stock for transfer');
    }

    await tx.inventoryItem.update({
      where: { id: fromId },
      data: { stock: { decrement: amount } },
    });

    await tx.inventoryItem.update({
      where: { id: toId },
      data: { stock: { increment: amount } },
    });

    return { fromId, toId, amount };
  });
}
