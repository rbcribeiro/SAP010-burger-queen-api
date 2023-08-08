const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/modelUser');
const { secret } = require('../config');

module.exports = (app, nextMain) => {
  app.post('/auth', async (req, res, next) => {
    console.log('Received login request');
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
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
        return next(401);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return next(401);
      }

      const token = jwt.sign({ email: user.email, role: user.role }, secret, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      next(500);
    }
  });

  return nextMain();
};
