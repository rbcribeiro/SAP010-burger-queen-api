const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
  });

  Product.associate = (models) => {
    Product.belongsToMany(models.Order, {
      through: models.OrderProducts,
      foreignKey: 'productId',
    });
  };

  return Product;
};
