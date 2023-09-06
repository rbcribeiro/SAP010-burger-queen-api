module.exports = {
    up: async (prisma) => {
      await prisma.$queryRaw`
        CREATE TABLE "User" (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL,
          "updatedAt" TIMESTAMP NOT NULL
        );
      `;
    },
  
    down: async (prisma) => {
      await prisma.$queryRaw`DROP TABLE "User";`;
    },
  };
  