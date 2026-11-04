import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * -------------------------------------------------------------
 * Prisma Client Singleton with PostgreSQL Driver Adapter
 * -------------------------------------------------------------
 * Configures Prisma with the official `@prisma/adapter-pg` driver adapter
 * for optimal connection pooling with serverless Neon PostgreSQL.
 */
const connectionString = `${process.env.DATABASE_URL}`;

// Initialize PostgreSQL driver adapter
const adapter = new PrismaPg({ connectionString });

// Instantiate singleton Prisma Client
const prisma = new PrismaClient({ adapter });

export { prisma };
