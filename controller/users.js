// users.js (controller)
const { User } = require('../models');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const users = await User.findAll();

      return resp.json(users);
    } catch (error) {
      return next(error);
    }
  },
};
