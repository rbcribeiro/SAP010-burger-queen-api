const { prisma } = require('./config');

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.info('Conexão com o banco de dados bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

module.exports = connectDatabase;
