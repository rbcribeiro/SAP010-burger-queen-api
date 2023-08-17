const {
  getUsers,
} = require('../users');
const models = require('../../models');

jest.mock('../../models', () => ({
  User: {
    findAll: jest.fn(() => [
      { 
        id: '1',
        email: 'ana@api.com',
        password: '523',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: '2',
        email: 'rosana@api.com',
        password: '987',
        role: 'chef',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        email: 'josé@api.com',
        password: '456',
        role: 'waiter',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  },
}));

describe('getUsers', () => {
  it('Deve obter coleção de usuários - Teste 1', async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await getUsers(mockReq, mockResp, mockNext);

    expect(mockResp.json).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Deve lidar com erro de banco de dados', async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();
    
    // Simula um erro ao buscar dados do banco de dados
    jest.spyOn(models.User, 'findAll').mockRejectedValue(new Error('Database error'));
  
    await getUsers(mockReq, mockResp, mockNext);
  
    // Verifica se a função next foi chamada com o erro esperado
    expect(mockNext).toHaveBeenCalledWith(new Error('Database error'));
  });

  it('Deve lidar corretamente com chamadas assíncronas', async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();
  
    // Simula um pequeno atraso para simular a chamada assíncrona
    jest.spyOn(models.User, 'findAll').mockResolvedValue(new Promise(resolve => setTimeout(() => resolve([]), 100)));
  
    await getUsers(mockReq, mockResp, mockNext);
  
    // Verifica se a função json foi chamada após o atraso
    expect(mockResp.json).toHaveBeenCalledWith([]);
  });
  
  it('Deve lidar com coleção vazia de usuários', async () => {
    const mockReq = {};
    const mockResp = {
      json: jest.fn(),
    };
    const mockNext = jest.fn();
  
    // Simula retorno de coleção vazia do banco de dados
    jest.spyOn(models.User, 'findAll').mockResolvedValue([]);
  
    await getUsers(mockReq, mockResp, mockNext);
  
    // Verifica se a função json foi chamada com um array vazio
    expect(mockResp.json).toHaveBeenCalledWith([]);
  });
});
