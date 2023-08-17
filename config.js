const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
  adminEmail: process.env.DB_ADMIN_EMAIL,
  adminPassword: process.env.DB_ADMIN_PASSWORD,
};

const secrets = process.env.JWT_SECRETS;
const port = process.env.PORT || 8888;
const remoteUrl = process.env.REMOTE_URL || `http://127.0.0.1:${port}`;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
  },
);

module.exports = {
  dbConfig,
  secrets,
  port,
  remoteUrl,
  sequelize,
};
