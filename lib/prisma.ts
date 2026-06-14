import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaBase = globalForPrisma.prisma || new PrismaClient({ log: ["query"] });

export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        if (args && typeof args === 'object' && 'where' in args && (args as any).where?.tanggal) {
          const tanggal = (args as any).where.tanggal;
          
          if (tanggal.gte instanceof Date) {
            tanggal.gte = dayjs(tanggal.gte).tz("Asia/Jakarta").startOf("day").toDate();
          }
          if (tanggal.lte instanceof Date) {
            tanggal.lte = dayjs(tanggal.lte).tz("Asia/Jakarta").endOf("day").toDate();
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