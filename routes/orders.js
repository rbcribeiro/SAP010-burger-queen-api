const {
  requireAuth,
} = require('../middleware/auth');
const { getOrders } = require('../controller/orders');
const { Order, Product, User } = require('../models');

/** @module orders */
module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, getOrders);

  app.get('/orders/:orderId', requireAuth, async (req, resp, next) => {
    try {
      const orderId = req.params.orderId;
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
  
      resp.status(200).json(order);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
  

  app.post('/orders', requireAuth, async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;
  
      if (!userId || !client || !products || !products.length) {
        return resp.status(400).json({ message: 'Dados incompletos na requisição.' });
      }
  
      const existingUser = await User.findByPk(userId);
      if (!existingUser) {
        return resp.status(404).json({ message: `Usuário com ID ${userId} não encontrado.` });
      }
  
    } catch (error) {
      console.error(error);
      return resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
  
  

  app.patch('/orders/:orderId', requireAuth, async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;
  
      const allowedStatusValues = ['Pendente', 'Processando', 'Concluído'];
  
      if (!allowedStatusValues.includes(status)) {
        return res.status(400).json({
          message: `O valor do campo "status" deve ser um dos seguintes: ${allowedStatusValues.join(', ')}`,
        });
      }
  
      const order = await Order.findByPk(orderId);
  
      if (!order) {
        return res.status(404).json({ message: 'Ordem não encontrada' });
      }
  
      order.status = status;
      
      await order.save();
  
      res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
  
  

  app.delete('/orders/:orderId', requireAuth, async (req, resp, next) => {
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
