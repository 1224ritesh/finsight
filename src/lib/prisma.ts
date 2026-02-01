import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;

// Create a PrismaNeon adapter using plain config
const adapter = new PrismaNeon({ connectionString });

// Create the Prisma client with the adapter
export const prisma = new PrismaClient({ adapter });
