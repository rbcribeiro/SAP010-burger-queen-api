module.exports = {
  up: async (queryInterface) => {
    const productsData = [
      {
        name: 'Hamburguer Clássico',
        price: 10.99,
        image: 'url_da_imagem',
        type: 'almoço',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ];

    await queryInterface.bulkInsert('Products', productsData, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Products', null, {});
  },
};
