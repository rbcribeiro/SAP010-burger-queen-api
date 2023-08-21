const { Product } = require('../models');
const { isAdmin } = require('../middleware/auth');

const handleServerError = (req, resp, next) => {
  try {
    throw new Error('Erro interno do servidor.');
  } catch (error) {
    next({ status: 500, message: error.message });
  }
};

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await Product.findAll();
      return resp.json(products);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  getProductById: async (req, resp, next) => {
    try {
      const uid = req.params.productId;
      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado' });
      }

      resp.status(200).json(product);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  createProduct: async (req, resp, next) => {
    try {
      const {
        name,
        price,
        image,
        type,
      } = req.body;
      if (!name || !price || !image || !type) {
        return resp.status(400).json({ message: 'Todos os campos são obrigatórios.' });
      }

      const newProduct = await Product.create({
        name,
        price,
        image,
        type,
      });
      return resp.status(201).json(newProduct);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  updateProduct: async (req, resp, next) => {
    const uid = req.params.productId;

    if (!isAdmin(req) && req.product.id !== parseInt(uid, 10)) {
      return resp.status(403).json({ message: 'Acesso proibido' });
    }

    try {
      const {
        name,
        price,
        image,
        type,
      } = req.body;

      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado.' });
      }

      product.name = name || product.name;
      product.price = price || product.price;
      product.image = image || product.image;
      product.type = type || product.type;

      await product.update({
        name: product.name,
        price: product.price,
        image: product.image,
        type: product.type,
      });

      resp.status(200).json(product);
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },

  deleteProduct: async (req, resp, next) => {
    try {
      const uid = req.params.productId;
      const product = await Product.findOne({ where: { id: uid } });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado' });
      }

      await product.destroy();

      resp.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
      handleServerError(req, resp, next);
    }
  },
};
