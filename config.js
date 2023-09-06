require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  adminEmail: process.env.DB_ADMIN_EMAIL,
  adminPassword: process.env.DB_ADMIN_PASSWORD,
  secret: process.env.JWT_SECRET,
};
const adminEmail = process.env.DB_ADMIN_EMAIL;
const adminPassword = process.env.DB_ADMIN_PASSWORD;
const secret = process.env.JWT_SECRET;
const port = process.env.PORT || 8888;
const remoteUrl = process.env.REMOTE_URL || `http://127.0.0.1:${port}`;

module.exports = {
  dbConfig,
  adminEmail,
  adminPassword,
  secret,
  port,
  remoteUrl,
  prisma, 
};
