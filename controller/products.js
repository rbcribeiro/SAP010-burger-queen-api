// users.js (controller)
const { Product } = require('../models');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await Product.findAll(); 

      return resp.json(products);
    } catch (error) {

      return next(error);
    }
  },
};