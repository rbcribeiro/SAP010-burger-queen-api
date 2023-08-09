const bcrypt = require('bcrypt');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getUsers,
} = require('../controller/users');

const { User } = require('../models');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };

  // TODO: crear usuaria admin
  next();
};


/** @module users */
module.exports = (app, next) => {

  app.get('/users', requireAdmin, getUsers);


  app.get('/users/:uid', requireAuth, async (req, res) => {
    try {
      //pega o parametro da URL requisição
      const uid = req.params.uid;
      //busca no banco de dados pelo parametro
      const user = await User.findOne({ where: { id: uid } });
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/users', requireAdmin, async (req, resp, next) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        return resp.status(400).json({ message: 'Todos os campos são obrigatórios.' });
      }

      const newUser = await User.create({ email, password, role });
      return resp.status(201).json(newUser);
    } catch (error) {
      return next(error);
    }
  });

  app.put('/users/:uid', requireAuth, (req, resp, next) => {
  });

  app.delete('/users/:uid', requireAuth, (req, resp, next) => {
  });

  initAdminUser(app, next);
};
