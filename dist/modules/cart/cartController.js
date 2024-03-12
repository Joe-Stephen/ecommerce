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
exports.removeCartItem = exports.increaseCartQuantity = exports.decreaseCartQuantity = exports.addToCart = exports.getUserCart = void 0;
//model imports
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const cartModel_1 = __importDefault(require("../cart/cartModel"));
const cartProductsModel_1 = __importDefault(require("../cart/cartProductsModel"));
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
        const productsInCart = userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products;
        console.log("The products in cart object :", productsInCart);
        const productArray = productsInCart.map((product) => product.dataValues);
        let grandTotal = 0;
        productArray.forEach((product) => {
            product.subTotal =
                product.selling_price * product.CartProducts.dataValues.quantity;
            grandTotal += product.subTotal;
        });
        return res.status(200).json({
            message: "Product has been added to cart.",
            cartProducts: userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products,
            cartGrandTotal: grandTotal,
        });
    }
    catch (error) {
        console.error("Error in finding all products function :", error);
        return res.status(400).json({ message: "Couldn't load all products." });
    }
});
exports.getUserCart = getUserCart;
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
const increaseCartQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
            else if (existingProduct) {
                existingProduct.quantity += 1;
                yield existingProduct.save();
                console.log("Product quantity has been increased.");
                return res
                    .status(200)
                    .json({ message: "Product quantity has been increased." });
            }
        }
    }
    catch (error) {
        console.error("Error in user increaseCartQuantity function :", error);
        return res.status(400).json({ message: "Couldn't increaseCartQuantity." });
    }
});
exports.increaseCartQuantity = increaseCartQuantity;
const removeCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        let userCart = yield cartModel_1.default.findOne({ where: { userId: 1 } });
        if (!userCart) {
            console.log("No cart found.");
            return res.status(400).json({ message: "No cart found." });
        }
        else {
            const existingProduct = yield cartProductsModel_1.default.findOne({
                where: { cartId: 1, productId: 3 },
            });
            if (!existingProduct) {
                console.log("This product is not in the cart.");
                return res
                    .status(400)
                    .json({ message: "This product is not in the cart." });
            }
            else if (existingProduct) {
                yield cartProductsModel_1.default.destroy({ where: { cartId: 1, productId: 3 } });
                console.log("Product has been removed.");
                return res.status(200).json({ message: "Product has been removed." });
            }
        }
    }
    catch (error) {
        console.error("Error in user remove cart item function :", error);
        return res.status(400).json({ message: "Couldn't remove cart item." });
    }
});
exports.removeCartItem = removeCartItem;
