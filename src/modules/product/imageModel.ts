import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

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
      type: new DataTypes.INTEGER(),
      allowNull: false,
    },
    image: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: "images",
    sequelize,
  }
);

export default Image;
