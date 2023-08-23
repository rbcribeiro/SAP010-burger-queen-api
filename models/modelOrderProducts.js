const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderProducts = sequelize.define('OrderProducts', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  });

  return OrderProducts;
};
