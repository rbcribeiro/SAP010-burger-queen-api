const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../index'); 
const { secret } = require('../../config');

module.exports = {
  postAuth: async (req, resp) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({ message: 'Bad request' });
    }

    try {
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
      console.log('Generated token:', token);
      resp.status(200).json({ token });
    } catch (error) {
      return resp.status(500).json({ message: 'Internal server error' });
    }
  },
};
