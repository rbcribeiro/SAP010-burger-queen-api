// const bcrypt = require('bcrypt');
// const users = require('../users');
// const models = require('../../models');

// const { User } = require('../../models');

// jest.mock('bcrypt');
// jest.mock('../../models', () => ({
//   User: {
//     findAll: jest.fn(() => [
//       {
//         id: '1',
//         email: 'ana@api.com',
//         password: '523',
//         role: 'admin',
//         createdAt: '2023-08-21T14:17:18.560Z',
//         updatedAt: '2023-08-21T14:17:18.560Z',
//       },
//       {
//         id: '2',
//         email: 'rosana@api.com',
//         password: '987',
//         role: 'chef',
//         createdAt: '2023-08-21T14:17:18.560Z',
//         updatedAt: '2023-08-21T14:17:18.560Z',
//       },
//       {
//         id: '3',
//         email: 'josé@api.com',
//         password: '456',
//         role: 'waiter',
//         createdAt: '2023-08-21T14:17:18.560Z',
//         updatedAt: '2023-08-21T14:17:18.560Z',
//       },
//     ]),
//     findOne: jest.fn((options) => {
//       if (options.where.id === 10) {
//         return null;
//       }
//       return {
//         id: '1',
//         email: 'ana@api.com',
//         password: '523',
//         role: 'admin',
//         createdAt: '2023-08-21T14:17:18.560Z',
//         updatedAt: '2023-08-21T14:17:18.560Z',
//       };
//     }),
//     create: jest.fn(),
//     update: jest.fn(),
//     save: jest.fn(),
//     destroy: jest.fn(),
//     findOrCreate: jest.fn(),
//   },
// }));

// describe('initAdminUser', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it('Deve criar um usuário admin se o email e senha estiverem configurados', async () => {
//     const app = {
//       get: jest.fn().mockReturnValue({
//         adminEmail: 'admin@example.com',
//         adminPassword: 'adminpassword',
//       }),
//     };
//     const next = jest.fn();

//     bcrypt.hashSync.mockReturnValue('hashedpassword');

//     await users.initAdminUser(app, next);

//     expect(User.findOrCreate).toHaveBeenCalledWith({
//       where: { email: 'admin@example.com' },
//       defaults: {
//         email: 'admin@example.com',
//         password: 'hashedpassword',
//         role: 'admin',
//       },
//     });
//     expect(next).toHaveBeenCalled();
//   });

//   it('Não deve criar um usuário admin se o email ou senha não estiverem configurados', async () => {
//     const app = {
//       get: jest.fn().mockReturnValue({
//         adminEmail: null,
//       }),
//     };
//     const next = jest.fn();

//     await users.initAdminUser(app, next);

//     expect(User.findOrCreate).not.toHaveBeenCalled();
//     expect(next).toHaveBeenCalled();
//   });
// });

// describe('getUsers', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it('Deve retornar uma lista de usuários', async () => {
//     const mockReq = {};
//     const mockResp = {
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.getUsers(mockReq, mockResp, mockNext);

//     expect(mockResp.json).toHaveBeenCalled();
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve retornar 500 para erro interno do servidor', async () => {
//     const mockReq = {};
//     const mockResp = {};
//     const mockNext = jest.fn();

//     models.User.findAll.mockRejectedValueOnce(
//       new Error('Erro interno do servidor.'),
//     );

//     await users.getUsers(mockReq, mockResp, mockNext);

//     expect(mockNext).toHaveBeenCalledWith({
//       status: 500,
//       message: 'Erro interno do servidor.',
//     });
//   });

//   it('Deve lidar com coleção vazia de usuários', async () => {
//     const mockReq = {};
//     const mockResp = {
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     models.User.findAll.mockResolvedValueOnce([]);

//     await users.getUsers(mockReq, mockResp, mockNext);

//     expect(mockResp.json).toHaveBeenCalledWith([]);
//   });
// });

// describe('getUserById', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it('Deve retornar um usuário existente com status 200 e o usuário no JSON', async () => {
//     const req = { params: { uid: 1 } };

