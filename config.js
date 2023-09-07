require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  database: process.env.DATABASE_URL_,
  adminEmail: process.env.DB_ADMIN_EMAIL,
  adminPassword: process.env.DB_ADMIN_PASSWORD,
  secret: process.env.JWT_SECRET,
};
const adminEmail = process.env.DB_ADMIN_EMAIL;
const adminPassword = process.env.DB_ADMIN_PASSWORD;
const secret = process.env.JWT_SECRET;
const port = process.env.PORT ;
const remoteUrl = process.env.REMOTE_URL || `sap-010-burger-queen-api-eg2u-git-main-rbcribeiro.vercel.app`;

module.exports = {
  dbConfig,
  adminEmail,
  adminPassword,
  secret,
  port,
  remoteUrl,

};
