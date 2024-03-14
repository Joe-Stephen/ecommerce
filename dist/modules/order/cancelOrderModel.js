"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Cancel extends sequelize_1.Model {
}
Cancel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(128),
        defaultValue: "Pending",
    },
}, {
    tableName: "cancels",
    sequelize: db_1.default,
});
exports.default = Cancel;
