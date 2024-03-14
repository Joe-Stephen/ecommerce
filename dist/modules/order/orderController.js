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
exports.cancelOrder = exports.checkOut = void 0;
//model imports
const userModel_1 = __importDefault(require("../user/userModel"));
const productModel_1 = __importDefault(require("../product/productModel"));
const cartModel_1 = __importDefault(require("../cart/cartModel"));
const orderModel_1 = __importDefault(require("./orderModel"));
const orderProductsModel_1 = __importDefault(require("./orderProductsModel"));
const cancelOrderModel_1 = __importDefault(require("./cancelOrderModel"));
const checkOut = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUser = req.body.user;
        console.log("the user in req is :", loggedInUser.email);
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        const user = yield userModel_1.default.findOne({ where: { email: loggedInUser.email } });
        if (!user) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        const pendingOrder = yield orderModel_1.default.findAll({
            where: { userId: user.id, orderStatus: "To be approved" },
        });
        if (pendingOrder.length > 0) {
            console.log("This user has a pending approval.");
            return res.status(400).json({
                message: "Couldn't checkout products as you already have a pending approval.",
            });
        }
        const userWithCart = yield userModel_1.default.findByPk(user.id, {
            include: [
                {
                    model: cartModel_1.default,
                    include: [productModel_1.default],
                },
            ],
        });
        console.log("the user with cart :", userWithCart);
        const productsInCart = userWithCart === null || userWithCart === void 0 ? void 0 : userWithCart.dataValues.Cart.dataValues.Products;
        const productArray = productsInCart.map((product) => product.dataValues);
        const orderProducts = [];
        let grandTotal = 0;
        productArray.forEach((product) => {
            product.subTotal =
                product.selling_price * product.CartProducts.dataValues.quantity;
            grandTotal += product.subTotal;
            orderProducts.push(product.id);
        });
        const orderObject = yield orderModel_1.default.create({
            userId: user.id,
            totalAmount: grandTotal,
        });
        const promises = productArray.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            yield orderProductsModel_1.default.create({
                orderId: orderObject.id,
                productId: product.id,
                price: product.selling_price,
                quantity: product.CartProducts.dataValues.quantity,
            });
        }));
        if (promises) {
            yield Promise.all(promises);
            //removing user cart
            // await Cart.destroy({where:{userId:user.id }});
            return res.status(200).json({
                message: "Order has been placed.",
                data: orderObject,
            });
        }
    }
    catch (error) {
        console.error("Error in checkout function :", error);
        return res.status(400).json({ message: "Couldn't checkout products." });
    }
});
exports.checkOut = checkOut;
const cancelOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            console.log("No order id found in query.");
            res.status(400).json({ message: "Please provide an order id." });
        }
        const { reason } = req.body;
        if (!reason) {
            console.log("No reason provided.");
            res.status(400).json({ message: "Please provide your reason." });
        }
        const cancelRequest = yield cancelOrderModel_1.default.create({
            orderId: orderId,
            reason: reason,
        });
        console.log("Cancel request has been submitted.");
        return res.status(200).json({
            message: "Cancel request has been submitted.",
        });
    }
    catch (error) {
        console.error("An error happened in the cancelOrder function :", error);
        res.status(500).json({ message: "Internal server error while cancelling the order." });
    }
});
exports.cancelOrder = cancelOrder;
