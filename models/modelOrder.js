const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: DataTypes.INTEGER,
    client: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Pendente', 'Processando', 'Concluído'),
      allowNull: false,
      defaultValue: 'Pendente',
    },
    dateEntry: DataTypes.DATE,
    dateProcessed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Order.beforeUpdate(async (order) => {
    if (order.changed('status') && order.status === 'Concluído') {
      const updatedOrder = { ...order.dataValues, dateProcessed: new Date() };
      return updatedOrder;
    }
  });

  Order.associate = (models) => {
    Order.belongsToMany(models.Product, {
      through: models.OrderProducts,
      foreignKey: 'orderId',
    });
  };

  return Order;
};
