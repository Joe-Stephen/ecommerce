"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
// import User from "../user/userModel";
// import Product from "../product/productModel";
class CartProduct extends sequelize_1.Model {
}
CartProduct.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    cartId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    product: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
}, {
    tableName: "cartProducts",
    sequelize: db_1.default,
});
exports.default = CartProduct;
