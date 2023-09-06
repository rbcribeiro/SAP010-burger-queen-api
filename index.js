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
