// users.js (controller)
const bcrypt = require('bcrypt');
const { User } = require('../models');

const handleServerError = (req, resp, next) => {
  try {
    throw new Error('Erro interno do servidor.');
  } catch (error) {
    next({ status: 500, message: error.message });
  }
};

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const users = await User.findAll();
      return resp.json(users);
    } catch (error) {      
      handleServerError(req, resp, next);
    }
  },

  getUserById: async (req, resp, next) => {
    try {
      const uid = req.params.userId;
      const user = await User.findOne({ where: { id: uid } });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      return resp.status(200).json(user);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  createUser: async (req, resp, next) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        return resp.status(400).json({ message: 'Todos os campos são obrigatórios.' });
      }

      const newUser = await User.create({
        email,
        password: bcrypt.hashSync(password, 10),
        role,
      });
      return resp.status(201).json(newUser);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  updateUser: async (req, resp, next) => {
    const uid = req.params.userId;

    try {
      const { email, password, role } = req.body;

      const user = await User.findOne({ where: { id: uid } });

      if (!user) {
        handleServerError(req, resp, next);
      }

      user.email = email || user.email;
      if (password) {
        user.password = bcrypt.hashSync(password, 10);
      }
      user.role = role || user.role;

      await user.save();

      return resp.status(200).json(user);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  deleteUser: async (req, resp, next) => {
    try {
      const uid = req.params.userId;
      const user = await User.findOne({ where: { id: uid } });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      await user.destroy();

      return resp.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },
};