const bcrypt = require('bcrypt');
const saltRounds = 10; // Número de saltos (rounds) de criptografia

module.exports = {
  up: async (queryInterface) => {
    const plaintextPassword = 'admin'; // Senha em texto plano
    const hashedPassword = bcrypt.hashSync(plaintextPassword, saltRounds);
    
    const userData = {
      email: 'admin@api.com',
      password: hashedPassword, // Salve o hash da senha no banco de dados
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await queryInterface.bulkInsert('Users', [userData]);
  },

  down: async (queryInterface) => {

    await queryInterface.bulkDelete('Users', { email: 'admin@api.com' }, {});
  }
};
