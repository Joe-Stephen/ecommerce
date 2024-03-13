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
exports.updateUser = exports.getUserById = exports.getAllUsers = exports.deleteUser = exports.addProduct = exports.resetPassword = exports.getAllProducts = exports.loginUser = exports.verifyOtp = exports.sendVerifyMail = exports.createUser = void 0;
const sequelize_1 = require("sequelize");
const otpGenerator_1 = require("../services/otpGenerator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = require("../services/sendMail");
//model imports
const userModel_1 = __importDefault(require("../user/userModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const verificationsModel_1 = __importDefault(require("./verificationsModel"));
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        console.log("Please provide all the details.");
        return res.status(400).json({ message: "Please provide all the details." });
    }
    //checking for existing user
    const existingUser = yield userModel_1.default.findOne({ where: { email: email } });
    if (existingUser) {
        console.log("This email is already registered.");
        return res
            .status(400)
            .json({ message: "This email is already registered." });
    }
    //hashing password
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    //user creation
    const user = yield userModel_1.default.create({
        username,
        email,
        password: hashedPassword,
    });
    return res
        .status(200)
        .json({ message: "User created successfully", data: user });
});
exports.createUser = createUser;
//@desc sending otp for email verification
//@route POST /sendOtp
//@access Public
const sendVerifyMail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json("Please enter your email.");
        }
        console.log(`Received email= ${email}`);
        const existingUser = yield userModel_1.default.findOne({ where: { email } });
        if (existingUser) {
            console.log("This email is already registered!");
            return res
                .status(400)
                .json({ message: "This email is already registered!" });
        }
        else {
            const otp = (0, otpGenerator_1.generateOtp)();
            const subject = "Register OTP Verification";
            const text = `Your OTP for verification is ${otp}`;
            //sending otp
            yield (0, sendMail_1.sendMail)(email, subject, text);
            const verificationDoc = yield verificationsModel_1.default.create({ email, otp });
            console.log(`OTP has been saved to verifications : ${verificationDoc}`);
            console.log(`Otp has been sent to ${email}.`);
            return res.status(201).json("Otp has been sent to your email address.");
        }
    }
    catch (error) {
        console.error("Error in sendOtp function :", error);
        return res.status(500).json("Unexpected error happened while sending otp.");
    }
});
exports.sendVerifyMail = sendVerifyMail;
//@desc verifying otp
//@route POST /verify-otp
//@access Public
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otpAttempt, email } = req.body;
        if (!otpAttempt || !email) {
            return res.status(400).json("Please enter your otp.");
        }
        console.log(`Received otp attempt= ${otpAttempt}`);
        console.log(`Received email= ${email}`);
        //checking for an existing user with the same email id
        const existingDoc = yield verificationsModel_1.default.findOne({ where: { email } });
        if (!existingDoc) {
            return res
                .status(400)
                .json({ message: "No document found with this email." });
        }
        if (otpAttempt === existingDoc.otp) {
            yield verificationsModel_1.default.destroy({ where: { email } });
            return res.status(200).json({ message: "Mail verified successfully." });
        }
        return res.status(400).json({ message: "Incorrect otp." });
    }
    catch (error) {
        console.error("Error in verifyOtp function :", error);
        return res
            .status(500)
            .json("Unexpected error happened while verifying otp.");
    }
});
exports.verifyOtp = verifyOtp;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            console.log("No user found with this email!");
            return res
                .status(400)
                .json({ message: "No user found with this email!" });
        }
        if (user && (yield bcrypt_1.default.compare(password, user.password))) {
            const loggedInUser = {
                id: user.id,
                name: user.username,
                email: user.email,
                token: generateToken(user.email),
            };
            console.log("User logged in successfully");
            return res
                .status(201)
                .json({ message: "Login successfull", data: loggedInUser });
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
exports.loginUser = loginUser;
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, searchKey, sortType } = req.query;
        const count = 5;
        const skip = (parseInt(page) - 1) * count;
        const whereCondition = { isBlocked: false };
        if (searchKey)
            whereCondition.name = { [sequelize_1.Op.like]: `%${searchKey}%` };
        const orderCondition = sortType
            ? [["selling_price", `${sortType}`]]
            : [];
        const products = yield productModel_1.default.findAll({
            limit: count,
            offset: skip,
            where: whereCondition,
            order: orderCondition,
            include: [{ model: imageModel_1.default, attributes: ["image"] }],
        });
        const allProducts = products.map((product) => {
            const imageUrls = product.Images.map((image) => image.image);
            return Object.assign(Object.assign({}, product.toJSON()), { Images: imageUrls });
        });
        return res
            .status(200)
            .json({ message: "Products fetched successfully.", data: allProducts });
    }
    catch (error) {
        console.error("Error in finding all products function:", error);
        return res.status(400).json({ message: "Couldn't load all products." });
    }
});
exports.getAllProducts = getAllProducts;
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
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("body in upload :", req.files);
        const promises = (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            yield imageModel_1.default.create({
                postId: req.body.postId,
                image: file.originalname,
            });
        }));
        if (promises) {
            yield Promise.all(promises);
            res.status(200).send("Images uploaded successfully");
        }
    }
    catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).send("Error uploading images");
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
