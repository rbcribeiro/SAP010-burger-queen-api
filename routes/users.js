const bcrypt = require('bcrypt');
const { requireAuth, requireAdmin, isAdmin } = require('../middleware/auth');
const { getUsers } = require('../controller/users');
const { User } = require('../models');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    role: 'admin',
  };

  // Create the admin user if not exists
  User.findOrCreate({
    where: { email: adminUser.email },
    defaults: adminUser,
  });

  next();
};

module.exports = (app, next) => {
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, async (req, res) => {
    try {
      const { uid } = req.params;
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

      const newUser = await User.create({ email, password: bcrypt.hashSync(password, 10), role });
      return resp.status(201).json(newUser);
    } catch (error) {
      return next(error);
    }
  });

  app.put('/users/:uid', requireAuth, async (req, res) => {
    const { uid } = req.params;

    // Check if the authenticated user is the same as the user being updated
    if (!isAdmin(req) && req.user.id !== parseInt(uid, 10)) {
      return res.status(403).json({ message: 'Acesso proibido' });
    }

    // Rest of the update logic
    try {
      const { email, password, role } = req.body;

      const user = await User.findOne({ where: { id: uid } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      user.email = email || user.email;
      if (password) {
        user.password = bcrypt.hashSync(password, 10);
      }
      user.role = role || user.role;

      await user.save();

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.delete('/users/:uid', requireAuth, async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await User.findOne({ where: { id: uid } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await user.destroy();

      res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  initAdminUser(app, next);
};
