const { requireAuth } = require('../middleware/auth');
const { getOrders } = require('../controller/orders');
const { Order, Product, User } = require('../models');

module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, getOrders);

  app.get('/orders/:orderId', requireAuth, async (req, resp) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findOne({
        where: { id: orderId },
        include: {
          model: Product,
          through: { attributes: ['quantity'] },
        },
      });

      if (!order) {
        return resp.status(404).json({ message: 'Ordem não encontrada' });
      }

      const responseOrder = {
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        ...(order.status === 'Concluído' && {
          dateProcessed: order.dateProcessed,
        }),
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
      };

      resp.status(200).json(responseOrder);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/orders', requireAuth, async (req, resp) => {
    try {
      const { userId, client, products } = req.body;

      if (!userId || !client || !products || !products.length) {
        return resp
          .status(400)
          .json({ message: 'Dados incompletos na requisição.' });
      }

      const existingUser = await User.findByPk(userId);
      if (!existingUser) {
        return resp
          .status(404)
          .json({ message: `Usuário com ID ${userId} não encontrado.` });
      }

      const order = await Order.create({
        userId,
        client,
        status: 'Pendente',
        dateEntry: new Date(),
      });

      const addProductPromises = products.map(async (productData) => {
        const { qty, product } = productData;
        const existingProduct = await Product.findByPk(product.id);

        if (!existingProduct) {
          return resp
            .status(404)
            .json({ message: `Produto com ID ${product.id} não encontrado.` });
        }

        await order.addProduct(existingProduct, { through: { quantity: qty } });
      });

      await Promise.all(addProductPromises);

      const orderWithProducts = await Order.findByPk(order.id, {
        include: {
          model: Product,
          through: { attributes: ['quantity'] },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      const responseOrder = {
        id: orderWithProducts.id,
        userId: orderWithProducts.userId,
        client: orderWithProducts.client,
        status: orderWithProducts.status,
        dateEntry: orderWithProducts.dateEntry,
        Products: orderWithProducts.Products,
      };

      if (orderWithProducts.dateProcessed !== null) {
        responseOrder.dateProcessed = orderWithProducts.dateProcessed;
      }

      return resp.status(201).json(responseOrder);
    } catch (error) {
      console.error(error);
      return resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.patch('/orders/:orderId', requireAuth, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const allowedStatusValues = ['Pendente', 'Processando', 'Concluído'];

      if (!allowedStatusValues.includes(status)) {
        return res.status(400).json({
          message: `O valor do campo 'status' deve ser um dos seguintes: ${allowedStatusValues.join(
            ', ',
          )}`,
        });
      }

      const order = await Order.findByPk(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Ordem não encontrada' });
      }

      if (order.status !== 'Concluído' && status === 'Concluído') {
        order.dateProcessed = new Date();
      }

      order.status = status;

      await order.save();

      const responseOrder = {
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        dateProcessed: order.dateProcessed,
      };

      res.status(200).json(responseOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.delete('/orders/:orderId', requireAuth, async (req, resp) => {
    try {
      const uid = req.params.orderId;
      const order = await Order.findOne({ where: { id: uid } });

      if (!order) {
        return resp.status(404).json({ message: 'Ordem não encontrada' });
      }

      await order.destroy();

      resp.status(200).json({ message: 'Ordem excluída com sucesso!' });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  nextMain();
};
