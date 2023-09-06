const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const saltRounds = 10;

const seed = async () => {
  try {
    const plaintextPassword = 'admin';
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

    const userData = {
      name : 'Renata',
      email: 'admin@api.com',
      password: hashedPassword,
      role: 'admin',
    };

    await prisma.user.create({
      data: userData,
    });

    console.log('Seed executado com sucesso.');
  } catch (error) {
    console.error('Erro ao executar o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seed()
  .catch((error) => {
    console.error('Erro ao executar o seed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
