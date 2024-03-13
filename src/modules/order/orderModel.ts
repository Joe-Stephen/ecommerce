import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import moment from "moment";

class Order extends Model {
    public id!: number;
    public userId!: number;
    public orderDate!: Date;
    public totalAmount!: number;
    public orderStatus!:string;
    // public orderProductId!: number;
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
      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      totalAmount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      orderStatus: {
        type: DataTypes.STRING(128),
        defaultValue: "To be approved",
      },
      // orderProductId: { 
      //   type: DataTypes.INTEGER.UNSIGNED,
      //   allowNull: false,
      // },
    },
    {
      tableName: "orders",
      sequelize,
    }
  );
  
  export default Order;