import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public isBlocked!: boolean;
  public isAdmin!:boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    isBlocked:{
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    },
    isAdmin:{
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    }
  },
  {
    tableName: "users",
    sequelize,
  }
);
export default User;
