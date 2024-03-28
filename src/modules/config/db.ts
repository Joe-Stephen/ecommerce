import { Sequelize } from "sequelize";

//creating sequelize instance
const sequelize = new Sequelize("ecommerce", "root", "Joekkuttan@123", {
    dialect: "mysql",
    host: "localhost",
    // logging:console.log,
    logging:false
  }
);

export default sequelize;
