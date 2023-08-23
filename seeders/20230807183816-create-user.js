const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {
  up: async (queryInterface) => {
    const plaintextPassword = 'admin';
    const hashedPassword = bcrypt.hashSync(plaintextPassword, saltRounds);

    const userData = {
      email: 'admin@api.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert('Users', [userData]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@api.com' }, {});
  },
};
