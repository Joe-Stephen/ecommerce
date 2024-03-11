"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./modules/router/router"));
const dotenv_1 = __importDefault(require("dotenv"));
//importing models
const userModel_1 = __importDefault(require("./modules/user/userModel"));
const imageModel_1 = __importDefault(require("./modules/product/imageModel"));
const productModel_1 = __importDefault(require("./modules/product/productModel"));
const cartModel_1 = __importDefault(require("./modules/cart/cartModel"));
const cartProductsModel_1 = __importDefault(require("./modules/cart/cartProductsModel"));
dotenv_1.default.config();
const PORT = 3000 || process.env.PORT;
const app = (0, express_1.default)();
//using middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// setting routers
app.use("/", router_1.default);
//cart syncing
cartModel_1.default.sync()
    .then(() => {
    console.log("Cart synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing cart model:", error);
});
cartProductsModel_1.default.sync()
    .then(() => {
    console.log("CartProduct synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing CartProduct model:", error);
});
userModel_1.default.sync()
    .then(() => {
    console.log("User synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing cart model:", error);
});
productModel_1.default.sync()
    .then(() => {
    console.log("Product synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing cart model:", error);
});
imageModel_1.default.sync()
    .then(() => {
    console.log("Image synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing Image model:", error);
});
// associations
imageModel_1.default.belongsTo(productModel_1.default, { foreignKey: "productId" });
productModel_1.default.hasMany(imageModel_1.default, { foreignKey: "productId" });
cartModel_1.default.belongsTo(userModel_1.default, { foreignKey: "userId" });
cartModel_1.default.belongsToMany(productModel_1.default, { through: cartProductsModel_1.default });
productModel_1.default.belongsToMany(cartModel_1.default, { through: cartProductsModel_1.default });
userModel_1.default.hasOne(cartModel_1.default, { foreignKey: "userId" });
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
