const express = require('express');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const sequelize = require('./database');
const cors = require('cors');

const { port, secret } = config;
const app = express();
const { execSync } = require('child_process');

try {
  execSync('node index.js', { stdio: 'inherit' });
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao executar migrações ou index.js:', error);
  process.exit(1);
}

app.set('config', config);
app.set('pkg', pkg);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));
const corsOptions = {
  credentials: true, // Se você estiver usando cookies ou autenticação, defina como true
};

app.use(cors(corsOptions));


routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  sequelize
    .sync()
    .then(() => {
      app.listen(port, () => {
        console.info(`App listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Error synchronizing database:', error);
    });
});
