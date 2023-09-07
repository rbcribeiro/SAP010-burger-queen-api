const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

module.exports = {
  initAdminUser: async (app, next) => {
    const { adminEmail, adminPassword } = app.get('../config');
    if (!adminEmail || !adminPassword) {
      return next();
    }

    const adminUser = {
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: 'admin',
      name: 'Admin',
    };

    try {
      await prisma.user.upsert({
        where: { email: adminUser.email },
        update: adminUser,
        create: adminUser,
      });
    } catch (error) {
      next(error);
    }

    next();
  },

  getUsers: async (req, resp, next) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,

        },
      });
  
      return resp.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
  
  

  getUserById: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      resp.status(200).json(user);
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },

  createUser: async (req, resp, next) => {
    try {
      const { email, password, role, name } = req.body;
      if (!email || !password || !role || !name) {
        return next({
          status: 400,
          message: 'Todos os campos são obrigatórios.',
        });
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: bcrypt.hashSync(password, 10),
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,

        },
      });

      resp.status(201).json(newUser);
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },

  updateUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const { email, password, role, name } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(uid) },
        data: {
          email: email || user.email,
          name: name || user.name,
          password: password ? bcrypt.hashSync(password, 10) : user.password,
          role: role || user.role,
        },
      });

      resp.status(200).json(updatedUser);
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },

  deleteUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      await prisma.user.delete({
        where: { id: parseInt(uid) },
      });

      resp.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
};
