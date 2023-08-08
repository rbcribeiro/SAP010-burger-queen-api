// Arquivo: seeders/20230807123456-create-user.js (o nome do arquivo pode variar)
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dados do usuário a serem inseridos no banco de dados
    const userData = {
      email: 'chef@chef.com',
      password: 'chef',
      role: 'chef',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insira o usuário na tabela "Users"
    await queryInterface.bulkInsert('Users', [userData]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remova o usuário inserido (se necessário)
    await queryInterface.bulkDelete('Users', { email: 'chef@chef.com' }, {});
  }
};
