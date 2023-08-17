const { getOrders } = require('../orders');
const models = require('../../models');

jest.mock('../../models', () => ({
  Order: {
    findAll: jest.fn(),
  },
  Product: {
    findAll: jest.fn(),
  },
}));

describe('orderController', () => {
    beforeEach(() => {
      models.Order.findAll.mockClear();
      models.Product.findAll.mockClear();
    });

  it('should return a list of orders with processed date', async () => {
    const mockOrders = [
      {
        id: 1,
        userId: 1,
        client: 'Client 1',
        status: 'Concluído',
        dateEntry: '2023-08-17',
        dateProcessed: '2023-08-18',
        Products: [
          {
            id: 1,
            name: 'Product 1',
            price: 10.0,
            image: 'product1.jpg',
            type: 'Type A',
            OrderProducts: {
              quantity: 2,
            },
          },
        ],
      },
    ];

    const mockProducts = [
      {
        id: 1,
        name: 'Product 1',
        price: 10.0,
        image: 'product1.jpg',
        type: 'Type A',
      },
    ];

    models.Order.findAll.mockResolvedValue(mockOrders);
    models.Product.findAll.mockResolvedValue(mockProducts);

    const req = {};
    const res = {
      json: jest.fn(data => data),
    };
    const next = jest.fn();

    await getOrders(req, res, next);

    expect(models.Order.findAll).toHaveBeenCalledTimes(1);
    expect(models.Product.findAll).toHaveBeenCalledTimes(1);

    expect(next).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Simulated error');

    models.Order.findAll.mockRejectedValue(mockError);

    const req = {};
    const res = {};
    const next = jest.fn();

    await getOrders(req, res, next);

    expect(models.Order.findAll).toHaveBeenCalledTimes(1);
    expect(models.Product.findAll).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
