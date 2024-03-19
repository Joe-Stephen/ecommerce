"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRouter = (0, express_1.Router)();
//admin functions
const adminController_1 = require("../admin/adminController");
const userController_1 = require("../user/userController");
//middlewares
const multerMiddleware_1 = __importDefault(require("../admin/multerMiddleware"));
const adminAuthentication_1 = __importDefault(require("../admin/adminAuthentication"));
const notificationController_1 = require("../notifications/notificationController");
//admin functionalities
adminRouter.post("/login", adminController_1.loginAdmin);
adminRouter.patch("/resetPassword", adminAuthentication_1.default, userController_1.resetPassword);
adminRouter.post("/product", adminAuthentication_1.default, multerMiddleware_1.default.array("images"), adminController_1.addProduct);
adminRouter.post("/updateProduct", adminAuthentication_1.default, multerMiddleware_1.default.array("images"), adminController_1.updateProduct);
adminRouter.get("/", adminAuthentication_1.default, adminController_1.getAllUsers);
adminRouter.get("/orders", adminAuthentication_1.default, adminController_1.getAllOrders);
adminRouter.patch("/approveOrder", adminController_1.approveOrder);
adminRouter.get("/:id", adminAuthentication_1.default, adminController_1.getUserById);
adminRouter.patch("/toggleStatus", adminAuthentication_1.default, adminController_1.toggleUserAccess);
adminRouter.patch("/notification", notificationController_1.toggleStatus);
adminRouter.post("/notifyAll", adminController_1.notifyAllUsers);
adminRouter.post("/notifySelected", adminController_1.notifySelectedUsers);
adminRouter.delete("/:id", adminAuthentication_1.default, adminController_1.deleteUser);
exports.default = adminRouter;
