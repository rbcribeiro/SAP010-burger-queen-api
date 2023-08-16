module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Orders', [
      {
        userId: 19,
        client: 'Jude Milhon',
        status: 'pending',
        dateEntry: '2022-03-05 15:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const orderProductsData = [
      {
        orderId: 1,
        productId: 18,
        quantity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orderId: 1,
        productId: 15,
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('OrderProducts', orderProductsData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('OrderProducts', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
  },
};
