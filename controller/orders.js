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

      const ordersWithProcessedDate = orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        ...(order.status === 'Concluído' && { dateProcessed: order.dateProcessed }),
        Products: order.Products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          type: product.type,
          OrderProducts: {
            quantity: product.OrderProducts.quantity,
          },
        })),
      }));

      return resp.json(ordersWithProcessedDate);
    } catch (error) {
      return next(error);
    }
  },
};
