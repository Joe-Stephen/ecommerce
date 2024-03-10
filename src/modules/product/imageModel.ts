import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "./productModel";

class Image extends Model {
  public id!: number;
  public productId!: number;
  public image!: string;
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: "images",
    sequelize,
  }
);

// associations 
Image.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Image, { foreignKey: 'productId' });

export default Image;
