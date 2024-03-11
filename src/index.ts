import express, { Application } from "express";
import router from "./modules/router/router";
import sequelize from "./modules/config/db";
import dotenv from "dotenv";

//importing models
import User from "./modules/user/userModel";
import Image from "./modules/product/imageModel";
import Product from "./modules/product/productModel";
import Cart from "./modules/cart/cartModel";
import CartProducts from "./modules/cart/cartProductsModel";

dotenv.config();
const PORT = 3000 || process.env.PORT;
const app: Application = express();

//using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting routers
app.use("/", router);

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
Cart.belongsTo(User, { foreignKey: "userId" });
Cart.belongsToMany(Product,{through:CartProducts});
Product.belongsToMany(Cart, {through :CartProducts});

// Product.belongsToMany(Cart, {through :CartProducts});

// Cart.belongsToMany(Product, {through :CartProducts})

// CartProducts.hasMany(Product, {foreignKey:"productId"});
// CartProducts.belongsTo(Cart,{foreignKey:"cartId"});

// Product.belongsToMany(CartProducts, { through: "CartProducts" });
User.hasOne(Cart,{foreignKey:"userId"});

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
