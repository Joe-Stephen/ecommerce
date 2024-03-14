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
import OrderProducts from "./modules/order/orderProductsModel";
import adminRouter from "./modules/router/adminRouter";
import Cancel from "./modules/order/cancelOrderModel";
import Notification from "./modules/notifications/notificationModel";

dotenv.config();
const PORT = 3000 || process.env.PORT;
const app: Application = express();

//using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting routers
app.use("/", userRouter);
app.use("/admin", adminRouter);

// associations

//image associations
Image.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Image, { foreignKey: "productId" });

//cart associations
Cart.belongsTo(User, { foreignKey: "userId" });
Cart.belongsToMany(Product, { through: CartProducts });
Product.belongsToMany(Cart, { through: CartProducts });
User.hasOne(Cart, { foreignKey: "userId" });

//order associations
Order.belongsTo(User, { foreignKey: "userId" });
Order.belongsToMany(Product, { through: OrderProducts });
Product.belongsToMany(Order, { through: OrderProducts });
User.hasMany(Order, { foreignKey: "userId" });
Order.hasMany(OrderProducts, { foreignKey: "orderId", as: "orderProducts" });

//product with orderProducts
Product.hasMany(OrderProducts, { foreignKey: "productId" });
OrderProducts.belongsTo(Product, { foreignKey: "productId" });

//cancel order associations
Cancel.belongsTo(Order, { foreignKey: "orderId" });
Order.hasOne(Cancel, { foreignKey: "orderId" });

//notifications associations
Notification.belongsTo(User, {foreignKey:"userId"});
User.hasMany(Notification, {foreignKey:"userId"});

// syncing models and starting server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Models synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
