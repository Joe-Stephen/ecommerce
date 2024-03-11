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
exports.updateUser = exports.getUserById = exports.getAllUsers = exports.deleteUser = exports.addProduct = exports.resetPassword = exports.getUserCart = exports.decreaseCartQuantity = exports.addToCart = exports.getAllProducts = exports.loginUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../user/userModel"));
const imageModel_1 = __importDefault(require("../product/imageModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const cartModel_1 = __importDefault(require("../cart/cartModel"));
const cartProductsModel_1 = __importDefault(require("../cart/cartProductsModel"));
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
        //finding all products
        const products = yield productModel_1.default.findAll({
            where: { isBlocked: false },
            include: [{ model: imageModel_1.default, attributes: ["image"] }],
        });
        //formatting images array
        const allProducts = products.map((product) => {
            const imageNames = product.Images.map((image) => image.image);
            return Object.assign(Object.assign({}, product.toJSON()), { Images: imageNames }); // Replace Images with imageUrls
        });
        return res
            .status(200)
            .json({ message: "Products fetched successfully.", data: allProducts });
    }
    catch (error) {
        console.error("Error in finding all products function :", error);
        return res.status(400).json({ message: "Couldn't load all products." });
    }
});
exports.getAllProducts = getAllProducts;
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        let userCart = yield cartModel_1.default.findOne({ where: { userId: 1 } });
        if (!userCart) {
            userCart = yield cartModel_1.default.create({
                userId: 1,
            });
            yield cartProductsModel_1.default.create({
                cartId: userCart.id,
                productId: 3,
                quantity: 1,
            });
            console.log("Product has been added to cart.");
            return res
                .status(200)
                .json({ message: "Product has been added to cart." });
        }
        else {
            const existingProduct = yield cartProductsModel_1.default.findOne({
                where: { cartId: 1, productId: 3 },
            });
            if (!existingProduct) {
                cartProductsModel_1.default.create({ cartId: 1, productId: 3, quantity: 1 });
                console.log("Product has been added to cart.");
                return res
                    .status(200)
                    .json({ message: "Product has been added to cart." });
            }
            else {
                existingProduct.quantity += 1;
                yield existingProduct.save();
                console.log("Product has been added to cart.");
                return res
                    .status(200)
                    .json({ message: "Product has been added to cart." });
            }
        }
    }
    catch (error) {
        console.error("Error in user add to cart function :", error);
        return res.status(400).json({ message: "Couldn't add to cart." });
    }
});
exports.addToCart = addToCart;
const decreaseCartQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        let userCart = yield cartModel_1.default.findOne({ where: { userId: 1 } });
        if (!userCart) {
            console.log("No cart found.");
            return res.status(400).json({ message: "No cart found." });
        }
        else {
            const existingProduct = yield cartProductsModel_1.default.findOne({
                where: { cartId: 3, productId: 5 },
            });
            if (!existingProduct) {
                console.log("This product is not in the cart.");
                return res
                    .status(400)
                    .json({ message: "This product is not in the cart." });
            }
            else if (existingProduct.quantity > 1) {
                existingProduct.quantity -= 1;
                yield existingProduct.save();
                console.log("Product quantity has been reduced.");
                return res
                    .status(200)
                    .json({ message: "Product has been added to cart." });
            }
            else if (existingProduct.quantity === 1) {
                yield cartProductsModel_1.default.destroy({ where: { cartId: 3, productId: 5 } });
                console.log("Product has been removed.");
                return res.status(200).json({ message: "Product has been removed." });
            }
        }
    }
    catch (error) {
        console.error("Error in user decreaseCartQuantity function :", error);
        return res.status(400).json({ message: "Couldn't decreaseCartQuantity." });
    }
});
exports.decreaseCartQuantity = decreaseCartQuantity;
const getUserCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userWithCart = yield userModel_1.default.findByPk(1, {
            include: [
                {
                    model: cartModel_1.default,
                    include: [productModel_1.default],
                },
            ],
        });
        console.log("user cart=", userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products);
        const total = (userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products).forEach((product) => {
            console.log("the rate of product :", product.selling_price);
        });
        const productsInCart = userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products;
        console.log("The products in cart object :", productsInCart);
        const productArray = productsInCart.map((product) => product.dataValues);
        let grandTotal = 0;
        productArray.forEach((product) => {
            product.subTotal = (product.selling_price) * (product.CartProducts.dataValues.quantity);
            grandTotal += product.subTotal;
        });
        console.log("product array after two foreach functions :", productArray);
        console.log("grand total :", grandTotal);
        console.log("User cart fetched successfully.");
        return res
            .status(200)
            .json({
            message: "Product has been added to cart.",
            cartProducts: userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products,
            cartGrandTotal: grandTotal
        });
    }
    catch (error) {
        console.error("Error in finding all products function :", error);
        return res.status(400).json({ message: "Couldn't load all products." });
    }
});
exports.getUserCart = getUserCart;
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
        }
        res.status(200).send("Images uploaded successfully");
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
