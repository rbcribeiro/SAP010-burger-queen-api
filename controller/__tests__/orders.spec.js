const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../orders');

const { Order, Product, User } = require('../../models');

jest.mock('../../models', () => ({
  Order: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
  },
  Product: {
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models');

describe('getOrders', () => {
  it('deve retornar uma lista de pedidos com data processada', async () => {
    const ordersMock = {
      id: 1,
      userId: 1,
      client: 'Cliente 1',
      status: 'Concluído',
      dateEntry: '2023-08-20T12:00:00Z',
      dateProcessed: '2023-08-20T14:00:00Z',
      Products: [
        {
          id: 101,
          name: 'Produto A',
          price: 10.99,
          image: 'product_a.jpg',
          type: 'Type A',
          OrderProducts: { quantity: 2 },
        },
      ],
    };

    Order.findAll.mockResolvedValue([ordersMock]);

    const reqMock = {};
    const respMock = { json: jest.fn() };
    const nextMock = jest.fn();

    await getOrders(reqMock, respMock, nextMock);

    expect(respMock.json).toHaveBeenCalledWith([ordersMock]);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('deve lidar com erros e chamar a seguir', async () => {
    Order.findAll.mockRejectedValue(new Error('Mocked error'));

    const reqMock = {};
    const respMock = {};
    const nextMock = jest.fn();

    await getOrders(reqMock, respMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(new Error('Mocked error'));
  });
});

describe('getOrderById', () => {
  it('deve tratar o pedido não encontrado', async () => {
    Order.findOne.mockResolvedValue(null);

    const reqMock = { params: { orderId: 1 } };
    const respMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    await getOrderById(reqMock, respMock, nextMock);

    expect(respMock.status).toHaveBeenCalledWith(404);
    expect(respMock.json).toHaveBeenCalledWith({
      message: 'Ordem não encontrada',
    });
    expect(nextMock).not.toHaveBeenCalled();
  });
});

describe('createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve incluir dateProcessed no pedido com status Concluído', async () => {
    const orderMock = {
      id: 1,
      userId: 123,
      client: 'Cliente Teste',
      status: 'Concluído',
      dateEntry: new Date(),
      dateProcessed: new Date(),
      Products: [
        {
          id: 101,
          name: 'Product 1',
          price: 10,
          image: 'product1.jpg',
          type: 'Food',
          OrderProducts: {
            quantity: 2,
          },
        },
      ],
    };

    Order.findOne = jest.fn().mockResolvedValue(orderMock);

    const reqMock = { params: { orderId: 1 } };
    const respMock = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const nextMock = jest.fn();

    await getOrderById(reqMock, respMock, nextMock);

    expect(respMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: orderMock.id,
        userId: orderMock.userId,
        client: orderMock.client,
        status: orderMock.status,
        dateEntry: orderMock.dateEntry,
        dateProcessed: orderMock.dateProcessed,
        Products: expect.any(Array),
      }),
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  it('deve chamar o próximo middleware com erro quando ocorrer um erro', async () => {
    Order.findOne = jest.fn().mockRejectedValue(new Error('Erro simulado'));

    const reqMock = { params: { orderId: 1 } };
    const respMock = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const nextMock = jest.fn();

    await getOrderById(reqMock, respMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it('cria uma nova ordem corretamente (com dateProcessed)', async () => {
    const mockExistingUser = { id: 1, name: 'Usuário Teste' };
    const mockProduct1 = { id: 1, name: 'Produto 1' };
    const mockProduct2 = { id: 2, name: 'Produto 2' };

    User.findByPk = jest.fn().mockResolvedValue(mockExistingUser);
    Order.create = jest.fn().mockResolvedValue({
      id: 1,
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      addProduct: jest.fn(),
    });
    Product.findByPk = jest
      .fn()
      .mockReturnValueOnce(mockProduct1)
      .mockReturnValueOnce(mockProduct2);

    const mockOrderWithProcessedDate = {
      id: 1,
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      dateProcessed: new Date(),
      Products: [],
    };

    Order.findByPk = jest
      .fn()
      .mockResolvedValueOnce(mockOrderWithProcessedDate)
      .mockResolvedValueOnce(undefined);

    const mockRequest = {
      body: {
        userId: mockExistingUser.id,
        client: 'Cliente Teste',
        products: [
          { qty: 2, product: { id: 1 } },
          { qty: 1, product: { id: 2 } },
        ],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await createOrder(mockRequest, mockResponse, mockNext);

    expect(User.findByPk).toHaveBeenCalledWith(mockExistingUser.id);
    expect(Order.create).toHaveBeenCalledWith({
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: expect.any(Date),
    });
    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(Product.findByPk).toHaveBeenCalledWith(2);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        userId: mockExistingUser.id,
        client: 'Cliente Teste',
        status: 'Pendente',
        dateEntry: expect.any(Date),
        Products: expect.any(Array),
        dateProcessed: expect.any(Date),
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('cria uma nova ordem corretamente (sem dateProcessed)', async () => {
    const mockExistingUser = { id: 1, name: 'Usuário Teste' };
    const mockProduct1 = { id: 1, name: 'Produto 1' };
    const mockProduct2 = { id: 2, name: 'Produto 2' };

    User.findByPk = jest.fn().mockResolvedValue(mockExistingUser);
    Order.create = jest.fn().mockResolvedValue({
      id: 1,
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      addProduct: jest.fn(),
    });
    Product.findByPk = jest
      .fn()
      .mockReturnValueOnce(mockProduct1)
      .mockReturnValueOnce(mockProduct2);

    const mockOrderWithoutProcessedDate = {
      id: 1,
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      Products: [],
    };

    Order.findByPk = jest
      .fn()
      .mockResolvedValueOnce(mockOrderWithoutProcessedDate);

    const mockRequest = {
      body: {
        userId: mockExistingUser.id,
        client: 'Cliente Teste',
        products: [
          { qty: 2, product: { id: 1 } },
          { qty: 1, product: { id: 2 } },
        ],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await createOrder(mockRequest, mockResponse, mockNext);

    expect(User.findByPk).toHaveBeenCalledWith(mockExistingUser.id);
    expect(Order.create).toHaveBeenCalledWith({
      userId: mockExistingUser.id,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: expect.any(Date),
    });
    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(Product.findByPk).toHaveBeenCalledWith(2);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        userId: mockExistingUser.id,
        client: 'Cliente Teste',
        status: 'Pendente',
        dateEntry: expect.any(Date),
        Products: expect.any(Array),
      }),
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar o status 400 com mensagem de erro para dados incompletos', async () => {
    const req = { body: {} };
    const resp = {
      status: jest.fn(() => resp),
      json: jest.fn(),
    };
    const next = jest.fn();

    await createOrder(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(400);
    expect(resp.json).toHaveBeenCalledWith({
      message: 'Dados incompletos na requisição.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve incluir dateProcessed em responseOrder quando dateProcessed não for nulo', async () => {
    const mockOrderWithProducts = {
      id: 1,
      userId: 123,
      client: 'Client Name',
      status: 'Pendente',
      dateEntry: new Date(),
      dateProcessed: new Date(),
      Products: [],
    };

    const mockFindOrCreate = jest.fn(() => mockOrderWithProducts);
    Order.findByPk = mockFindOrCreate;

    const req = {
      body: {
        userId: 123,
        client: 'Client Name',
        products: [
          { qty: 2, product: { id: 1 } },
          { qty: 3, product: { id: 2 } },
        ],
      },
    };
    const resp = {
      status: jest.fn(() => resp),
      json: jest.fn(),
    };
    const next = jest.fn();

    await createOrder(req, resp, next);

    expect(mockFindOrCreate).toHaveBeenCalled();
    expect(resp.status).toHaveBeenCalledWith(201);
    expect(resp.json).toHaveBeenCalledWith(
      expect.objectContaining({ dateProcessed: expect.any(Date) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('não deve incluir dateProcessed em responseOrder quando dateProcessed for nulo', async () => {
    const mockOrderWithProducts = {
      id: 1,
      userId: 123,
      client: 'Client Name',
      status: 'Pendente',
      dateEntry: new Date(),
      dateProcessed: null,
      Products: [],
    };

    const mockFindOrCreate = jest.fn(() => mockOrderWithProducts);
    Order.findByPk = mockFindOrCreate;

    const req = {
      body: {
        userId: 123,
        client: 'Client Name',
        products: [
          { qty: 2, product: { id: 1 } },
          { qty: 3, product: { id: 2 } },
        ],
      },
    };
    const resp = {
      status: jest.fn(() => resp),
      json: jest.fn(),
    };
    const next = jest.fn();

    await createOrder(req, resp, next);

    expect(mockFindOrCreate).toHaveBeenCalled();
    expect(resp.status).toHaveBeenCalledWith(201);
    expect(resp.json).toHaveBeenCalledWith(
      expect.not.objectContaining({ dateProcessed: expect.any(Date) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 404 e uma mensagem quando um produto não for encontrado', async () => {
    const mockRequest = {
      body: {
        userId: 1,
        client: 'Cliente Teste',
        products: [{ qty: 2, product: { id: 999 } }],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findByPk.mockResolvedValue({});
    Product.findByPk.mockResolvedValue(null);

    Order.create.mockResolvedValue({
      id: 1,
      userId: 1,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      addProduct: jest.fn(),
    });

    await createOrder(mockRequest, mockResponse, jest.fn());

    expect(User.findByPk).toHaveBeenCalledWith(mockRequest.body.userId);
    expect(Product.findByPk).toHaveBeenCalledWith(mockRequest.body.products[0].product.id);
    expect(Order.create).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Produto com ID ${mockRequest.body.products[0].product.id} não encontrado.`,
    });
  });

  it('deve chamar o próximo middleware em caso de erro', async () => {
    const mockFindByPk = jest
      .fn()
      .mockRejectedValue(new Error('Erro de teste'));
    const mockNext = jest.fn();

    User.findByPk = mockFindByPk;
    Product.findByPk = mockFindByPk;

    const mockReq = {
      body: {
        userId: 1,
        client: 'John Doe',
        products: [{ qty: 2, product: { id: 1 } }],
      },
    };

    await createOrder(mockReq, {}, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new Error('Erro de teste'));
  });

  it('deve retornar 404 e uma mensagem quando o usuário não for encontrado', async () => {
    const mockRequest = {
      body: {
        userId: 999,
        client: 'Cliente Teste',
        products: [
          { qty: 2, product: { id: 1 } },
          { qty: 1, product: { id: 2 } },
        ],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findByPk.mockResolvedValue(null);

    await createOrder(mockRequest, mockResponse, jest.fn());

    expect(User.findByPk).toHaveBeenCalledWith(mockRequest.body.userId);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Usuário com ID ${mockRequest.body.userId} não encontrado.`,
    });
  });
});

describe('updateOrder', () => {
  it('atualiza o status de uma ordem corretamente', async () => {
    const mockOrder = {
      id: 1,
      userId: 123,
      client: 'Cliente Teste',
      status: 'Pendente',
      dateEntry: new Date(),
      dateProcessed: null,
      save: jest.fn(),
    };

    Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

    const mockRequest = {
      params: { orderId: 1 },
      body: { status: 'Concluído' },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await updateOrder(mockRequest, mockResponse, mockNext);

    expect(Order.findByPk).toHaveBeenCalledWith(1);
    expect(mockOrder.status).toBe('Concluído');
    expect(mockOrder.dateProcessed).toBeInstanceOf(Date);
    expect(mockOrder.save).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 1,
      userId: 123,
      client: 'Cliente Teste',
      status: 'Concluído',
      dateEntry: mockOrder.dateEntry,
      dateProcessed: mockOrder.dateProcessed,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna erro 404 se a ordem não for encontrada', async () => {
    Order.findByPk = jest.fn().mockResolvedValue(null);

    const mockRequest = {
      params: { orderId: 1 },
      body: { status: 'Concluído' },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await updateOrder(mockRequest, mockResponse, mockNext);

    expect(Order.findByPk).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Ordem não encontrada',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna erro 400 se o status fornecido não for permitido', async () => {
    const mockRequest = {
      params: { orderId: 1 },
      body: { status: 'StatusInválido' },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await updateOrder(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        'O valor do campo status deve ser um dos seguintes: Pendente, Processando, Concluído',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('lida corretamente com erros', async () => {
    const mockError = new Error('Erro de teste');
    Order.findByPk = jest.fn().mockRejectedValue(mockError);

    const mockRequest = {
      params: { orderId: 1 },
      body: { status: 'Concluído' },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await updateOrder(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(mockError);
  });

  it('deve atualizar o status de um pedido', async () => {
    const orderId = 1;
    const status = 'Processando';
    const orderMock = {
      id: orderId,
      userId: 123,
      client: 'John Doe',
      status: 'Pendente',
      dateEntry: new Date(),
      dateProcessed: null,
      save: jest.fn(),
    };

    const reqMock = {
      params: { orderId },
      body: { status },
    };

    const respMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Order.findByPk = jest.fn().mockResolvedValue(orderMock);

    await updateOrder(reqMock, respMock);

    expect(Order.findByPk).toHaveBeenCalledWith(orderId);
    expect(respMock.status).toHaveBeenCalledWith(200);
    expect(respMock.json).toHaveBeenCalledWith({
      id: orderMock.id,
      userId: orderMock.userId,
      client: orderMock.client,
      status,
      dateEntry: orderMock.dateEntry,
      dateProcessed: null,
    });
    expect(orderMock.status).toBe(status);
    expect(orderMock.dateProcessed).toBe(null);
    expect(orderMock.save).toHaveBeenCalled();
  });

  it('deve lidar com valor de status inválido', async () => {
    const orderId = 1;
    const invalidStatus = 'InvalidStatus';
    const allowedStatusValues = ['Pendente', 'Processando', 'Concluído'];

    const reqMock = {
      params: { orderId },
      body: { status: invalidStatus },
    };

    const respMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateOrder(reqMock, respMock);

    expect(respMock.status).toHaveBeenCalledWith(400);
    expect(respMock.json).toHaveBeenCalledWith({
      message: `O valor do campo status deve ser um dos seguintes: ${allowedStatusValues.join(
        ', ',
      )}`,
    });
  });
});

describe('deleteOrder', () => {
  it('deve excluir uma ordem existente', async () => {
    const mockDestroy = jest.fn();
    const mockFindOne = jest.fn().mockResolvedValue({ destroy: mockDestroy });

    Order.findOne = mockFindOne;

    const mockReq = { params: { orderId: 1 } };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await deleteOrder(mockReq, mockResp, mockNext);

    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockDestroy).toHaveBeenCalled();
    expect(mockResp.status).toHaveBeenCalledWith(200);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Ordem excluída com sucesso!',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar um erro 404 se a ordem não for encontrada', async () => {
    const mockFindOne = jest.fn().mockResolvedValue(null);

    Order.findOne = mockFindOne;

    const mockReq = { params: { orderId: 1 } };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await deleteOrder(mockReq, mockResp, mockNext);

    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Ordem não encontrada',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve chamar o próximo middleware em caso de erro', async () => {
    const mockFindOne = jest.fn().mockRejectedValue(new Error('Erro de teste'));

    Order.findOne = mockFindOne;

    const mockReq = { params: { orderId: 1 } };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await deleteOrder(mockReq, mockResp, mockNext);

    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockNext).toHaveBeenCalledWith(new Error('Erro de teste'));
    expect(mockResp.status).not.toHaveBeenCalled();
    expect(mockResp.json).not.toHaveBeenCalled();
  });
});
