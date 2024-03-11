"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
// import Cart from "../cart/cartModel";
class Test extends sequelize_1.Model {
}
Test.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: "tests",
    sequelize: db_1.default,
});
// associations
// User.hasOne(Cart);
exports.default = Test;
