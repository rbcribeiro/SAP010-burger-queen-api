const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await prisma.product.findMany();
      return resp.json(products);
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, resp, next) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado' });
      }

      resp.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, resp, next) => {
    try {
      const {
        name, price, image, type,
      } = req.body;

      if (!name || !price || !image || !type) {
        return resp
          .status(400)
          .json({ message: 'Todos os campos são obrigatórios.' });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          price,
          image,
          type,
        },
      });

      return resp.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, resp, next) => {
    const productId = parseInt(req.params.productId);

    try {
      const {
        name, price, image, type,
      } = req.body;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado.' });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          name: name || product.name,
          price: price || product.price,
          image: image || product.image,
          type: type || product.type,
        },
      });

      resp.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, resp, next) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return resp.status(404).json({ message: 'Produto não encontrado' });
      }

      await prisma.product.delete({
        where: { id: productId },
      });

      resp.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
      next(error);
    }
  },
};
