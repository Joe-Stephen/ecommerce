"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
//user functions
const userController_1 = require("../user/userController");
//admin functions
const adminController_1 = require("../admin/adminController");
//middlewares
const multerMiddleware_1 = __importDefault(require("../admin/multerMiddleware"));
const userAuthentication_1 = __importDefault(require("../user/userAuthentication"));
//user functionality routes
router.post("/", userController_1.createUser);
router.post("/login", userController_1.loginUser);
router.patch("/resetPassword", userAuthentication_1.default, userController_1.resetPassword);
router.get("/products", userController_1.getAllProducts);
router.get("/cart", userController_1.getUserCart);
router.post("/cart", userController_1.addToCart);
router.get("/", userController_1.getAllUsers);
router.get("/:id", userController_1.getUserById);
router.put("/:id", userController_1.updateUser);
router.delete("/:id", userController_1.deleteUser);
//admin functionality routes
router.post("/product", multerMiddleware_1.default.array('images'), adminController_1.addProduct);
exports.default = router;
