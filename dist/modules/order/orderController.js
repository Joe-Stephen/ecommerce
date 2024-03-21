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
exports.editOrder = exports.cancelOrder = exports.checkOut = void 0;
const moment_1 = __importDefault(require("moment"));
//importing DB queries
const dbQueries_1 = __importDefault(require("../services/dbQueries"));
const dbQueries = new dbQueries_1.default();
const checkOut = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = (0, moment_1.default)();
        const day = date.format("dddd");
        //checking if the order date is on weekends
        if (day === "Saturday" || day === "Sunday") {
            console.log("Cannot place an order on weekends.");
            return res
                .status(400)
                .json({ message: "Cannot place an order on weekends." });
        }
        const loggedInUser = req.body.user;
        if (!loggedInUser) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        //finding user by email
        const user = yield dbQueries.findUserByEmail(loggedInUser.email);
        if (!user) {
            console.log("No user found. User is not logged in.");
            return res
                .status(400)
                .json({ message: "No user found. User is not logged in." });
        }
        let queryOptions = {
            where: { userId: user.id, orderStatus: "To be approved" },
        };
        const pendingOrder = yield dbQueries.findAllOrdersWithOptions(queryOptions);
        if (pendingOrder && pendingOrder.length > 0) {
            console.log("This user has a pending approval.");
            return res.status(400).json({
                message: "Couldn't checkout products as you already have a pending approval.",
            });
        }
        const userWithCart = yield dbQueries.findUserWithCartByEmail(loggedInUser.email);
        if (!userWithCart) {
            console.log("No user with cart found.");
            return res.status(400).json({ message: "No user with cart found." });
        }
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
        const orderObject = yield dbQueries.createOrder(user.id, grandTotal);
        if (!orderObject) {
            console.log("Error in creating order.");
            return res.status(500).json({ message: "Couldn't place the order." });
        }
        const promises = productArray.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            yield dbQueries.createOrderProduct(orderObject.id, product.id, product.selling_price, product.CartProducts.dataValues.quantity);
        }));
        if (promises) {
            yield Promise.all(promises);
            //removing user cart
            yield dbQueries.destroyCart(user.id);
            //removing cart products
            yield dbQueries.destroyAllCartProducts(userWithCart.id);
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
            return res.status(400).json({ message: "Please provide an order id." });
        }
        const { reason } = req.body;
        if (!reason) {
            console.log("No reason provided.");
            return res.status(400).json({ message: "Please provide your reason." });
        }
        if (typeof orderId === "string") {
            const order = yield dbQueries.findOrderById(parseInt(orderId));
            if (!order) {
                console.log("There is no order with this id.");
                return res
                    .status(400)
                    .json({ message: "There is no order with this id." });
            }
            if ((order === null || order === void 0 ? void 0 : order.orderStatus) === "To be approved") {
                const cancelRequest = yield dbQueries.createCancelRequest(parseInt(orderId), reason);
                order.orderStatus = "Cancelled";
                yield order.save();
                console.log("Cancel request has been submitted.");
                //restoring cart
                const orderProducts = yield dbQueries.findAllOrderProducts(order.id);
                if (!orderProducts) {
                    console.log("No order products found in the order.");
                    return res
                        .status(400)
                        .json({ message: "No order products found in the order." });
                }
                //finding user cart
                let userCart = yield dbQueries.findCartByUserId(order.userId);
                if (!userCart) {
                    //creating user cart
                    userCart = yield dbQueries.createCart(order.userId);
                }
                //adding products back to cart
                const promises = orderProducts.map((product) => __awaiter(void 0, void 0, void 0, function* () {
                    yield dbQueries.createCartProduct(userCart.id, product.productId, product.quantity);
                }));
                if (promises) {
                    yield Promise.all(promises);
                    console.log("Cart has been restored.");
                    return res.status(200).json({
                        message: "Cancel request has been submitted.",
                    });
                }
                else {
                    console.log("Unexpected error happened in cancel order function.");
                    return res.status(500).json({
                        message: "Unexpected error happened while cancelling the order.",
                    });
                }
            }
            else if ((order === null || order === void 0 ? void 0 : order.orderStatus) === "Cancelled") {
                console.log("This order is already cancelled.");
                return res
                    .status(400)
                    .json({ message: "This order is already cancelled." });
            }
            else {
                console.log("This order is already approved by admin, cannot be cancelled.");
                return res.status(400).json({
                    message: "This order is already approved by admin, cannot be cancelled.",
                });
            }
        }
    }
    catch (error) {
        console.error("An error happened in the cancelOrder function :", error);
        return res
            .status(500)
            .json({ message: "Internal server error while cancelling the order." });
    }
});
exports.cancelOrder = cancelOrder;
const editOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.query;
        if (typeof orderId === "string") {
            const { productIds, action } = req.body;
            if (!orderId || !productIds || !action) {
                console.log("No order/productId/quantity provided in the req.query.");
                return res
                    .status(400)
                    .json({ message: "Please provide all the details." });
            }
            const order = yield dbQueries.findOrderById(parseInt(orderId));
            if (!order) {
                console.log("No order found with this id.");
                return res
                    .status(400)
                    .json({ message: "No order found with this id." });
            }
            if (order.orderStatus !== "To be approved") {
                console.log("This order cannot be edited.");
                return res
                    .status(400)
                    .json({ message: "This order cannot be edited." });
            }
            else {
                let amount = 0;
                const products = yield dbQueries.findAllProductsInArray(productIds);
                if (action === "add") {
                    if (!products || products.length === 0) {
                        console.log("No products specified for addition.");
                        return res
                            .status(400)
                            .json({ message: "Please specify products for addition." });
                    }
                    const promises = products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
                        amount += product.selling_price;
                        const existingProduct = yield dbQueries.findOrderProductByProductAndOrderIds(product.id, parseInt(orderId));
                        if (existingProduct) {
                            yield dbQueries.updateOrderProductQty(existingProduct.quantity + 1, existingProduct.id);
                        }
                        else {
                            yield dbQueries.createOrderProduct(parseInt(orderId), product.id, product.selling_price, 1);
                        }
                    }));
                    yield Promise.all(promises);
                    console.log("New products has been added to order products.");
                    order.totalAmount += amount;
                    yield order.save();
                    console.log("Order total amount has been updated.");
                    console.log("Order has been edited.");
                    return res.status(200).json({
                        message: "Order has been edited.",
                    });
                }
                else if (action === "remove") {
                    if (!products || products.length === 0) {
                        console.log("No products specified for removal.");
                        return res
                            .status(400)
                            .json({ message: "Please specify products for removal." });
                    }
                    const promises = products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
                        const existingProduct = yield dbQueries.findOrderProductByProductAndOrderIds(product.id, parseInt(orderId));
                        if (existingProduct) {
                            amount = amount + existingProduct.price;
                            if (existingProduct.quantity > 1) {
                                existingProduct.quantity -= 1;
                                yield existingProduct.save();
                            }
                            else {
                                yield dbQueries.destroyOrdertProduct(existingProduct.id);
                            }
                        }
                        else {
                            console.log(`${product.name} is not in the order.`);
                        }
                    }));
                    yield Promise.all(promises);
                    console.log("The products has been removed from the order.");
                    order.totalAmount -= amount;
                    yield order.save();
                    console.log("Order total amount has been updated.");
                    console.log("Order has been edited.");
                    return res.status(200).json({
                        message: "Order has been edited.",
                    });
                }
            }
        }
    }
    catch (error) {
        console.error("An error in edit order function :", error);
        return res.status(500).json({ message: "Couldn't edit the order." });
    }
});
exports.editOrder = editOrder;
