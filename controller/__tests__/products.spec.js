const products = require('../products');
const models = require('../../models');
const { isAdmin } = require('../../middleware/auth');

jest.mock('../../models', () => ({
  Product: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn()
  },
}));

jest.mock('../../middleware/auth', () => ({
  isAdmin: jest.fn(),
}));

describe('getProducts', () => {
  beforeEach(() => {
    models.Product.findAll.mockClear();
  });

  it('deve retornar uma lista de produtos', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ];

    models.Product.findAll.mockResolvedValue(mockProducts);

    const req = {};
    const mockResp = {
      json: jest.fn(data => data),
    };
    const next = jest.fn();

    await products.getProducts(req, mockResp, next);

    expect(models.Product.findAll).toHaveBeenCalledTimes(1);
    expect(mockResp.json).toHaveBeenCalledWith(mockProducts);
    expect(next).not.toHaveBeenCalled();
  });


});

describe('getProductById', () => {
    
      it('deve retornar erro 404 para produto não encontrado', async () => {
        models.Product.findOne.mockResolvedValue(null);
        const req = { params: { productId: 1 } };
        const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();  // Add this line
    
        await products.getProductById(req, mockResp, mockNext);
    
        expect(models.Product.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(mockResp.status).toHaveBeenCalledWith(404);
        expect(mockResp.json).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
      });
    
      it('deve retornar erro 500 para erro interno do servidor', async () => {
        models.Product.findOne.mockRejectedValue(new Error('Erro interno'));
        const req = { params: { productId: 1 } };
        const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();
    
        await products.getProductById(req, mockResp, mockNext);
    
        expect(models.Product.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(mockNext).toHaveBeenCalledWith({
          status: 500,
          message: 'Erro interno do servidor.',
        });
      });
  });
  
  describe('createProduct', () => {
    it('deve criar um novo produto com sucesso', async () => {
      const mockNewProduct = {
        id: 1,
        name: 'Novo Produto',
        price: 10.99,
        image: 'imagem.jpg',
        type: 'alimento',
      };
      models.Product.create.mockResolvedValue(mockNewProduct);
      const req = {
        body: {
          name: 'Novo Produto',
          price: 10.99,
          image: 'imagem.jpg',
          type: 'alimento',
        },
      };
      const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockNext = jest.fn();
  
      await products.createProduct(req, mockResp, mockNext);
  
      expect(models.Product.create).toHaveBeenCalledWith({
        name: 'Novo Produto',
        price: 10.99,
        image: 'imagem.jpg',
        type: 'alimento',
      });
      expect(mockResp.status).toHaveBeenCalledWith(201);
      expect(mockResp.json).toHaveBeenCalledWith(mockNewProduct);
    });

     it('deve retornar erro 400 para campos ausentes', async () => {
      const req = {
        body: {},
      };
      const mockResp = {
        status: jest.fn().mockReturnThis(),  // Fix here: Use .mockReturnThis()
        json: jest.fn(),
      };
      const mockNext = jest.fn();
  
      await products.createProduct(req, mockResp, mockNext);
  
      expect(mockResp.status).toHaveBeenCalledWith(400);
      expect(mockResp.json).toHaveBeenCalledWith({ message: 'Todos os campos são obrigatórios.' });
      expect(mockNext).not.toHaveBeenCalled();  // Ensure next is not called
    });
  
    it('deve retornar erro 500 para erro interno do servidor', async () => {
      models.Product.create.mockRejectedValue(new Error('Erro interno'));
      const req = {
        body: {
          name: 'Novo Produto',
          price: 10.99,
          image: 'imagem.jpg',
          type: 'alimento',
        },
      };
      const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockNext = jest.fn();
  
      await products.createProduct(req, mockResp, mockNext);
  
      expect(models.Product.create).toHaveBeenCalledWith({
        name: 'Novo Produto',
        price: 10.99,
        image: 'imagem.jpg',
        type: 'alimento',
      });
      expect(mockNext).toHaveBeenCalledWith({
        status: 500,
        message: 'Erro interno do servidor.',
      });
    });

  });
  

  describe('updateProduct', () => {
    it('deve retornar erro 403 para acesso proibido', async () => {
      const req = {
        params: { productId: 1 },
        body: {
          name: 'Updated Product',
          price: 19.99,
          image: 'updated-product.jpg',
          type: 'new-category',
        },
        product: { id: 2 }, // Different product ID
      };
      const mockResp = {
        status: jest.fn().mockReturnThis(),  // Fix here: Use .mockReturnThis()
        json: jest.fn(),
      };
      const mockNext = jest.fn();
  
      await products.updateProduct(req, mockResp, mockNext);
  
      expect(mockResp.status).toHaveBeenCalledWith(403);
      expect(mockResp.json).toHaveBeenCalledWith({ message: 'Acesso proibido' });
    });


    it('deve atualizar um produto com sucesso', async () => {
      const mockProduct = {
        id: 1,
        name: 'Produto Antigo',
        price: 9.99,
        image: 'imagem_antiga.jpg',
        type: 'antigo',
      };
    
      models.Product.findOne.mockResolvedValue(mockProduct);
      models.Product.update.mockResolvedValue([1]);
    
      const req = {
        params: { productId: 1 },
        body: {
          name: 'Produto Atualizado',
          price: 11.99,
          image: 'imagem_nova.jpg',
          type: 'novo',
        },
        user: { isAdmin: true },
      };
    
      const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockNext = jest.fn();
    
      await products.updateProduct(req, mockResp, mockNext);
    
      expect(isAdmin).toHaveBeenCalled();
      expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    
      // Adicionamos logs de depuração aqui
      console.log('Mocked update call:', models.Product.update.mock.calls);
    
      // Correção aqui: use expect.objectContaining para verificar as propriedades do objeto
      expect(models.Product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Produto Atualizado',
          price: 11.99,
          image: 'imagem_nova.jpg',
          type: 'novo',
        }),
        expect.any(Object)
      );
    
      expect(mockResp.status).toHaveBeenCalledWith(200);
      expect(mockResp.json).toHaveBeenCalledWith(mockProduct);
    });
    
    
  
    it('deve retornar erro 404 para produto não encontrado', async () => {
      isAdmin.mockReturnValue(true);
    
      models.Product.findOne.mockResolvedValue(null);
    
      const req = {
        params: { productId: 1 },
        body: {
          name: 'Produto Atualizado',
          price: 11.99,
          image: 'imagem_nova.jpg',
          type: 'novo',
        },
      };
    
      const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockNext = jest.fn();
    
      await products.updateProduct(req, mockResp, mockNext);
    
      expect(isAdmin).toHaveBeenCalled();
      expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    
      expect(models.Product.update).not.toHaveBeenCalled(); 
    
      expect(mockResp.status).toHaveBeenCalledWith(404);
      expect(mockResp.json).toHaveBeenCalledWith({ message: 'Produto não encontrado.' });
    });
       
    it('deve retornar erro 500 para erro interno do servidor', async () => {
      isAdmin.mockReturnValue(true);
  
      models.Product.findOne.mockRejectedValue(new Error('Erro interno'));
  
      const req = {
        params: { productId: 1 },
      };
  
      const mockResp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockNext = jest.fn();
  
      await products.updateProduct(req, mockResp, mockNext);
  
      expect(isAdmin).toHaveBeenCalled();
      expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockNext).toHaveBeenCalledWith({
        status: 500,
        message: 'Erro interno do servidor.',
      });
    });
    
  });
  
  describe('deleteProduct', () => {
    it('deve excluir um produto', async () => {
  const mockProduct = {
    id: 1,
    name: 'Product to be deleted',
  };

  models.Product.findOne.mockResolvedValue(mockProduct);
  const mockDestroy = jest.fn();
  mockProduct.destroy = mockDestroy;

  const req = {
    params: { productId: 1 },
    user: { isAdmin: true },
  };

  const mockResp = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(), // Use .mockReturnThis() here
  };

  const mockNext = jest.fn();

  await products.deleteProduct(req, mockResp, mockNext);

  expect(models.Product.findOne).toHaveBeenCalledWith({
    where: { id: 1 },
  });
  expect(mockDestroy).toHaveBeenCalled();
  expect(mockResp.status).toHaveBeenCalledWith(200);
  expect(mockResp.json).toHaveBeenCalledWith({ message: 'Produto excluído com sucesso!' }); // Ensure json is called

  // Verify that other functions were not called
  expect(mockResp.status).toHaveBeenCalledTimes(1);
  expect(mockNext).not.toHaveBeenCalled();
});

  
    it('deve retornar erro 404 para produto não encontrado', async () => {
      models.Product.findOne.mockResolvedValue(null);
  
      const req = {
        params: { productId: 1 },
      };
      const mockResp = {
        status: jest.fn().mockReturnThis(),  // Fix here: Use .mockReturnThis()
        json: jest.fn(),
      };
      const mockNext = jest.fn();
  
      await products.deleteProduct(req, mockResp);
  
      expect(models.Product.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResp.status).toHaveBeenCalledWith(404);
      expect(mockResp.json).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
    });
  
  });
  