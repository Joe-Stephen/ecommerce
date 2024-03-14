import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import moment from "moment";

class Cancel extends Model {
    public id!: number;
    public orderId!: number;
    public reason!:string;
    public status!: string;
        // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Cancel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(128),
        allowNull:false,
      },
      status: {
        type: DataTypes.STRING(128),
        defaultValue: "Pending",
      },
    },
    {
      tableName: "cancels",
      sequelize,
    }
  );
  
  export default Cancel;