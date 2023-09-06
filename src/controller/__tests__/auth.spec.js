const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../index'); 
const { auth } = require('../auth');

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

describe('auth', () => {
  let prismaMock;

  beforeEach(() => {
    prismaMock = new PrismaClient();
    jest.spyOn(prismaMock.user, 'findFirst');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar o usuário e retornar um token', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);

    const mockReq = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      },
    };
    const mockResp = {
      status: jest.fn(() => mockResp),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    const mockToken = 'mocked-token';
    jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

    await auth.postAuth(mockReq, mockResp, mockNext);

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: {
          equals: 'test@example.com',
        },
      },
    });

    expect(mockResp.status).toHaveBeenCalledWith(200);
    expect(mockResp.json).toHaveBeenCalledWith({
      token: mockToken,
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 para requisição inválida', async () => {
    const mockReq = {
      body: {},
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await auth.postAuth(mockReq, mockResp, mockNext);

    expect(mockResp.status).toHaveBeenCalledWith(400);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Bad request',
    });
  });

  it('deve retornar erro 404 se o usuário não for encontrado', async () => {
    const mockReq = {
      body: {
        email: 'usuario@exemplo.com',
        password: 'senha',
      },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();
    const mockUserFindOne = jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await auth.postAuth(mockReq, mockResp, mockNext);

    expect(mockUserFindOne).toHaveBeenCalledWith({
      where: {
        email: {
          [Op.eq]: 'usuario@exemplo.com',
        },
      },
    });
    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Not found',
    });
  });

  it('deve retornar erro 404 se a senha não corresponder', async () => {
    const mockReq = {
      body: {
        email: 'usuario@exemplo.com',
        password: 'senha_incorreta',
      },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();
    const mockUserFindOne = jest.spyOn(User, 'findOne').mockResolvedValue({
      email: 'usuario@exemplo.com',
      password: await bcrypt.hash('senha_correta', 10),
    });

    await auth.postAuth(mockReq, mockResp, mockNext);

    expect(mockUserFindOne).toHaveBeenCalledWith({
      where: {
        email: {
          [Op.eq]: 'usuario@exemplo.com',
        },
      },
    });
    expect(mockResp.status).toHaveBeenCalledWith(404);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Not found',
    });
  });

  it('deve retornar erro 500 em caso de erro interno', async () => {
    const mockReq = {
      body: {
        email: 'usuario@exemplo.com',
        password: 'senha_correta',
      },
    };
    const mockResp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();
    const mockUserFindOne = jest
      .spyOn(User, 'findOne')
      .mockRejectedValue(new Error('Erro interno'));

    await auth.postAuth(mockReq, mockResp, mockNext);

    expect(mockUserFindOne).toHaveBeenCalledWith({
      where: {
        email: {
          [Op.eq]: 'usuario@exemplo.com',
        },
      },
    });
    expect(mockResp.status).toHaveBeenCalledWith(500);
    expect(mockResp.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });
});
