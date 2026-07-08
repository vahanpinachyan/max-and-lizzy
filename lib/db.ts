import { PrismaClient } from "@prisma/client";

// Next.js dev's hot-reload re-runs this module on every edit; without
// caching the client on `globalThis`, each reload would open a new SQLite
// connection and eventually exhaust file handles.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
