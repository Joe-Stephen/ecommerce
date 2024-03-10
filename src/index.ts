import express, { Application } from "express";
import router from "./modules/router/router";
import sequelize from "./modules/config/db";
import dotenv from "dotenv";

//importing models
import User from "./modules/user/userModel";
import Image from "./modules/product/imageModel";
import Product from "./modules/product/productModel";

dotenv.config();
const PORT = 3000 || process.env.PORT;
const app: Application = express();

//using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting routers
app.use("/", router);

//syncing models and starting server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Models synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });
