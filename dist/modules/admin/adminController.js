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
exports.getUserById = exports.approveOrder = exports.getAllOrders = exports.getAllUsers = exports.deleteUser = exports.toggleUserAccess = exports.addProduct = exports.resetPassword = exports.loginAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const sendMail_1 = require("../services/sendMail");
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
        console.log("data in body :", req.body);
        console.log("files in upload :", req.files);
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
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product");
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
            //  res
            // .status(200)
            // .json({data:order, message: "Order has been approved successfully." });
            console.log("order with products data :", order === null || order === void 0 ? void 0 : order.dataValues.orderProducts);
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
                yield (order === null || order === void 0 ? void 0 : order.save());
                //using mail service to notify the user about the status change
                let productInfo = [];
                order === null || order === void 0 ? void 0 : order.dataValues.orderProducts.forEach((item) => {
                    console.log("Each product is :", item.Product);
                    productInfo.push(`
          Product name: ${item.Product.name} Price: ₹${item.Product.selling_price}
          `);
                });
                // const products=order?.dataValues.map((product:any)=>{
                //   return product;
                //   // return {name:product.name.toString(), price:product.selling_price, quantity:product.quantity}
                // })
                console.log("The array of products name :", productInfo);
                const email = user.email;
                const subject = "Order approval notification.";
                const text = `Your order has been approved by admin.
        Order id: ${orderId}
        Order date: ${(0, moment_1.default)(order.orderDate).format("YYYY-MM-DD")}
        products: ${productInfo}
        Total amount: ₹${order.totalAmount}/-`;
                yield (0, sendMail_1.sendMail)(email, subject, text);
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
