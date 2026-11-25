# ShelfGuard

A full-stack warehouse management dashboard built with **Angular 21** (frontend) and **Fastify** (backend), powered by **PostgreSQL** and **Prisma ORM**.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 21 | Standalone components, Signals, Material Design |
| **Backend** | Fastify | Fast, lightweight REST API server |
| **Database** | PostgreSQL (Prisma Cloud) | Production-grade relational database |
| **ORM** | Prisma 8 | Type-safe database access with auto-generated client |

## Quick Start

### Prerequisites
- Node.js 24+
- `.env.local` file with `DATABASE_URL` set (see `.env.example`)

### Setup & Run

```bash
# Install dependencies
npm install

# Start backend server (Terminal 1)
npm run start:server    # http://localhost:3000

# Start Angular frontend (Terminal 2)
npm start               # http://localhost:4201
```

### Database Commands
```bash
npm run db:push         # Push schema changes to database
npm run db:seed         # Seed database with 18 test items
npm run db:reset        # Reset and re-seed database
```

### Testing
```bash
npm test                # Run unit tests (Vitest)
npm run build           # Production build
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          Angular Frontend (localhost:4201)          │
│  ✓ Inventory list with search & filters             │
│  ✓ Add/edit items (real-time DB updates)            │
│  ✓ Receive stock functionality                      │
│  ✓ Role-based access control (Admin/Viewer)         │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP (CORS enabled)
                   ↓
┌─────────────────────────────────────────────────────┐
│      Fastify REST API (localhost:3000)              │
│  ✓ GET    /api/inventory          (list items)     │
│  ✓ GET    /api/inventory/:id      (get one)        │
│  ✓ POST   /api/inventory          (create)         │
│  ✓ PUT    /api/inventory/:id      (update)         │
│  ✓ DELETE /api/inventory/:id      (delete)         │
│  ✓ POST   /api/inventory/:id/receive (stock in)   │
└──────────────────┬──────────────────────────────────┘
                   │ Prisma ORM
                   ↓
┌─────────────────────────────────────────────────────┐
│  PostgreSQL (Prisma Cloud db.prisma.io)            │
│  Tables:                                            │
│  ✓ InventoryItem (id, name, sku, stock, etc)      │
│  ✓ Supplier      (id, name, leadTimeDays)         │
│  ✓ TeamMember    (id, name, email, role)          │
└─────────────────────────────────────────────────────┘
```

## Features

### Inventory Management
- **Search**: by name or SKU (server-side filtering)
- **Status Filters**: All, In Stock, Low Stock, Out of Stock
- **Add Item**: reactive form with validation, creates in database
- **Receive Stock**: add incoming quantities, updates live
- **Delete**: with confirmation dialog (Admin only)

### Database-Driven
- ✅ All data persists in PostgreSQL
- ✅ Real-time sync between frontend and database
- ✅ Type-safe queries with Prisma
- ✅ Schema: 3 models with relationships

### Role-Based Access
- **Admin**: full CRUD operations
- **Viewer**: can view and add items (no delete)

## Project Structure

```
src/
  app/
    core/        services, interceptors, guards
    features/    inventory, settings pages
    shared/      navbar, dialogs, directives
server/
  src/
    server.ts    Fastify app + API routes
prisma/
  schema.prisma  Database schema
  seed.ts        Test data
```

## Key Design Decisions

1. **Real Backend First**: Replaced mock interceptors with live Fastify API
2. **Type Safety**: Prisma generates TypeScript client from schema
3. **CORS-Enabled**: Frontend and backend run on different ports
4. **Environment-Aware**: `.env.local` protects database credentials
5. **Persistent Data**: Changes survive app reload (database, not memory)

## Development

- API calls use real HTTP (no mocking)
- Backend logs all requests
- Frontend shows loading states and errors
- Database connection tested on startup

## Next Steps

- [ ] Team management endpoints
- [ ] Authentication & authorization
- [ ] Advanced reporting & analytics
- [ ] Docker deployment
- [ ] CI/CD pipeline

---

Built for learning modern full-stack development with Angular, Fastify, PostgreSQL, and Prisma.

