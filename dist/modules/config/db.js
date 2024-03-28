"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
//creating sequelize instance
const sequelize = new sequelize_1.Sequelize("ecommerce", "root", "Joekkuttan@123", {
    dialect: "mysql",
    host: "localhost",
    // logging:console.log,
    logging: false
});
exports.default = sequelize;
