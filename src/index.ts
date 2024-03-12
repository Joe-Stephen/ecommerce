import express, { Application } from "express";
import userRouter from "./modules/router/userRouter";
import sequelize from "./modules/config/db";
import dotenv from "dotenv";

//importing models
import User from "./modules/user/userModel";
import Image from "./modules/product/imageModel";
import Product from "./modules/product/productModel";
import Cart from "./modules/cart/cartModel";
import CartProducts from "./modules/cart/cartProductsModel";
import Order from "./modules/order/orderModel";
import adminRouter from "./modules/router/adminRouter";

dotenv.config();
const PORT = 3000 || process.env.PORT;
const app: Application = express();

//using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting routers
app.use("/", userRouter);
app.use("/admin", adminRouter);

//cart syncing
Cart.sync()
  .then(() => {
    console.log("Cart synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing cart model:", error);
  });
CartProducts.sync()
  .then(() => {
    console.log("CartProduct synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing CartProduct model:", error);
  });
Order.sync()
  .then(() => {
    console.log("Order synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing Order model:", error);
  });
User.sync()
  .then(() => {
    console.log("User synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing cart model:", error);
  });
Product.sync()
  .then(() => {
    console.log("Product synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing cart model:", error);
  });
Image.sync()
  .then(() => {
    console.log("Image synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing Image model:", error);
  });

// associations
Image.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Image, { foreignKey: "productId" });
Cart.belongsTo(User, { foreignKey: "userId" });
Cart.belongsToMany(Product, { through: CartProducts });
Product.belongsToMany(Cart, { through: CartProducts });
User.hasOne(Cart, { foreignKey: "userId" });

//syncing models and starting server
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("Models synchronized successfully.");
//   })
//   .catch((error) => {
//     console.error("Error synchronizing models:", error);
//   });
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
