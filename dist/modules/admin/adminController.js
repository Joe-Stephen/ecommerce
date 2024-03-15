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
exports.notifySelectedUsers = exports.notifyAllUsers = exports.getUserById = exports.approveOrder = exports.getAllOrders = exports.getAllUsers = exports.deleteUser = exports.toggleUserAccess = exports.updateProduct = exports.addProduct = exports.resetPassword = exports.loginAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
//importing services
const sendMail_1 = require("../services/sendMail");
const notify_1 = require("../services/notify");
//importing models
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
const orderModel_1 = __importDefault(require("../order/orderModel"));
const orderProductsModel_1 = __importDefault(require("../order/orderProductsModel"));
//admin login
const loginAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("Please provide all the details.");
            return res
                .status(400)
                .json({ message: "Please provide all the details." });
        }
        const user = yield userModel_1.default.findOne({ where: { email: email } });
        if (!user) {
            console.log("No admin found with this email!");
            return res
                .status(400)
                .json({ message: "No admin found with this email!" });
        }
        if (user && (yield bcrypt_1.default.compare(password, user.password))) {
            const loggedInUser = {
                id: user.id,
                name: user.username,
                email: user.email,
                token: generateToken(user.email),
            };
            console.log("Logged in as admin.");
            return res
                .status(201)
                .json({ message: "Logged in as admin.", data: loggedInUser });
        }
        else {
            console.log("Incorrect password.");
            return res.status(201).json({ message: "Incorrect password.l" });
        }
    }
    catch (error) {
        console.error("Error in login function :", error);
        return res.status(400).json({ message: "Login unsuccessfull." });
    }
});
exports.loginAdmin = loginAdmin;
//JWT generator function
const generateToken = (email) => {
    return jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
//reset password
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body.user;
        const { password } = req.body;
        const user = yield userModel_1.default.findOne({ where: { email: email } });
        if (!user) {
            console.log("No user found with this email!");
            return res
                .status(400)
                .json({ message: "No user found with this email!" });
        }
        //hashing password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        yield userModel_1.default.update({ password: hashedPassword }, { where: { email: email } });
        return res.status(200).json({ message: "Password changed successfully." });
    }
    catch (error) {
        console.error("Error changing password :", error);
        return res.status(400).json({ message: "Error changing password." });
    }
});
exports.resetPassword = resetPassword;
//creating new product
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, brand, description, category, regular_price, selling_price } = req.body;
        if (!name ||
            !brand ||
            !description ||
            !category ||
            !regular_price ||
            !selling_price) {
            console.log("Please provide all the details.");
            return res
                .status(400)
                .json({ message: "Please provide all the details." });
        }
        const formData = {
            name: name.trim(),
            brand: brand.trim(),
            description: description.trim(),
            category: category.trim(),
            regular_price: parseInt(regular_price),
            selling_price: parseInt(selling_price),
        };
        //name validation rules
        const nameRegex = /^[A-Za-z0-9\s]+$/;
        if (!nameRegex.test(formData.name)) {
            return res.status(400).json({ message: "Invalid name." });
        }
        const existingProduct = yield productModel_1.default.findOne({ where: { name: name } });
        if (existingProduct) {
            return res
                .status(400)
                .json({ message: "A product with this name already exists." });
        }
        //price validations
        if (formData.selling_price > formData.regular_price) {
            return res.status(400).json({
                message: "Selling price shouldn't be greater than regular price.",
            });
        }
        //creating new product
        const newProduct = yield productModel_1.default.create(formData);
        //uploading image files
        const promises = (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            yield imageModel_1.default.create({
                productId: newProduct.id,
                image: file.originalname,
            });
        }));
        if (promises) {
            yield Promise.all(promises);
        }
        res
            .status(200)
            .json({ message: "Product added successfully", data: newProduct });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product");
    }
});
exports.addProduct = addProduct;
//updating a product
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { productId } = req.query;
        if (!productId) {
            console.log("Please provide the productId.");
            return res.status(400).json({ message: "Please provide the productId." });
        }
        const { name, brand, description, category, regular_price, selling_price } = req.body;
        if (!name ||
            !brand ||
            !description ||
            !category ||
            !regular_price ||
            !selling_price) {
            console.log("Please provide all the details.");
            return res
                .status(400)
                .json({ message: "Please provide all the details." });
        }
        const formData = {
            name: name.trim(),
            brand: brand.trim(),
            description: description.trim(),
            category: category.trim(),
            regular_price: parseInt(regular_price),
            selling_price: parseInt(selling_price),
        };
        //name validation rules
        const nameRegex = /^[A-Za-z0-9\s]+$/;
        if (!nameRegex.test(formData.name)) {
            return res.status(400).json({ message: "Invalid name." });
        }
        const existingProduct = yield productModel_1.default.findOne({
            where: { name: name, id: { [sequelize_1.Op.ne]: productId } },
        });
        if (existingProduct) {
            return res
                .status(400)
                .json({ message: "A product with this name already exists." });
        }
        //price validations
        if (formData.selling_price > formData.regular_price) {
            return res.status(400).json({
                message: "Selling price shouldn't be greater than regular price.",
            });
        }
        //updating the product
        const newProduct = yield productModel_1.default.update(formData, {
            where: { id: productId },
        });
        //clearing existing images
        yield imageModel_1.default.destroy({ where: { productId: productId } });
        //uploading image files
        const promises = (_b = req.files) === null || _b === void 0 ? void 0 : _b.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            yield imageModel_1.default.create({
                productId: productId,
                image: file.originalname,
            });
        }));
        if (promises) {
            yield Promise.all(promises);
        }
        res
            .status(200)
            .json({ message: "Product updated successfully", data: newProduct });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
});
exports.updateProduct = updateProduct;
//toggling the user access status (block/unblock)
const toggleUserAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (userId) {
            const user = yield userModel_1.default.findByPk(userId, {});
            if (user) {
                user.isBlocked = !user.isBlocked;
                yield (user === null || user === void 0 ? void 0 : user.save());
                console.log("User status has been changed successfully.");
                return res
                    .status(200)
                    .json({ message: "User status has been changed successfully." });
            }
            else {
                console.error("No user found.");
                res.status(400).send("No user found.");
            }
        }
        else {
            console.error("Please provide a user id.");
            res.status(400).send("Please provide a user id.");
        }
    }
    catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).send("Error toggling user status.");
    }
});
exports.toggleUserAccess = toggleUserAccess;
//delete an existing user
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedUser = yield userModel_1.default.findByPk(id);
    yield userModel_1.default.destroy({ where: { id } });
    return res
        .status(200)
        .json({ message: "User deleted successfully.", data: exports.deleteUser });
});
exports.deleteUser = deleteUser;
//get all users
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield userModel_1.default.findAll();
    return res
        .status(200)
        .json({ message: "Fetched all users.", data: allUsers });
});
exports.getAllUsers = getAllUsers;
//get all orders
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let queryOptions = {
            include: [
                {
                    model: orderProductsModel_1.default,
                    as: "orderProducts",
                },
            ],
            order: [["orderDate", "ASC"]],
        };
        const { startDate, endDate } = req.query;
        if (startDate && endDate) {
            queryOptions.where = {
                orderDate: {
                    [sequelize_1.Op.between]: [startDate, endDate],
                },
            };
        }
        else if (startDate && !endDate) {
            queryOptions.where = {
                orderDate: {
                    [sequelize_1.Op.gte]: startDate,
                },
            };
        }
        else if (!startDate && endDate) {
            queryOptions.where = {
                orderDate: {
                    [sequelize_1.Op.lte]: endDate,
                },
            };
        }
        const allOrders = yield orderModel_1.default.findAll(queryOptions);
        const formattedOrders = allOrders.map((order) => {
            return Object.assign({}, order.toJSON());
        });
        formattedOrders.forEach((order) => {
            order.orderDate = (0, moment_1.default)(order.orderDate).format("YYYY-MM-DD");
            order.createdAt = (0, moment_1.default)(order.createdAt).format("YYYY-MM-DD");
            order.updatedAt = (0, moment_1.default)(order.updatedAt).format("YYYY-MM-DD");
            order.orderProducts.forEach((product) => {
                product.createdAt = (0, moment_1.default)(product.createdAt).format("YYYY-MM-DD");
                product.updatedAt = (0, moment_1.default)(product.updatedAt).format("YYYY-MM-DD");
            });
        });
        return res
            .status(200)
            .json({ message: "Fetched all orders.", data: formattedOrders });
    }
    catch (error) {
        console.error("Error fetching all orders. :", error);
        res.status(500).send("Error fetching all orders. ");
    }
});
exports.getAllOrders = getAllOrders;
//approving an order
const approveOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //getting user id from request query
        const { orderId } = req.query;
        if (orderId) {
            const order = yield orderModel_1.default.findByPk(orderId, {
                include: [
                    {
                        model: orderProductsModel_1.default,
                        as: "orderProducts",
                        include: [productModel_1.default],
                    },
                ],
            });
            if (!order) {
                console.log("No order found with this order id.");
                return res
                    .status(400)
                    .json({ message: "No order found with this order id." });
            }
            //getting user from user model
            const user = yield userModel_1.default.findByPk(order === null || order === void 0 ? void 0 : order.userId);
            if (!user) {
                console.log("No user found. User is not logged in.");
                return res
                    .status(400)
                    .json({ message: "No user found. User is not logged in." });
            }
            //checking if the order is not null and order status is not approved already
            if (order && order.orderStatus === "To be approved") {
                //if yes, changing the status to "Approved"
                order.orderStatus = "Approved";
                const currDate = new Date();
                const today = (0, moment_1.default)();
                const targetDate = (0, moment_1.default)(today.add(3, "days"));
                console.log("the target day :", today, " == ", (0, moment_1.default)(today.add(3, "days")));
                console.log("the WEEKEND CHECK :", targetDate.format("dddd") === "Sunday");
                order.expectedDeliveryDate = new Date(currDate);
                let duration = 3;
                if (targetDate.format("dddd") === "Saturday" ||
                    targetDate.format("dddd") === "Sunday") {
                    order.expectedDeliveryDate.setDate(currDate.getDate() + 5);
                    duration = 5;
                    console.log("delivery date while on weekends :", order.expectedDeliveryDate);
                }
                else {
                    order.expectedDeliveryDate.setDate(currDate.getDate() + 3);
                    console.log("delivery date while on WEEKDAYS :", order.expectedDeliveryDate);
                }
                yield (order === null || order === void 0 ? void 0 : order.save());
                //creating notification info
                const userId = order.userId;
                const label = "Order approved!";
                const content = `Your order with id:${order.id} has been approved by admin.`;
                //calling notify service
                yield (0, notify_1.notify)(userId, label, content);
                //using mail service to notify the user about the status change
                let productInfo = "";
                order === null || order === void 0 ? void 0 : order.dataValues.orderProducts.forEach((item) => {
                    productInfo += `<li class="product">${item.Product.name} Price: ₹${item.Product.selling_price}</li>`;
                });
                const email = user.email;
                const subject = "Order approval notification.";
                const text = `Your order has been approved by admin.`;
                const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #007bff;
              text-align: center;
            }
            .order-details {
              margin-bottom: 20px;
            }
            .products {
              margin-left: 20px;
            }
            .product {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Order Details</h1>
            <div class="order-details">
              <p><strong>Your order has been approved by admin.</strong></p>
              <p><strong>Order id:</strong> ${order.id}</p>
              <p><strong>Order date:</strong> ${(0, moment_1.default)(order.orderDate).format("DD-MM-YYYY")}</p>
              <p><strong>Expected delivery date:</strong> ${(0, moment_1.default)(order.expectedDeliveryDate).format("DD-MM-YYYY")}</p>
              <p><strong>Expected delivery duration:</strong> ${duration} days</p>
              <p><strong>Products:</strong></p>
              <ul class="products">${productInfo}</ul>
              <p><strong>Total amount:</strong> ₹${order.totalAmount}/-</p>
            </div>
          </div>
        </body>
        </html>
        `;
                yield (0, sendMail_1.sendMail)(email, subject, text, html);
                console.log("Order has been approved successfully.");
                return res
                    .status(200)
                    .json({ message: "Order has been approved successfully." });
            }
            else if (order && order.orderStatus !== "To be approved") {
                console.log("This order is already approved.");
                res.status(400).send("This order is already approved.");
            }
            else {
                console.log("No order found.");
                res.status(400).send("No order found.");
            }
        }
        else {
            console.error("Please provide an order id.");
            res.status(400).send("Please provide an order id.");
        }
    }
    catch (error) {
        console.error("Error approving the order :", error);
        res.status(500).send("Error approving the order");
    }
});
exports.approveOrder = approveOrder;
//get user by id
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield userModel_1.default.findByPk(id);
    return res
        .status(200)
        .json({ message: "User fetched successfully.", data: user });
});
exports.getUserById = getUserById;
const notifyAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { label, content } = req.body;
        if (!label || !content) {
            console.log("No label or content found in the request body.");
            res.status(400).json({ message: "Please provide all the fields." });
        }
        yield (0, notify_1.notifyAll)(label, content);
        console.log("All users have been notified.");
        res.status(200).json({ message: "All users have been notified." });
    }
    catch (error) {
        console.error("Error in notifyAllUsers function.", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.notifyAllUsers = notifyAllUsers;
const notifySelectedUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, label, content } = req.body;
        if (!ids || !label || !content) {
            console.log("No label or content or ids found in the request body.");
            res.status(400).json({ message: "Please fill all the fields." });
        }
        yield (0, notify_1.notifySelected)(ids, label, content);
        console.log("Selected users have been notified.");
        res.status(200).json({ message: "Selected users have been notified." });
    }
    catch (error) {
        console.error("Error in notifySelectedUsers function.", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.notifySelectedUsers = notifySelectedUsers;
