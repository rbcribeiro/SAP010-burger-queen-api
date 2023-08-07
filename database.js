const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
  config.dbConfig.database,
  config.dbConfig.user,
  config.dbConfig.password,
  {
    host: config.dbConfig.host,
    port: config.dbConfig.port,
    dialect: config.dbConfig.dialect,
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Conexão com o banco de dados bem-sucedida!'))
  .catch(err => console.error('Erro ao conectar com o banco de dados:', err));

module.exports = sequelize;
