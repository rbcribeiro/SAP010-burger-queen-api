module.exports = {
    up: async (prisma) => {
        const existingUser = await prisma.$queryRaw`
           SELECT id FROM "User" WHERE email = 'admin@admin.com';
        `;

    if (!existingUser.length) {
        await prisma.$queryRaw`
            INSERT INTO "User" (name, email, password, role, "createdAt", "updatedAt")
            VALUES ('Renata Ribeiro', 'admin@admin.com', 'admin', 'admin', NOW(), NOW());
        `;
    }
  },

  down: async (prisma) => {},
};
