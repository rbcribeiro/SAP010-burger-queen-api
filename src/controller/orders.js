const prisma = require('../../index'); 


module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      const ordersWithProcessedDate = orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        ...(order.status === 'Concluído' && {
          dateProcessed: order.dateProcessed,
        }),
        Products: order.products.map((orderProduct) => ({
          id: orderProduct.product.id,
          name: orderProduct.product.name,
          price: orderProduct.product.price,
          image: orderProduct.product.image,
          type: orderProduct.product.type,
          OrderProducts: {
            quantity: orderProduct.quantity,
          },
        })),
      }));

      return resp.json(ordersWithProcessedDate);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          products: {
            include: {
              product: true,
            },
          },
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
        Products: order.products.map((orderProduct) => ({
          id: orderProduct.product.id,
          name: orderProduct.product.name,
          price: orderProduct.product.price,
          image: orderProduct.product.image,
          type: orderProduct.product.type,
          OrderProducts: {
            quantity: orderProduct.quantity,
          },
        })),
      };

      resp.status(200).json(responseOrder);
    } catch (error) {
      next(error);
    }
  },

  createOrder: async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;

      if (!userId || !client || !products || !products.length) {
        return resp
          .status(400)
          .json({ message: 'Dados incompletos na requisição.' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return resp
          .status(404)
          .json({ message: `Usuário com ID ${userId} não encontrado.` });
      }

      const order = await prisma.order.create({
        data: {
          userId,
          client,
          status: 'Pendente',
          dateEntry: new Date(),
          products: {
            createMany: {
              data: products.map((productData) => ({
                quantity: productData.qty,
                product: {
                  connect: { id: productData.product.id },
                },
              })),
            },
          },
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      const responseOrder = {
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        Products: order.products.map((orderProduct) => ({
          id: orderProduct.product.id,
          name: orderProduct.product.name,
          price: orderProduct.product.price,
          image: orderProduct.product.image,
          type: orderProduct.product.type,
          OrderProducts: {
            quantity: orderProduct.quantity,
          },
        })),
      };

      resp.status(201).json(responseOrder);
    } catch (error) {
      next(error);
    }
  },

  updateOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const allowedStatusValues = ['Pendente', 'Processando', 'Concluído'];

      if (!allowedStatusValues.includes(status)) {
        return resp.status(400).json({
          message: `O valor do campo status deve ser um dos seguintes: ${allowedStatusValues.join(
            ', '
          )}`,
        });
      }

      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status,
          dateProcessed: status === 'Concluído' ? new Date() : null,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      const responseOrder = {
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        dateProcessed: order.dateProcessed,
        Products: order.products.map((orderProduct) => ({
          id: orderProduct.product.id,
          name: orderProduct.product.name,
          price: orderProduct.product.price,
          image: orderProduct.product.image,
          type: orderProduct.product.type,
          OrderProducts: {
            quantity: orderProduct.quantity,
          },
        })),
      };

      resp.status(200).json(responseOrder);
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params;

      await prisma.order.delete({
        where: { id: parseInt(orderId) },
      });

      resp.status(200).json({ message: 'Ordem excluída com sucesso!' });
    } catch (error) {
      next(error);
    }
  },
};
