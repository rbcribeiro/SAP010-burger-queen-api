const {
  requireAuth,
  requireAdmin,
  isAdmin,
} = require('../middleware/auth');
const { getProducts } = require('../controller/products');
const { Product } = require('../models');

/** @module products */
module.exports = (app, nextMain) => {
 
  app.get('/products', requireAdmin, getProducts);

  app.get('/products/:productId', requireAuth, async (req, res, next) => {
    try {
      const uid = req.params.productId;
      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/products', requireAdmin, async (req, resp, next) => {
    try {
      const { name, price, image, type } = req.body;
      if (!name || !price || !image || !type) {
        return resp.status(400).json({ message: 'Todos os campos são obrigatórios.' });
      }

      const newProduct = await Product.create({ name, price, image, type });
      return resp.status(201).json(newProduct);
    } catch (error) {
      return next(error);
    }
  });

  app.patch('/products/:productId', requireAdmin, async (req, res, next) => {
    const uid = req.params.productId;
    
    if (!isAdmin(req) && req.product.id !== parseInt(uid)) {
      return res.status(403).json({ message: 'Acesso proibido' });
    }

    try {
      const { name, price, image, type } = req.body;

      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      product.name = name || product.name;
      product.price = price || product.price;
      product.image = image || product.image;
      product.type = type || product.type;

      await product.save();

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.delete('/products/:productId', requireAdmin, async (req, resp, next) => {
    try {
      const uid = req.params.productId;
      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado' });
      }

      await product.destroy();

      resp.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  nextMain();
};
