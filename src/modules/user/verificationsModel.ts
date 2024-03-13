import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Verifications extends Model {
  public id!: number;
  public email!: string;
  public otp!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Verifications.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: "verifications",
    sequelize,
  }
);
export default Verifications;
