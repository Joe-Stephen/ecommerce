"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
//importing models
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const cartModel_1 = __importDefault(require("../cart/cartModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
const orderModel_1 = __importDefault(require("../order/orderModel"));
const orderProductsModel_1 = __importDefault(require("../order/orderProductsModel"));
const notificationModel_1 = __importDefault(require("../notifications/notificationModel"));
const verificationsModel_1 = __importDefault(require("../user/verificationsModel"));
const cartProductsModel_1 = __importDefault(require("../cart/cartProductsModel"));
const cancelOrderModel_1 = __importDefault(require("../order/cancelOrderModel"));
class DBQueries {
    //-----USER TABLE QUERIES-----//
    //create new user
    createUser(username, email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.create({
                    username,
                    email,
                    password: hashedPassword,
                });
                return user;
            }
            catch (error) {
                console.error("Error in findUserByEmail :", error);
            }
        });
    }
    //update a user by id
    updateUserById(id, username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield userModel_1.default.update({ username, email, password }, { where: { id } });
                return true;
            }
            catch (error) {
                console.error("Error in updateUserById :", error);
                return false;
            }
        });
    }
    //find all users
    findAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.findAll();
                return users;
            }
            catch (error) {
                console.error("Error in findUserByEmail :", error);
            }
        });
    }
    //find a user by email
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findOne({ where: { email } });
                return user;
            }
            catch (error) {
                console.error("Error in findUserByEmail :", error);
            }
        });
    }
    //find a user with cart by email
    findUserWithCartByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userWithCart = yield userModel_1.default.findOne({
                    where: { email },
                    include: [
                        {
                            model: cartModel_1.default,
                            include: [productModel_1.default],
                        },
                    ],
                });
                return userWithCart;
            }
            catch (error) {
                console.error("Error in findUserWithCartByEmail :", error);
            }
        });
    }
    //find a user by id
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findByPk(userId, {});
                return user;
            }
            catch (error) {
                console.error("Error in findUserById :", error);
            }
        });
    }
    //delete a user by id
    deleteUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield userModel_1.default.destroy({ where: { id } });
                return true;
            }
            catch (error) {
                console.error("Error in deleteUserByPk :", error);
                return false;
            }
        });
    }
    //find a user by email and not equal to provided id
    checkForDuplicateUser(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield userModel_1.default.findOne({
                    where: { email: email, id: { [sequelize_1.Op.ne]: id } },
                });
                return existingUser;
            }
            catch (error) {
                console.error("Error in checkForDuplicateUser :", error);
            }
        });
    }
    //find all users in ids array
    findAllUsersInArray(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.findAll({ where: { ids } });
                return users;
            }
            catch (error) {
                console.error("Error in findAllUsersInArray :", error);
            }
        });
    }
    //-----PRODUCT TABLE QUERIES-----//
    //find a product by name and not equal to provided id
    checkForDuplicateProduct(name, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingProduct = yield productModel_1.default.findOne({
                    where: { name: name, id: { [sequelize_1.Op.ne]: productId } },
                });
                return existingProduct;
            }
            catch (error) {
                console.error("Error in checkForDuplicateProduct :", error);
            }
        });
    }
    //find a product by name
    findProductByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield productModel_1.default.findOne({
                    where: { name: name },
                });
                return product;
            }
            catch (error) {
                console.error("Error in findProductByName :", error);
            }
        });
    }
    //find all products with considering provided filter
    findAllProductsWithFilter(count, skip, whereCondition, orderCondition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield productModel_1.default.findAll({
                    limit: count,
                    offset: skip,
                    where: whereCondition,
                    order: orderCondition,
                    include: [{ model: imageModel_1.default, attributes: ["image"] }],
                });
                return products;
            }
            catch (error) {
                console.error("Error in findAllProducts :", error);
            }
        });
    }
    //find products for the provided ids (as array)
    findAllProductsInArray(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield productModel_1.default.findAll({
                    where: { ids },
                });
                return products;
            }
            catch (error) {
                console.error("Error in findProductsInArray :", error);
            }
        });
    }
    //create a new product
    createProduct(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newProduct = yield productModel_1.default.create(formData);
                return newProduct;
            }
            catch (error) {
                console.error("Error in createProduct :", error);
            }
        });
    }
    //update a product
    updateProduct(formData, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedProduct = yield productModel_1.default.update(formData, {
                    where: { id: productId },
                });
                return updatedProduct;
            }
            catch (error) {
                console.error("Error in createProduct :", error);
            }
        });
    }
    //-----IMAGE TABLE QUERIES-----//
    //clear existing images of a product
    clearExistingImages(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield imageModel_1.default.destroy({ where: { productId: productId } });
                return true;
            }
            catch (error) {
                console.error("Error in clearExistingImages :", error);
                return false;
            }
        });
    }
    //save images of a product
    saveProductImages(productId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield imageModel_1.default.create({
                    productId: productId,
                    image: file.originalname,
                });
                return true;
            }
            catch (error) {
                console.error("Error in saveProductImages :", error);
                return false;
            }
        });
    }
    //-----ORDER TABLE QUERIES-----//
    //find all orders with provided query-options
    findAllOrdersWithOptions(queryOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield orderModel_1.default.findAll(queryOptions);
                return orders;
            }
            catch (error) {
                console.error("Error in findAllOrdersWithOptions :", error);
            }
        });
    }
    //find an order using id
    findOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield orderModel_1.default.findByPk(orderId, {
                    include: [
                        {
                            model: orderProductsModel_1.default,
                            as: "orderProducts",
                            include: [productModel_1.default],
                        },
                    ],
                });
                return order;
            }
            catch (error) {
                console.error("Error in findOrderWithId :", error);
            }
        });
    }
    //create new order
    createOrder(userId, totalAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newOrder = yield orderModel_1.default.create({
                    userId,
                    totalAmount,
                });
                return newOrder;
            }
            catch (error) {
                console.error("Error in createOrder :", error);
            }
        });
    }
    //-----NOTIFICATION TABLE QUERIES-----//
    //create notifications for the user by id
    createNotification(userId, label, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notifications = yield notificationModel_1.default.create({
                    userId,
                    label,
                    content,
                });
                return notifications;
            }
            catch (error) {
                console.error("Error in createNotification :", error);
            }
        });
    }
    //create notifications for a single user
    createNotificationForOne(userId, label, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.default.create({
                    userId,
                    label,
                    content,
                });
                return notification;
            }
            catch (error) {
                console.error("Error in createNotificationForAll :", error);
            }
        });
    }
    //find all notifications by user id
    findAllNotificationsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notifications = yield notificationModel_1.default.findAll({
                    where: { userId },
                });
                return notifications;
            }
            catch (error) {
                console.error("Error in findAllNotificationsByUserId :", error);
            }
        });
    }
    //toggle status by provided array of ids
    toggleStatusByIdArray(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield notificationModel_1.default.update({ checked: db_1.default.literal("NOT checked") }, { where: { ids } });
                return true;
            }
            catch (error) {
                console.error("Error in findAllNotificationsByIdArray :", error);
                return false;
            }
        });
    }
    //-----VERIFICATIONS TABLE QUERIES-----//
    //creating an verification entry (for otp)
    createVerification(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = yield verificationsModel_1.default.create({
                    email,
                    otp,
                });
                return verification;
            }
            catch (error) {
                console.error("Error in createVerification :", error);
            }
        });
    }
    //finding a verification by email
    findVerificationByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = yield verificationsModel_1.default.findOne({ where: { email } });
                return verification;
            }
            catch (error) {
                console.error("Error in findVerificationByEmail :", error);
            }
        });
    }
    //destroying a verification by email
    destroyVerificationByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield verificationsModel_1.default.destroy({ where: { email } });
                return true;
            }
            catch (error) {
                console.error("Error in findVerificationByEmail :", error);
                return false;
            }
        });
    }
    //-----CART TABLE QUERIES-----//
    //create a cart
    createCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cart = yield cartModel_1.default.create({
                    userId,
                });
                return cart;
            }
            catch (error) {
                console.error("Error in createCart :", error);
            }
        });
    }
    //find a cart by user id
    findCartByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cart = yield cartModel_1.default.findOne({ where: { userId } });
                return cart;
            }
            catch (error) {
                console.error("Error in createCart :", error);
            }
        });
    }
    //destroy a cart by user id
    destroyCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cartModel_1.default.destroy({ where: { userId } });
                return true;
            }
            catch (error) {
                console.error("Error in createCart :", error);
                return false;
            }
        });
    }
    //-----CARTPRODUCTS TABLE QUERIES-----//
    //create cart product
    createCartProduct(cartId, productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cartProductsModel_1.default.create({ cartId, productId, quantity });
                return true;
            }
            catch (error) {
                console.error("Error in createOrderProduct :", error);
                return false;
            }
        });
    }
    //find a product in cart products by cart id and product id
    findExistingCartProduct(cartId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cartProduct = yield cartProductsModel_1.default.findOne({
                    where: { cartId, productId },
                });
                return cartProduct;
            }
            catch (error) {
                console.error("Error in findExistingCartProduct :", error);
            }
        });
    }
    //destroy a cart product by cart id and product id
    destroyCartProduct(cartId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cartProductsModel_1.default.destroy({ where: { cartId, productId } });
                return true;
            }
            catch (error) {
                console.error("Error in destroyCartProduct :", error);
                return false;
            }
        });
    }
    //destroy all cart products in a cart by cart id
    destroyAllCartProducts(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cartProductsModel_1.default.destroy({ where: { cartId } });
                return true;
            }
            catch (error) {
                console.error("Error in destroyAllCartProducts :", error);
                return false;
            }
        });
    }
    //-----ORDERPRODUCTS TABLE QUERIES-----//
    //create order product
    createOrderProduct(orderId, productId, price, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield orderProductsModel_1.default.create({ orderId, productId, price, quantity });
                return true;
            }
            catch (error) {
                console.error("Error in createOrderProduct :", error);
                return false;
            }
        });
    }
    //update quantity of order product by id
    updateOrderProductQty(quantity, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield orderProductsModel_1.default.update({ quantity }, { where: { id } });
                return true;
            }
            catch (error) {
                console.error("Error in updateOrderProductQty :", error);
                return false;
            }
        });
    }
    //destroy an order product by id
    destroyOrdertProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield orderProductsModel_1.default.destroy({ where: { id } });
                return true;
            }
            catch (error) {
                console.error("Error in destroyOrdertProduct :", error);
                return false;
            }
        });
    }
    //find a order product by product id and order id
    findOrderProductByProductAndOrderIds(productId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderProduct = yield orderProductsModel_1.default.findOne({
                    where: { productId, orderId },
                });
                return orderProduct;
            }
            catch (error) {
                console.error("Error in findOrderProductByProductAndOrderIds :", error);
            }
        });
    }
    //find all order products of an order
    findAllOrderProducts(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderProducts = yield orderProductsModel_1.default.findAll({
                    where: { orderId },
                });
                return orderProducts;
            }
            catch (error) {
                console.error("Error in createOrderProduct :", error);
            }
        });
    }
    //-----CANCEL TABLE QUERIES-----//
    //create a cancel request
    createCancelRequest(orderId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cancelOrderModel_1.default.create({ orderId, reason });
                return true;
            }
            catch (error) {
                console.error("Error in createOrderProduct :", error);
                return false;
            }
        });
    }
}
exports.default = DBQueries;
