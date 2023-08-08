const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Outras colunas do modelo Product, se necessário...
  });

  // Configurar associações entre modelos, se aplicável
  Product.associate = (models) => {
    // Por exemplo, se um produto pertence a um usuário:
    Product.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Product;
};
