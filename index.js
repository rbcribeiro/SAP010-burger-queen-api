const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const config = require('./config');
const authMiddleware = require('./src/middleware/auth');
const errorHandler = require('./src/middleware/error');
const routes = require('./src/routes');
const pkg = require('./package.json');
const cors = require('cors');

const { port, secret } = config;
const app = express();

app.set('config', config);
app.set('pkg', pkg);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));
const corsOptions = {
  credentials: true, 
};


app.use(cors(corsOptions));

routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});


async function testPrismaConnection() {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}
testPrismaConnection();


