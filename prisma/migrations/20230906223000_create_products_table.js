module.exports = {
    up: async ({ schema }) => {
      await schema.createTable('Product', (table) => {
        table.increments('id').primary();
        table.string('name');
        table.decimal('price', 10, 2);
        table.string('image');
        table.string('type');
        table.dateTime('createdAt');
        table.dateTime('updatedAt');
      });
    },
  
    down: async ({ schema }) => {
      await schema.dropTable('Product');
    },
  };
  