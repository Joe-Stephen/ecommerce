import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "../product/productModel";
import CartProducts from "./cartProductsModel";
import User from "../user/userModel";



class Cart extends Model {
  public id!: number;
  public userId!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
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
  },
  {
    tableName: "carts",
    sequelize,
  }
);


export default Cart;
