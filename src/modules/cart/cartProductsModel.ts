import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class CartProducts extends Model {
  public id!: number;
  public cartId!: number;
  public productId!: number;
  public quantity!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CartProducts.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "cartProducts",
    sequelize,
  }
);
export default CartProducts;
