const products = require('../products');
const models = require('../../models');

jest.mock('../../models', () => ({
  Product: {
    findAll: jest.fn(() => [
      {
        id: 1,
        name: 'Hamburguer Clássico',
        price: '10.99',
        image: 'url_da_imagem',
        type: 'almoço',
        createdAt: '2023-08-21T14:17:18.582Z',
        updatedAt: '2023-08-21T14:17:18.582Z',
      },
      {
        id: 2,
        name: 'Coxinha',
        price: '6.50',
        image: 'incluir',
        type: 'Lanche',
        createdAt: '2023-08-21T15:45:22.888Z',
        updatedAt: '2023-08-21T15:45:22.888Z',
      },
      {
        id: 3,
        name: 'Escondidinho',
        price: '18.50',
        image: 'incluir',
        type: 'Almoço',
        createdAt: '2023-08-22T01:18:01.014Z',
        updatedAt: '2023-08-22T01:18:01.014Z',
      },
    ]),
    findOne: jest.fn((options) => {
      if (options.where.id === 10) {
        return null;
      }
      return {
        id: 1,
        name: 'Hamburguer Clássico',
        price: '10.99',
        image: 'url_da_imagem',
        type: 'almoço',
        createdAt: '2023-08-21T14:17:18.582Z',
        updatedAt: '2023-08-21T14:17:18.582Z',
      };
    }),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('getProducts', () => {
  it('Deve retornar uma lista de produtos', async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await products.getProducts(mockReq, mockResp, mockNext);

    expect(mockResp.json).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });
  it('Deve retornar erro 500 para erro interno do servidor', async () => {
    const mockReq = {};
    const mockResp = {};
    const mockNext = jest.fn();

    models.Product.findAll.mockRejectedValueOnce(new Error('Database error'));

    await products.getProducts(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      status: 500,
      message: 'Erro interno do servidor.',
    });
  });
});

describe('getProductById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve retornar um produto existente com status 200 e o produto no JSON', async () => {
    const req = { params: { productId: 1 } };

    const mockProduct = {
      id: 1,
      name: 'Hamburguer Clássico',
      price: '10.99',
      image: 'url_da_imagem',
      type: 'almoço',
      createdAt: '2023-08-21T14:17:18.582Z',
      updatedAt: '2023-08-21T14:17:18.582Z',
    };

    models.Product.findOne.mockResolvedValue(mockProduct);

    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await products.getProductById(req, mockResp, mockNext);

    expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockResp.status).toHaveBeenCalledWith(200);
    expect(mockResp.json).toHaveBeenCalledWith(mockProduct);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Deve lidar com produto não encontrado', async () => {
    const mockReq = { params: { productId: '99' } };
    models.Product.findOne.mockResolvedValue(null);

    const mockResp = {
      status: jest.fn(() => mockResp),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await products.getProductById(mockReq, mockResp, mockNext);

    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Produto não encontrado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Deve retornar erro 500 para erro interno do servidor', async () => {
    const mockReq = {};
    const mockResp = {};
    const mockNext = jest.fn();

    models.Product.findAll.mockRejectedValueOnce(new Error('Database error'));

    await products.getProductById(mockReq, mockResp, mockNext);

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

  it('Deve lidar com campos obrigatórios ausentes', async () => {
    const req = {
      body: { Name: 'Café' },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await products.createProduct(req, mockResp, mockNext);

    expect(mockResp.status).toHaveBeenCalledWith(400);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Todos os campos são obrigatórios.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar erro 500 para erro interno do servidor', async () => {
    const mockReq = {
      body: {
        name: 'Novo Produto',
        price: 10.99,
        image: 'imagem.jpg',
        type: 'alimento',
      },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    models.Product.create.mockRejectedValueOnce(new Error('Database error'));

    await products.createProduct(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      status: 500,
      message: 'Erro interno do servidor.',
    });
  });
});

describe('updateProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Deve atualizar um produto existente com status 200 e o produto no JSON', async () => {
    const req = {
      params: { productId: 1 },
      body: {
        name: 'Novo Nome',
        price: '9.99',
        image: 'nova_url_da_imagem',
        type: 'lanche',
      },
    };

    const mockProduct = {
      id: 1,
      name: 'Frango ',
      price: '36.36',
      image: 'url_da_imagem',
      type: 'almoço',
      update: jest.fn(),
    };

    models.Product.findOne.mockResolvedValue(mockProduct);

    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await products.updateProduct(req, mockResp, mockNext);

    expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockProduct.update).toHaveBeenCalledWith({
      name: req.body.name,
      price: req.body.price,
      image: req.body.image,
      type: req.body.type,
    });
    expect(mockResp.status).toHaveBeenCalledWith(200);
    expect(mockResp.json).toHaveBeenCalledWith(mockProduct);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Deve lidar com erro ao buscar usuário por ID', async () => {
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

    expect(models.Product.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(models.Product.update).not.toHaveBeenCalled();
    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Produto não encontrado.',
    });
  });

  it('Deve retornar erro 500 para erro interno do servidor', async () => {
    const mockReq = {
      params: { uid: '1' },
      body: {
        name: 'updated',
        price: '20.00',
      },
    };
    const mockResp = {};
    const mockNext = jest.fn();

    models.Product.findOne.mockResolvedValueOnce({
      id: 1,
      name: 'Hamburguer Clássico',
      price: '10.99',
      image: 'url_da_imagem',
      type: 'almoço',
      createdAt: '2023-08-21T14:17:18.582Z',
      updatedAt: '2023-08-21T14:17:18.582Z',
      save: jest.fn().mockRejectedValueOnce(new Error('Database error')),
    });

    await products.updateProduct(mockReq, mockResp, mockNext);

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
    };

    const mockResp = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    const mockNext = jest.fn();

    await products.deleteProduct(req, mockResp, mockNext);

    expect(models.Product.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockDestroy).toHaveBeenCalled();
    expect(mockResp.status).toHaveBeenCalledWith(200);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Produto excluído com sucesso!',
    });

    expect(mockResp.status).toHaveBeenCalledTimes(1);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar erro 404 para produto não encontrado', async () => {
    models.Product.findOne.mockResolvedValue(null);

    const req = {
      params: { productId: 1 },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await products.deleteProduct(req, mockResp);

    expect(models.Product.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Produto não encontrado',
    });
  });

  it('Deve retornar erro 500 para erro interno do servidor', async () => {
    const mockReq = {};
    const mockResp = {};
    const mockNext = jest.fn();

    models.Product.findAll.mockRejectedValueOnce(new Error('Database error'));

    await products.deleteProduct(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      status: 500,
      message: 'Erro interno do servidor.',
    });
  });
});
