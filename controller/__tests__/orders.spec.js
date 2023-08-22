const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../../controller/orders"); // Substitua pelo caminho correto do seu módulo
const { Order, Product, User } = require("../../models");

// Mocks para simular funções do modelo
jest.mock("../../models", () => ({
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

describe("getOrders", () => {
  it("should return a list of orders with processed date", async () => {
    // Arrange
    const ordersMock = {
      id: 1,
      userId: 1,
      client: "Cliente 1",
      status: "Concluído",
      dateEntry: "2023-08-20T12:00:00Z",
      dateProcessed: "2023-08-20T14:00:00Z",
      Products: [
        {
          id: 101,
          name: "Produto A",
          price: 10.99,
          image: "product_a.jpg",
          type: "Type A",
          OrderProducts: { quantity: 2 },
        },
        // Mais produtos desta ordem...
      ],
    }; // Coloque seus dados de teste aqui
    // Mais ordens...
    Order.findAll.mockResolvedValue([ordersMock]);

    // Mock req, resp, next objects
    const reqMock = {};
    const respMock = { json: jest.fn() };
    const nextMock = jest.fn();

    // Act
    await getOrders(reqMock, respMock, nextMock);

    // Assert
    expect(respMock.json).toHaveBeenCalledWith([ordersMock]);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("should handle errors and call next", async () => {
    // Arrange
    Order.findAll.mockRejectedValue(new Error("Mocked error"));

    // Mock req, resp, next objects
    const reqMock = {};
    const respMock = {};
    const nextMock = jest.fn();

    // Act
    await getOrders(reqMock, respMock, nextMock);

    // Assert
    expect(nextMock).toHaveBeenCalledWith(new Error("Mocked error")); // Verifique se o erro passado para next é o mesmo
  });
});

describe("getOrderById", () => {
  it("should return an order by ID", async () => {
    // Arrange
    const orderMock = {
      id: 1,
      userId: 123,
      client: "John Doe",
      status: "Pendente",
      dateEntry: "2023-08-21T10:00:00Z",
      Products: [
        {
          id: 101,
          name: "Product 1",
          price: 10,
          image: "product1.jpg",
          type: "Food",
          OrderProducts: {
            quantity: 2,
          },
        },
        // ... outros produtos
      ],
    };
    Order.findOne.mockResolvedValue(orderMock);

    // Mock req, resp, next objects
    const reqMock = { params: { orderId: 1 } };
    const respMock = { json: jest.fn() };
    const nextMock = jest.fn();

    // Act
    await getOrderById(reqMock, respMock, nextMock);

    // Assert
    const responseOrder = {
      id: 1,
      userId: 123,
      client: "John Doe",
      status: "Pendente",
      dateEntry: new Date("2023-08-21T10:00:00Z"),
      Products: [
        {
          id: 101,
          name: "Product 1",
          price: 10,
          image: "product1.jpg",
          type: "Food",
          OrderProducts: {
            quantity: 2,
          },
        },
      ],
    };

    expect(respMock.json).toHaveBeenCalledWith(
      expect.objectContaining(responseOrder)
    );
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("should handle order not found", async () => {
    // Arrange
    Order.findOne.mockResolvedValue(null);

    // Mock req, resp, next objects
    const reqMock = { params: { orderId: 1 } };
    const respMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    // Act
    await getOrderById(reqMock, respMock, nextMock);

    // Assert
    expect(respMock.status).toHaveBeenCalledWith(404);
    expect(respMock.json).toHaveBeenCalledWith({
      message: "Ordem não encontrada",
    });
    expect(nextMock).not.toHaveBeenCalled();
  });
});
describe("createOrder", () => {
  it("cria uma nova ordem corretamente (com dateProcessed)", async () => {
    const mockExistingUser = { id: 1, name: "Usuário Teste" };
    const mockProduct1 = { id: 1, name: "Produto 1" };
    const mockProduct2 = { id: 2, name: "Produto 2" };

    User.findByPk = jest.fn().mockResolvedValue(mockExistingUser);
    Order.create = jest.fn().mockResolvedValue({
      id: 1,
      userId: mockExistingUser.id,
      client: "Cliente Teste",
      status: "Pendente",
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
      client: "Cliente Teste",
      status: "Pendente",
      dateEntry: new Date(),
      dateProcessed: new Date(), // dateProcessed não é null
      Products: [],
    };

    Order.findByPk = jest
      .fn()
      .mockResolvedValueOnce(mockOrderWithProcessedDate);

    const mockRequest = {
      body: {
        userId: mockExistingUser.id,
        client: "Cliente Teste",
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
      client: "Cliente Teste",
      status: "Pendente",
      dateEntry: expect.any(Date),
    });
    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(Product.findByPk).toHaveBeenCalledWith(2);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        userId: mockExistingUser.id,
        client: "Cliente Teste",
        status: "Pendente",
        dateEntry: expect.any(Date),
        Products: expect.any(Array),
        dateProcessed: expect.any(Date), // Verificando o campo dateProcessed
      })
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it("cria uma nova ordem corretamente (sem dateProcessed)", async () => {
    const mockExistingUser = { id: 1, name: "Usuário Teste" };
    const mockProduct1 = { id: 1, name: "Produto 1" };
    const mockProduct2 = { id: 2, name: "Produto 2" };

    User.findByPk = jest.fn().mockResolvedValue(mockExistingUser);
    Order.create = jest.fn().mockResolvedValue({
      id: 1,
      userId: mockExistingUser.id,
      client: "Cliente Teste",
      status: "Pendente",
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
      client: "Cliente Teste",
      status: "Pendente",
      dateEntry: new Date(),
      dateProcessed: null, // dateProcessed é null
      Products: [],
    };

    Order.findByPk = jest
      .fn()
      .mockResolvedValueOnce(mockOrderWithoutProcessedDate);

    const mockRequest = {
      body: {
        userId: mockExistingUser.id,
        client: "Cliente Teste",
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
      client: "Cliente Teste",
      status: "Pendente",
      dateEntry: expect.any(Date),
    });
    expect(Product.findByPk).toHaveBeenCalledWith(1);
    expect(Product.findByPk).toHaveBeenCalledWith(2);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        userId: mockExistingUser.id,
        client: "Cliente Teste",
        status: "Pendente",
        dateEntry: expect.any(Date),
        Products: expect.any(Array),
        dateProcessed: null, // Verificando a ausência do campo dateProcessed
      })
    );

    expect(mockNext).not.toHaveBeenCalled();
  });

  it("lida corretamente com erros", async () => {
    const mockError = new Error("Erro de teste");
    User.findByPk = jest.fn().mockRejectedValue(mockError);

    const mockRequest = {
      body: {
        userId: 1,
        client: "Cliente Teste",
        products: [],
      },
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await createOrder(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Erro de teste",
      })
    );
  });
});
  describe("updateOrder", () => {
    it("atualiza o status de uma ordem corretamente", async () => {
      const mockOrder = {
        id: 1,
        userId: 123,
        client: "Cliente Teste",
        status: "Pendente",
        dateEntry: new Date(),
        dateProcessed: null,
        save: jest.fn(),
      };

      Order.findByPk = jest.fn().mockResolvedValue(mockOrder);

      const mockRequest = {
        params: { orderId: 1 },
        body: { status: "Concluído" },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await updateOrder(mockRequest, mockResponse, mockNext);

      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(mockOrder.status).toBe("Concluído");
      expect(mockOrder.dateProcessed).toBeInstanceOf(Date);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        userId: 123,
        client: "Cliente Teste",
        status: "Concluído",
        dateEntry: mockOrder.dateEntry,
        dateProcessed: mockOrder.dateProcessed,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("retorna erro 404 se a ordem não for encontrada", async () => {
      Order.findByPk = jest.fn().mockResolvedValue(null);

      const mockRequest = {
        params: { orderId: 1 },
        body: { status: "Concluído" },
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
        message: "Ordem não encontrada",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("retorna erro 400 se o status fornecido não for permitido", async () => {
      const mockRequest = {
        params: { orderId: 1 },
        body: { status: "StatusInválido" },
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
          "O valor do campo 'status' deve ser um dos seguintes: Pendente, Processando, Concluído",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("lida corretamente com erros", async () => {
      const mockError = new Error("Erro de teste");
      Order.findByPk = jest.fn().mockRejectedValue(mockError);

      const mockRequest = {
        params: { orderId: 1 },
        body: { status: "Concluído" },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await updateOrder(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  // Teste para a função que atualiza o status de uma ordem
  describe("updateOrderStatus", () => {
    it("should update the status of an order", async () => {
      // Mocks e dados de entrada
      const orderId = 1;
      const status = "Processando";
      const orderMock = {
        id: orderId,
        userId: 123,
        client: "John Doe",
        status: "Pendente",
        dateEntry: new Date(),
        dateProcessed: null,
        save: jest.fn(),
      };

      // Mock do Order.findByPk para retornar a ordem simulada
      Order.findByPk.mockResolvedValue(orderMock);

      // Chamar a função que atualiza o status
      await updateOrderStatus(reqMock, respMock);

      // Verificar se as funções corretas foram chamadas
      expect(Order.findByPk).toHaveBeenCalledWith(orderId);
      expect(respMock.status).toHaveBeenCalledWith(200);
      expect(respMock.json).toHaveBeenCalledWith({
        id: orderMock.id,
        userId: orderMock.userId,
        client: orderMock.client,
        status: status, // O status deve ter sido atualizado para 'Processando'
        dateEntry: orderMock.dateEntry,
        dateProcessed: null, // Como o status não foi atualizado para 'Concluído', essa data deve ser null
      });
      expect(orderMock.status).toBe(status); // Verificar se o status da ordem foi atualizado
      expect(orderMock.dateProcessed).toBe(null); // Verificar se a data de processamento permaneceu como null
      expect(orderMock.save).toHaveBeenCalled(); // Verificar se o método save foi chamado na ordem
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order", async () => {
      // Arrange
      const reqMock = { params: { orderId: 1 } };

      const orderMock = {
        id: 1,
        userId: 1,
        client: "Cliente 1",
        status: "Processando",
        dateEntry: "2023-08-20T12:00:00Z",
        dateProcessed: null,
        destroy: jest.fn(), // Mock para simular o método destroy()
      };

      Order.findOne.mockResolvedValue(orderMock);

      // Mock resp, next objects
      const respMock = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const nextMock = jest.fn();

      // Act
      await deleteOrder(reqMock, respMock, nextMock);

      // Assert
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 1 }, // Verifica os argumentos passados para Order.findOne
      });

      expect(orderMock.destroy).toHaveBeenCalled(); // Verifica se o método destroy foi chamado no objeto mockado
      expect(respMock.json).toHaveBeenCalledWith({
        message: "Ordem excluída com sucesso!",
      }); // Verifica se a função foi chamada com a mensagem esperada
      expect(nextMock).not.toHaveBeenCalled();
    });

    it("should handle order not found", async () => {
      // Arrange
      Order.findOne.mockResolvedValue(null);

      // Mock req, resp, next objects
      const reqMock = { params: { orderId: 1 } };
      const respMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const nextMock = jest.fn();

      // Act
      await deleteOrder(reqMock, respMock, nextMock);

      // Assert
      expect(respMock.status).toHaveBeenCalledWith(404);
      expect(respMock.json).toHaveBeenCalledWith({
        message: "Ordem não encontrada",
      });
    });
    // Adicione mais casos de teste conforme necessário
  });

