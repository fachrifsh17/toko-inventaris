// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: any };

const baseClient = new PrismaClient({
  log: ["query"],
});

export const prisma = baseClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        // ✅ Cek aman: hanya proses jika 'where' ada di dalam args
        if (args && typeof args === 'object' && 'where' in args && (args as any).where?.tanggal) {
          const tanggal = (args as any).where.tanggal;

          if (tanggal.gte && tanggal.gte instanceof Date) {
            const d = new Date(tanggal.gte);
            tanggal.gte = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
          }

          if (tanggal.lte && tanggal.lte instanceof Date) {
            const d = new Date(tanggal.lte);
            tanggal.lte = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          }
        }

        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}