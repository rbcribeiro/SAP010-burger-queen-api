module.exports = {
    up: async ({ schema }) => {
      await schema.createTable('Order', (table) => {
        table.increments('id').primary();
        table.integer('userId');
        table.string('client');
        table.jsonb('products');
        table.string('status');
        table.dateTime('dateEntry');
        table.dateTime('dateProcessed');
        table.dateTime('createdAt');
        table.dateTime('updatedAt');
      });
    },
  
    down: async ({ schema }) => {
      await schema.dropTable('Order');
    },
  };
  