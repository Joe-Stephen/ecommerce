"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = __importDefault(require("./modules/router/userRouter"));
const db_1 = __importDefault(require("./modules/config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
//importing models
const userModel_1 = __importDefault(require("./modules/user/userModel"));
const imageModel_1 = __importDefault(require("./modules/product/imageModel"));
const productModel_1 = __importDefault(require("./modules/product/productModel"));
const cartModel_1 = __importDefault(require("./modules/cart/cartModel"));
const cartProductsModel_1 = __importDefault(require("./modules/cart/cartProductsModel"));
const orderModel_1 = __importDefault(require("./modules/order/orderModel"));
const orderProductsModel_1 = __importDefault(require("./modules/order/orderProductsModel"));
const adminRouter_1 = __importDefault(require("./modules/router/adminRouter"));
dotenv_1.default.config();
const PORT = 3000 || process.env.PORT;
const app = (0, express_1.default)();
//using middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// setting routers
app.use("/", userRouter_1.default);
app.use("/admin", adminRouter_1.default);
// associations
//image associations
imageModel_1.default.belongsTo(productModel_1.default, { foreignKey: "productId" });
productModel_1.default.hasMany(imageModel_1.default, { foreignKey: "productId" });
//cart associations
cartModel_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
cartModel_1.default.belongsToMany(productModel_1.default, { through: cartProductsModel_1.default });
productModel_1.default.belongsToMany(cartModel_1.default, { through: cartProductsModel_1.default });
userModel_1.default.hasOne(cartModel_1.default, { foreignKey: "userId" });
//order associations
orderModel_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
orderModel_1.default.belongsToMany(productModel_1.default, { through: orderProductsModel_1.default });
productModel_1.default.belongsToMany(orderModel_1.default, { through: orderProductsModel_1.default });
userModel_1.default.hasMany(orderModel_1.default, { foreignKey: "userId" });
orderModel_1.default.hasMany(orderProductsModel_1.default, { foreignKey: 'orderId', as: 'orderProducts' });
// syncing models and starting server
db_1.default
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
