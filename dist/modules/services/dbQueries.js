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
//importing models
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
const orderModel_1 = __importDefault(require("../order/orderModel"));
const orderProductsModel_1 = __importDefault(require("../order/orderProductsModel"));
const notificationModel_1 = __importDefault(require("../notifications/notificationModel"));
class DBQueries {
    //-----USER TABLE QUERIES-----//
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
                const user = yield userModel_1.default.findOne({ where: { email: email } });
                return user;
            }
            catch (error) {
                console.error("Error in findUserByEmail :", error);
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
    //-----NOTIFICATION TABLE QUERIES-----//
    //create notifications for the provided ids (as array)
    createNotificationInBulk(userId, label, content) {
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
    //create notifications for all the users
    createNotificationForAll(label, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notifications = yield notificationModel_1.default.create({
                    label,
                    content,
                });
                return notifications;
            }
            catch (error) {
                console.error("Error in createNotificationForAll :", error);
            }
        });
    }
    //create notifications for a single user
    createNotificationForOne(userId, label, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.default.create({
                    userId: userId,
                    label: label,
                    content: content,
                });
                return notification;
            }
            catch (error) {
                console.error("Error in createNotificationForAll :", error);
            }
        });
    }
}
exports.default = DBQueries;
