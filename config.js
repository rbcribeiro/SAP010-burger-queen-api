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
}

const secret =process.env.JWT_SECRET;
const port = process.env.PORT || 8080;


module.exports = {
  dbConfig,
  secret,
  port,
};
