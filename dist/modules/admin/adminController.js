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
exports.updateUser = exports.getUserById = exports.getAllUsers = exports.deleteUser = exports.addProduct = exports.resetPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
//JWT generator function
const generateToken = (email) => {
    return jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
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
        //creating new product
        const newProduct = yield productModel_1.default.create({
            name: req.body.name,
            brand: req.body.brand,
            description: req.body.description,
            category: req.body.category,
            regular_price: req.body.regular_price,
            selling_price: req.body.selling_price,
        });
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
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedUser = yield userModel_1.default.findByPk(id);
    yield userModel_1.default.destroy({ where: { id } });
    return res
        .status(200)
        .json({ message: "User deleted successfully.", data: exports.deleteUser });
});
exports.deleteUser = deleteUser;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield userModel_1.default.findAll();
    return res
        .status(200)
        .json({ message: "Fetched all users.", data: allUsers });
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield userModel_1.default.findByPk(id);
    return res
        .status(200)
        .json({ message: "User fetched successfully.", data: user });
});
exports.getUserById = getUserById;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield userModel_1.default.update(Object.assign({}, req.body), { where: { id } });
    const updatedUser = yield userModel_1.default.findByPk(id);
    return res
        .status(200)
        .json({ message: "User updated successfully.", data: exports.updateUser });
});
exports.updateUser = updateUser;
