const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const { Op } = require('sequelize');
const { User } = require('../models');
const { secret } = require('../config');

module.exports = {
  postAuth: async (req, resp, next) => {
    console.info('Received login request');
    const { email, password } = req.body;

    if (!email || !password) {
        return resp.status(400).json({ message: 'Bad request' });
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
        
        return resp.status(404).json({ message: 'Not found' });
        
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return resp.status(404).json({ message: 'Not found' });
      }

      const token = jwt.sign({ email: user.email, role: user.role }, secret, { expiresIn: '1h' });
      resp.status(200).json({ token });
    } catch (error) {
      return resp.status(500).json({ message: 'Internal server error' });
    }
  },
};
