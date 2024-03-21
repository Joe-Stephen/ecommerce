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
//importing DB queries
const dbQueries_1 = __importDefault(require("../services/dbQueries"));
const dbQueries = new dbQueries_1.default();
const getUserCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUser = req.body.user;
        const userWithCart = yield dbQueries.findUserWithCartByEmail(loggedInUser.email);
        if (!(userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart)) {
            console.log("User cart is empty.");
            return res.status(400).json({ message: "Your cart is empty." });
        }
        const productsInCart = userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products;
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
        const loggedInUser = req.body.user;
        const { productId } = req.query;
        if (!productId) {
            console.log("No productId in query params.");
            return res
                .status(400)
                .json({ message: "Please provide a product id as query param." });
        }
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        if (typeof productId === "string") {
            //finding the user
            const user = yield dbQueries.findUserByEmail(loggedInUser.email);
            if (!user) {
                console.log("No user found. User is not logged in.");
                return res
                    .status(400)
                    .json({ message: "No user found. User is not logged in." });
            }
            //finding user cart
            let userCart = yield dbQueries.findCartByUserId(user.id);
            if (!userCart) {
                //creating user cart
                userCart = yield dbQueries.createCart(user.id);
                if (userCart) {
                    //creating cart product
                    yield dbQueries.createCartProduct(userCart.id, parseInt(productId), 1);
                }
                console.log("Product has been added to cart.");
                return res
                    .status(200)
                    .json({ message: "Created cart and added product to cart." });
            }
            else {
                const existingProduct = yield dbQueries.findExistingCartProduct(userCart.id, parseInt(productId));
                if (!existingProduct) {
                    //creating cart product
                    yield dbQueries.createCartProduct(userCart.id, parseInt(productId), 1);
                    console.log("Product has been added to cart.");
                    return res
                        .status(200)
                        .json({ message: "Product has been added to cart." });
                }
                else {
                    //incrementing quantity of existing cart product
                    existingProduct.quantity += 1;
                    yield existingProduct.save();
                    console.log("Product quantity has been increased.");
                    return res
                        .status(200)
                        .json({ message: "Product quantity has been increased." });
                }
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
        const loggedInUser = req.body.user;
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        const { productId } = req.query;
        if (!productId) {
            console.log("No productId in query params.");
            return res
                .status(400)
                .json({ message: "Please provide a product id as query param." });
        }
        if (typeof productId === "string") {
            //finding the user
            const user = yield dbQueries.findUserByEmail(loggedInUser.email);
            if (!user) {
                console.log("No user found. User is not logged in.");
                return res
                    .status(400)
                    .json({ message: "No user found. User is not logged in." });
            }
            //finding user cart
            let userCart = yield dbQueries.findCartByUserId(user.id);
            if (!userCart) {
                console.log("No cart found.");
                return res.status(400).json({ message: "No cart found." });
            }
            else {
                const existingProduct = yield dbQueries.findExistingCartProduct(userCart.id, parseInt(productId));
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
                    yield dbQueries.destroyCartProduct(userCart.id, parseInt(productId));
                    console.log("Product has been removed.");
                    return res.status(200).json({ message: "Product has been removed." });
                }
            }
        }
    }
    catch (error) {
        console.error("Error in user decreaseCartQuantity function :", error);
        return res
            .status(400)
            .json({ message: "Couldn't decrease cart quantity." });
    }
});
exports.decreaseCartQuantity = decreaseCartQuantity;
const increaseCartQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUser = req.body.user;
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        const { productId } = req.query;
        if (!productId) {
            console.log("No productId in query params.");
            return res
                .status(400)
                .json({ message: "Please provide a product id as query param." });
        }
        if (typeof productId === "string") {
            //finding the user
            const user = yield dbQueries.findUserByEmail(loggedInUser.email);
            if (!user) {
                console.log("No user found. User is not logged in.");
                return res
                    .status(400)
                    .json({ message: "No user found. User is not logged in." });
            }
            //finding user cart
            let userCart = yield dbQueries.findCartByUserId(user.id);
            if (!userCart) {
                console.log("No cart found.");
                return res.status(400).json({ message: "No cart found." });
            }
            else {
                const existingProduct = yield dbQueries.findExistingCartProduct(userCart.id, parseInt(productId));
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
    }
    catch (error) {
        console.error("Error in user increaseCartQuantity function :", error);
        return res.status(400).json({ message: "Couldn't increaseCartQuantity." });
    }
});
exports.increaseCartQuantity = increaseCartQuantity;
const removeCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUser = req.body.user;
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        const { productId } = req.query;
        if (!productId) {
            console.log("No productId in query params.");
            return res
                .status(400)
                .json({ message: "Please provide a product id as query param." });
        }
        if (typeof productId === "string") {
            //finding the user
            const user = yield dbQueries.findUserByEmail(loggedInUser.email);
            if (!user) {
                console.log("No user found. User is not logged in.");
                return res
                    .status(400)
                    .json({ message: "No user found. User is not logged in." });
            }
            //finding user cart
            let userCart = yield dbQueries.findCartByUserId(user.id);
            if (!userCart) {
                console.log("No cart found.");
                return res.status(400).json({ message: "No cart found." });
            }
            else {
                const existingProduct = yield dbQueries.findExistingCartProduct(userCart.id, parseInt(productId));
                if (!existingProduct) {
                    console.log("This product is not in the cart.");
                    return res
                        .status(400)
                        .json({ message: "This product is not in the cart." });
                }
                else if (existingProduct) {
                    yield dbQueries.destroyCartProduct(userCart.id, parseInt(productId));
                    console.log("Product has been removed.");
                    return res.status(200).json({ message: "Product has been removed." });
                }
            }
        }
    }
    catch (error) {
        console.error("Error in user remove cart item function :", error);
        return res.status(400).json({ message: "Couldn't remove cart item." });
    }
});
exports.removeCartItem = removeCartItem;
