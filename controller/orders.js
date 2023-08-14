// orders.js (controller)
const { Order, Product } = require('../models');

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await Order.findAll({
        include: {
          model: Product,
          through: { attributes: ['quantity'] },
        },
      });

      return resp.json(orders);
    } catch (error) {
      return next(error);
    }
  },
};
