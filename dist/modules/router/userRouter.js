"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
//user functions
const userController_1 = require("../user/userController");
//cart functions
const cartController_1 = require("../cart/cartController");
const userAuthentication_1 = __importDefault(require("../user/userAuthentication"));
//user functionalities
userRouter.post("/", userController_1.createUser);
userRouter.post("/login", userController_1.loginUser);
userRouter.patch("/resetPassword", userAuthentication_1.default, userController_1.resetPassword);
userRouter.get("/products", userController_1.getAllProducts);
userRouter.put("/:id", userController_1.updateUser);
//cart functionalities
userRouter.get("/cart", cartController_1.getUserCart);
userRouter.post("/cart", cartController_1.addToCart);
userRouter.patch("/decreaseCartQuantity", cartController_1.decreaseCartQuantity);
userRouter.patch("/increaseCartQuantity", cartController_1.increaseCartQuantity);
userRouter.delete("/removeCartItem", cartController_1.removeCartItem);
exports.default = userRouter;