//     const mockUser = {
//       id: 1,
//       email: 'usuarioexistente@example.com',
//       password: 'senhapadrao',
//       role: 'admin',
//       createdAt: '2023-08-21T14:17:18.560Z',
//       updatedAt: '2023-08-21T14:17:18.560Z',
//     };

//     models.User.findOne.mockResolvedValue(mockUser);

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.getUserById(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockResp.status).toHaveBeenCalledWith(200);
//     expect(mockResp.json).toHaveBeenCalledWith(mockUser);
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve lidar com usuário não encontrado', async () => {
//     const req = { params: { uid: 123 } };

//     models.User.findOne.mockResolvedValue(null);

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.getUserById(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 123 } });
//     expect(mockResp.status).toHaveBeenCalledWith(404);
//     expect(mockResp.json).toHaveBeenCalledWith({
//       message: 'Usuário não encontrado',
//     });
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve retornar erro 500 para erro interno do servidor', async () => {
//     const mockError = new Error('Erro interno do servidor.');
//     User.findOne.mockRejectedValue(mockError);

//     const req = { params: { userId: 1 } };
//     const resp = {};
//     const next = jest.fn();

//     await users.getUserById(req, resp, next);

//     expect(next).toHaveBeenCalledWith({
//       status: 500,
//       message: mockError.message,
//     });
//   });
// });

// describe('createUser', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it('Deve criar um novo usuário', async () => {
//     const mockUser = { id: 1, email: 'user@example.com', role: 'user' };
//     const req = {
//       body: { email: 'user@example.com', password: 'password', role: 'user' },
//     };
//     const resp = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//     const next = jest.fn();

//     bcrypt.hashSync.mockReturnValue('hashedPassword');
//     User.create.mockResolvedValue(mockUser);

//     await users.createUser(req, resp, next);

//     expect(resp.status).toHaveBeenCalledWith(201);
//     expect(resp.json).toHaveBeenCalledWith(mockUser);
//     expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 10);
//     expect(User.create).toHaveBeenCalledWith({
//       email: req.body.email,
//       password: 'hashedPassword',
//       role: req.body.role,
//     });
//     expect(next).not.toHaveBeenCalled();
//   });

//   it('Deve retornar status 400 e mensagem de erro se algum campo estiver faltando', async () => {
//     const req = {
//       body: {
//         email: 'novousuario@example.com',
//       },
//     };

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.createUser(req, mockResp, mockNext);

//     expect(mockNext).toHaveBeenCalledWith({
//       status: 400,
//       message: 'Todos os campos são obrigatórios.',
//     });
//     expect(mockResp.status).not.toHaveBeenCalled();
//     expect(mockResp.json).not.toHaveBeenCalled();
//   });

//   it('Deve lidar com erro', async () => {
//     const mockError = new Error('Erro interno do servidor.');
//     const req = {
//       body: { email: 'user@example.com', password: 'password', role: 'user' },
//     };
//     const resp = {};
//     const next = jest.fn();

//     bcrypt.hashSync.mockReturnValue('hashedPassword');
//     User.create.mockRejectedValue(mockError);

//     await users.createUser(req, resp, next);

//     expect(next).toHaveBeenCalledWith({
//       status: 500,
//       message: mockError.message,
//     });
//   });
// });

// describe('updateUser', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('Deve atualizar um usuário existente e retornar o usuário atualizado', async () => {
//     const req = {
//       params: { uid: 1 },
//       body: {
//         email: 'novomail@example.com',
//         password: 'novasenha',
//         role: 'user',
//       },
//     };

//     const mockUser = {
//       id: 1,
//       email: 'usuarioexistente@example.com',
//       password: 'senhapadrao',
//       role: 'admin',
//       createdAt: '2023-08-21T14:17:18.560Z',
//       updatedAt: '2023-08-21T14:17:18.560Z',
//     };

//     models.User.findOne.mockResolvedValue(mockUser);

//     const mockHashSync = jest.spyOn(bcrypt, 'hashSync');
//     mockHashSync.mockReturnValue('hashedPassword');

