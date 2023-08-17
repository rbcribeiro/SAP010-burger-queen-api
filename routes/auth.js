const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const { secrets } = require('../config');

module.exports = (app, nextMain) => {
  app.post('/auth', async (req, res, next) => {
    console.info('Received login request');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Bad request' });
    }

    try {
      const user = await User.findOne({
        where: {
          email: {
            [Op.eq]: email,
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'Not found' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(404).json({ message: 'Not found' });
      }

      const token = jwt.sign({ email: user.email, role: user.role }, secrets, { expiresIn: '1h' });
      res.status(200).json({ token });
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return nextMain();
};
