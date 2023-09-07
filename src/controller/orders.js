const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              type: true,
              OrderProducts: {
                select: {
                  quantity: true,
                },
              },
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
        Products: order.products.map((product) => ({
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
      next(error);
    }
  },

  getOrderById: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              type: true,
              OrderProducts: {
                select: {
                  quantity: true,
                },
              },
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
        Products: order.products.map((product) => ({
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
      next(error);
    }
  },

  createOrder: async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;
  
      console.log('userId:', userId);
      console.log('client:', client);
      console.log('products:', products);
  
      if (!userId || !client || !products || !products.length) {
        return resp
          .status(400)
          .json({ message: 'Dados incompletos na requisição.' });
      }
  
      const existingUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      console.log('existingUser:', existingUser);
  
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
          // Adicione quaisquer outros campos necessários aqui.
        },
      });
  
      console.log('order:', order);
  
      const addProductPromises = products.map(async (productData) => {
        const { qty, product } = productData;
        const existingProduct = await prisma.product.findUnique({
          where: {
            id: product.id,
          },
        });
  
        console.log('existingProduct:', existingProduct);
  
        if (!existingProduct) {
          return resp
            .status(404)
            .json({ message: `Produto com ID ${product.id} não encontrado.` });
        }
  
        await prisma.orderProduct.create({
          data: {
            orderId: order.id,
            productId: existingProduct.id,
            quantity: qty,
          },
        });
      });
  
      console.log('addProductPromises:', addProductPromises);
  
      await Promise.all(addProductPromises);
  
      const orderWithProducts = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              // Inclua aqui os campos que deseja selecionar dos produtos.
            },
            through: {
              select: {
                quantity: true,
              },
            },
          },
        },
        select: {
          id: true,
          userId: true,
          client: true,
          status: true,
          dateEntry: true,
          dateProcessed: true,
        },
      });
  
      console.log('orderWithProducts:', orderWithProducts);
  
      const responseOrder = {
        id: orderWithProducts.id,
        userId: orderWithProducts.userId,
        client: orderWithProducts.client,
        status: orderWithProducts.status,
        dateEntry: orderWithProducts.dateEntry,
        Products: orderWithProducts.products,
      };
  
      console.log('responseOrder:', responseOrder);
  
      if (orderWithProducts.dateProcessed !== null) {
        responseOrder.dateProcessed = orderWithProducts.dateProcessed;
      }
  
      return resp.status(201).json(responseOrder);
    } catch (error) {
      console.error('Erro:', error);
      next(error);
    } finally {
      await prisma.$disconnect();
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
            ', ',
          )}`,
        });
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          dateProcessed: status === 'Concluído' ? new Date() : null,
        },
      });

      const responseOrder = {
        id: order.id,
        userId: order.userId,
        client: order.client,
        status: order.status,
        dateEntry: order.dateEntry,
        dateProcessed: order.dateProcessed,
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
        where: { id: orderId },
      });

      resp.status(200).json({ message: 'Ordem excluída com sucesso!' });
    } catch (error) {
      next(error);
    }
  },
};
