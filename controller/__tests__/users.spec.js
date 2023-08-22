const users = require("../users");
const models = require("../../models");

const { User } = require("../../models");

jest.mock("../../models", () => ({
  User: {
    findAll: jest.fn(() => [
      {
        id: "1",
        email: "ana@api.com",
        password: "523",
        role: "admin",
        createdAt: "2023-08-21T14:17:18.560Z",
        updatedAt: "2023-08-21T14:17:18.560Z",
      },
      {
        id: "2",
        email: "rosana@api.com",
        password: "987",
        role: "chef",
        createdAt: "2023-08-21T14:17:18.560Z",
        updatedAt: "2023-08-21T14:17:18.560Z",
      },
      {
        id: "3",
        email: "josé@api.com",
        password: "456",
        role: "waiter",
        createdAt: "2023-08-21T14:17:18.560Z",
        updatedAt: "2023-08-21T14:17:18.560Z",
      },
    ]),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe("getUsers", () => {
  it("Deve retornar uma lista de usuários", async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await users.getUsers(mockReq, mockResp, mockNext);

    expect(mockResp.json).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("Deve retornar 500 para erro interno do servidor", async () => {
    const mockReq = {};
    const mockResp = {};
    const mockNext = jest.fn();

    models.User.findAll.mockRejectedValueOnce(new Error("Database error"));

    await users.getUsers(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ status: 500, message: "Erro interno do servidor." });

  });

  it("Deve lidar corretamente com chamadas assíncronas", async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    models.User.findAll.mockResolvedValueOnce(
      new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    await users.getUsers(mockReq, mockResp, mockNext);

    expect(mockResp.json).toHaveBeenCalledWith([]);
  });

  it("Deve lidar com coleção vazia de usuários", async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    models.User.findAll.mockResolvedValueOnce([]);

    await users.getUsers(mockReq, mockResp, mockNext);

    expect(mockResp.json).toHaveBeenCalledWith([]);
  });
});

describe("getUserById", () => {
  it("Deve lidar com usuário não encontrado", async () => {
    const mockReq = { params: { userId: "nonexistentUserId" }};
    const mockResp = {
      status: jest.fn(() => mockResp),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await users.getUserById(mockReq, mockResp, mockNext);

    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({message: "Usuário não encontrado"});
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("Deve lidar com erro ao buscar usuário por ID", async () => {
    const mockReq = {
      params: { uid: "1" },
    };
    const mockResp = {};
    const mockNext = jest.fn();

    models.User.findOne.mockRejectedValueOnce(new Error("Database error"));

    await users.getUserById(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ status: 500, message: "Erro interno do servidor." });
  });
});

describe("createUser", () => {
  it("Deve lidar com campos obrigatórios ausentes", async () => {
    const mockReq = {
      body: {
        email: "newuser@api.com",
      },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await users.createUser(mockReq, mockResp, mockNext);

    expect(mockResp.status).toHaveBeenCalledWith(400);
    expect(mockResp.json).toHaveBeenCalledWith({ message: "Todos os campos são obrigatórios." });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("Deve lidar com erro ao criar usuário", async () => {
    const mockReq = {
      body: {
        email: "newuser@api.com",
        password: "newpassword",
        role: "user",
      },
    };
    const mockResp = {};
    const mockNext = jest.fn();

    models.User.create.mockRejectedValueOnce(new Error("Database error"));

    await users.createUser(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ status: 500, message: "Erro interno do servidor." });

  });
});

describe("updateUser", () => {
  it("Deve retornar erro 500 para erro interno do servidor", async () => {
    const mockReq = {
      params: { uid: "1" },
      body: {
        email: "updated@api.com",
        role: "updatedRole",
      },
    };
    const mockResp = {};
    const mockNext = jest.fn();

    models.User.findOne.mockResolvedValueOnce({
      id: "1",
      email: "ana@api.com",
      password: "523",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockRejectedValueOnce(new Error("Database error")),
    });

    await users.updateUser(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ status: 500, message: "Erro interno do servidor." });
  });

});

describe("deleteUser", () => {
  it("Deve lidar com erro ao excluir usuário", async () => {
    const mockReq = {
      params: { uid: "1" },
    };
    const mockResp = {};
    const mockNext = jest.fn();

    const mockUser = {
      id: "1",
      email: "ana@api.com",
      password: "523",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      destroy: jest.fn().mockRejectedValueOnce(new Error("Database error")),
    };

    models.User.findOne.mockResolvedValueOnce(mockUser);

    await users.deleteUser(mockReq, mockResp, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ status: 500, message: "Erro interno do servidor." });

  });
});
