const bcrypt = require('bcrypt');
const users = require("../users");
const models = require("../../models");

const UsersController = require('../users');

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

jest.mock('../../models');
jest.mock('bcrypt');

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

describe('getUserById', () => {
  it('should get user by id', async () => {
    const mockUser = { id: 1, email: 'user@example.com', role: 'user' };
    User.findOne.mockResolvedValue(mockUser);

    const req = { params: { userId: 1 } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await UsersController.getUserById(req, resp, next);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: req.params.userId } });
    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalledWith(mockUser);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { params: { userId: 1 } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await UsersController.getUserById(req, resp, next);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: req.params.userId } });
    expect(resp.status).toHaveBeenCalledWith(404);
    expect(resp.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Database error');
    User.findOne.mockRejectedValue(mockError);

    const req = { params: { userId: 1 } };
    const resp = {};
    const next = jest.fn();

    await UsersController.getUserById(req, resp, next);

    expect(next).toHaveBeenCalledWith({ status: 500, message: mockError.message });
  });
});

describe('createUser', () => {
  it('should create a new user', async () => {
    const mockUser = { id: 1, email: 'user@example.com', role: 'user' };
    const req = { body: { email: 'user@example.com', password: 'password', role: 'user' } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    bcrypt.hashSync.mockReturnValue('hashedPassword');
    User.create.mockResolvedValue(mockUser);

    await UsersController.createUser(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(201);
    expect(resp.json).toHaveBeenCalledWith(mockUser);
    expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 10);
    expect(User.create).toHaveBeenCalledWith({
      email: req.body.email,
      password: 'hashedPassword',
      role: req.body.role,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle missing fields', async () => {
    const req = { body: { email: 'user@example.com' } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await UsersController.createUser(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(400);
    expect(resp.json).toHaveBeenCalledWith({ message: 'Todos os campos são obrigatórios.' });
    expect(bcrypt.hashSync).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Database error');
    const req = { body: { email: 'user@example.com', password: 'password', role: 'user' } };
    const resp = {};
    const next = jest.fn();

    bcrypt.hashSync.mockReturnValue('hashedPassword');
    User.create.mockRejectedValue(mockError);

    await UsersController.createUser(req, resp, next);

    expect(next).toHaveBeenCalledWith({ status: 500, message: mockError.message });
  });
});

describe('updateUser', () => {
  it('should update a user', async () => {
    const mockUser = { id: 1, email: 'user@example.com', role: 'user' };
    const req = { params: { userId: 1 }, body: { email: 'updated@example.com', role: 'admin' } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const mockFoundUser = { ...mockUser, save: jest.fn().mockResolvedValue(mockUser) };
    User.findOne.mockResolvedValue(mockFoundUser);

    bcrypt.hashSync.mockReturnValue('hashedPassword');

    await UsersController.updateUser(req, resp, next);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: req.params.userId } });
    expect(mockFoundUser.email).toBe(req.body.email);
    expect(mockFoundUser.password).toBe('hashedPassword');
    expect(mockFoundUser.role).toBe(req.body.role);
    expect(mockFoundUser.save).toHaveBeenCalled();
    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalledWith(mockUser);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { params: { userId: 1 }, body: { email: 'updated@example.com', role: 'admin' } };
    const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await UsersController.updateUser(req, resp, next);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: req.params.userId } });
    expect(next).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Database error');
    const req = { params: { userId: 1 }, body: { email: 'updated@example.com', role: 'admin' } };
    const resp = {};
    const next = jest.fn();

    User.findOne.mockRejectedValue(mockError);

    await UsersController.updateUser(req, resp, next);

    expect(next).toHaveBeenCalledWith({ status: 500, message: mockError.message });
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
