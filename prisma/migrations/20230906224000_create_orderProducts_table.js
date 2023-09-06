module.exports = {
    up: async ({ schema }) => {
      await schema.createTable('OrderProducts', (table) => {
        table.increments('id').primary();
        table.integer('orderId');
        table.integer('productId');
        table.integer('quantity');
        table.dateTime('createdAt');
        table.dateTime('updatedAt');
      });
    },
  
    down: async ({ schema }) => {
      await schema.dropTable('OrderProducts');
    },
  };
  