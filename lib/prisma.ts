import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. Buat instance dasar yang murni
const prismaBase = globalForPrisma.prisma || new PrismaClient({ log: ["query"] });

// 2. Terapkan extension pada instance dasar
export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        if (args && typeof args === 'object' && 'where' in args && (args as any).where?.tanggal) {
          const tanggal = (args as any).where.tanggal;
          if (tanggal.gte instanceof Date) {
            tanggal.gte = new Date(new Date(tanggal.gte).setHours(0, 0, 0, 0));
          }
          if (tanggal.lte instanceof Date) {
            tanggal.lte = new Date(new Date(tanggal.lte).setHours(23, 59, 59, 999));
          }
        }
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaBase;
}