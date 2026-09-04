// Import PrismaClient dynamically to support environments where the Prisma client hasn't been generated yet
const pkg: any = require('@prisma/client');
const PrismaClient: any = pkg?.PrismaClient || pkg?.default?.PrismaClient || pkg;

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
