const { getProducts } = require('../products');
const models = require('../../models');

jest.mock('../../models', () => ({
  Product: {
    findAll: jest.fn(),
  },
}));

describe('productsController', () => {
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
    const res = {
      json: jest.fn(data => data),
    };
    const next = jest.fn();

    await getProducts(req, res, next);

    expect(models.Product.findAll).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockProducts);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve lidar com erros', async () => {
    const mockError = new Error('Erro simulado');

    models.Product.findAll.mockRejectedValue(mockError);

    const req = {};
    const res = {};
    const next = jest.fn();

    await getProducts(req, res, next);

    expect(models.Product.findAll).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
