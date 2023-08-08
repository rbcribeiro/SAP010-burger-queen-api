// users.js (controller)
const { User } = require('../models');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      // Aqui você deve implementar a lógica para buscar todos os usuários no banco de dados.
      // Você pode usar o modelo do Sequelize para fazer uma consulta ao banco de dados.

      const users = await User.findAll(); // Isso buscará todos os usuários no banco de dados.

      // Se a busca for bem-sucedida, envie a lista de usuários como resposta.
      return resp.json(users);
    } catch (error) {
      // Se ocorrer algum erro durante a busca, capture o erro aqui
      // e envie uma resposta de erro apropriada.
      return next(error);
    }
  },
};
