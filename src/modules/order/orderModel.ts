import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Cart from "../cart/cartModel";
import CartProducts from "../cart/cartProductsModel";

class Order extends Model {
    public id!: number;
    public userId!: number;
    public products!: {
      productId: number;
      price: number;
      quantity: number;
    }[];
    public orderDate!: Date;
    public totalAmount!: number;
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      products: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      totalAmount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "orders",
      sequelize,
    }
  );
  
  export default Order;