//     const mockUserSave = jest.fn();
//     mockUser.save = mockUserSave;

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.updateUser(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockHashSync).toHaveBeenCalledWith('novasenha', 10);
//     expect(mockUser.email).toBe('novomail@example.com');
//     expect(mockUser.password).toBe('hashedPassword');
//     expect(mockUser.role).toBe('user');
//     expect(mockUserSave).toHaveBeenCalled();
//     expect(mockResp.status).toHaveBeenCalledWith(200);
//     expect(mockResp.json).toHaveBeenCalledWith(mockUser);
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve lidar com usuário não encontrado', async () => {
//     const req = {
//       params: { uid: 123 },
//       body: {
//         email: 'novomail@example.com',
//         password: 'novasenha',
//         role: 'user',
//       },
//     };

//     models.User.findOne.mockResolvedValue(null);

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.updateUser(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 123 } });
//     expect(mockResp.status).toHaveBeenCalledWith(404);
//     expect(mockResp.json).toHaveBeenCalledWith({
//       message: 'Usuário não encontrado',
//     });
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve retornar erro 500 para erro interno do servidor', async () => {
//     const mockError = new Error('Erro interno do servidor.');
//     const req = {
//       params: { userId: 1 },
//       body: { email: 'updated@example.com', role: 'admin' },
//     };
//     const resp = {};
//     const next = jest.fn();

//     User.findOne.mockRejectedValue(mockError);

//     await users.updateUser(req, resp, next);

//     expect(next).toHaveBeenCalledWith({
//       status: 500,
//       message: mockError.message,
//     });
//   });
// });

// describe('deleteUser', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('deve excluir um usuário', async () => {
//     const req = { params: { uid: 10 } };

//     const mockUser = {
//       id: 10,
//       email: 'user@example.com',
//       password: 'hashedpassword',
//       role: 'user',
//       createdAt: '2023-08-21T14:17:18.560Z',
//       updatedAt: '2023-08-21T14:17:18.560Z',
//     };
//     models.User.findOne.mockResolvedValue(mockUser);

//     const mockDestroy = jest.fn();
//     mockUser.destroy = mockDestroy;

//     const mockResp = {
//       json: jest.fn(),
//       status: jest.fn().mockReturnThis(),
//     };

//     const mockNext = jest.fn();

//     await users.deleteUser(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
//     expect(mockDestroy).toHaveBeenCalled();
//     expect(mockResp.status).toHaveBeenCalledWith(200);
//     expect(mockResp.json).toHaveBeenCalledWith({
//       message: 'Usuário excluído com sucesso!',
//     });
//     expect(mockResp.status).toHaveBeenCalledTimes(1);
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve lidar com usuário não encontrado', async () => {
//     const req = { params: { uid: 123 } };

//     models.User.findOne.mockResolvedValue(null);

//     const mockResp = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const mockNext = jest.fn();

//     await users.deleteUser(req, mockResp, mockNext);

//     expect(models.User.findOne).toHaveBeenCalledWith({ where: { id: 123 } });
//     expect(mockResp.status).toHaveBeenCalledWith(404);
//     expect(mockResp.json).toHaveBeenCalledWith({
//       message: 'Usuário não encontrado',
//     });
//     expect(mockNext).not.toHaveBeenCalled();
//   });

//   it('Deve lidar com erro ao excluir usuário', async () => {
//     const mockReq = {
//       params: { uid: '1' },
//     };
//     const mockResp = {};
//     const mockNext = jest.fn();

//     const mockUser = {
//       id: '1',
//       email: 'ana@api.com',
//       password: '523',
//       role: 'admin',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       destroy: jest
//         .fn()
//         .mockRejectedValueOnce(new Error('Erro interno do servidor.')),
//     };

//     models.User.findOne.mockResolvedValueOnce(mockUser);

//     await users.deleteUser(mockReq, mockResp, mockNext);

//     expect(mockNext).toHaveBeenCalledWith({
//       status: 500,
//       message: 'Erro interno do servidor.',
//     });
//   });
// });
