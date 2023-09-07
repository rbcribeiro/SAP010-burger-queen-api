const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { secret } = require('../../config');
const { setGlobalToken } = require('../middleware/tokenStorage'); 

module.exports = {
  postAuth: async (req, resp) => {
    console.info('Received login request');
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({ error: 'O campo email e password são obrigatórios' });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    
    if (!user) {
      return resp.status(404).json({ message: 'Not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return resp.status(404).json({ message: 'Not found' });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, secret, {
      expiresIn: '1h',
    });
    setGlobalToken(token);

    resp.status(200).json({ token });
    }
};
