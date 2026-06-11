import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof prismaClientSingleton> };

const prismaClientSingleton = () => {
  const baseClient = new PrismaClient({
    log: ["query"],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Logika filter tanggal kamu
          if (args && typeof args === 'object' && 'where' in args && (args as any).where?.tanggal) {
            const tanggal = (args as any).where.tanggal;

            if (tanggal.gte && tanggal.gte instanceof Date) {
              const d = new Date(tanggal.gte);
              tanggal.gte = new Date(d.setHours(0, 0, 0, 0));
            }

            if (tanggal.lte && tanggal.lte instanceof Date) {
              const d = new Date(tanggal.lte);
              tanggal.lte = new Date(d.setHours(23, 59, 59, 999));
            }
          }
          return query(args);
        },
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}