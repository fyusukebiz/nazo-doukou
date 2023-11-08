import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// 上記のコードで行なっていることは下記のとおりです。
// PrismaClient をインスタンス化し、それをグローバルオブジェクトに保存する
// PrismaClient がグローバルオブジェクトに存在しない場合のみ、インスタンス化する
// PrismaClient がグローバルオブジェクトに存在する場合は、同じインスタンスを再度使用し、余分な PrismaClient インスタンスを生成しないようにする
