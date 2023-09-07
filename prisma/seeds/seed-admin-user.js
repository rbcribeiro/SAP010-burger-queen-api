const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const saltRounds = 10; // Defina o número de salt rounds desejado

async function seedData() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@admin" },
    });

    if (!existingUser) {
      const plaintextPassword = "admin";
      const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);
      await prisma.user.create({
        data: {
          name: "Renata",
          email: "admin@api.com",
          password: hashedPassword,
          role: "admin",
        },
      });

      console.log("Dados de seed inseridos com sucesso.");
    } else {
      console.log(
        'O usuário com o email "admin@admin" já existe. Nenhum dado de seed inserido.'
      );
    }
  } catch (error) {
    console.error("Erro ao inserir dados de seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
