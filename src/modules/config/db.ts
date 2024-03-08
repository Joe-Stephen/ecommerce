import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ecommerce", "root", "Joekkuttan@123", {
    dialect: "mysql",
    host: "localhost",
  }
);

export default sequelize;
