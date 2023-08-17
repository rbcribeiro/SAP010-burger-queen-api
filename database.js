const sequelize = require('./config').sequelize;

sequelize
  .authenticate()
  .then(() => console.info('Conexão com o banco de dados bem-sucedida!'))
  .catch((err) => console.error('Erro ao conectar com o banco de dados:', err));

module.exports = sequelize;
