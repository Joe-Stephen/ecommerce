import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Product extends Model {
  public id!: number;
  public name!: string;
  public brand!: string;
  public descreption!: string;
  public category!: string;
  public regular_price!: number;
  public selling_price!: number;
  public isBlocked!: boolean;
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },

    description: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },

      category: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      regular_price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      selling_price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
  },
  {
    tableName: "products",
    sequelize,
  }
);

export default Product;
