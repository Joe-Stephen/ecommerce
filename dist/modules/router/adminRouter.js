"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRouter = (0, express_1.Router)();
//admin functions
const adminController_1 = require("../admin/adminController");
//middlewares
const multerMiddleware_1 = __importDefault(require("../admin/multerMiddleware"));
const userAuthentication_1 = __importDefault(require("../user/userAuthentication"));
//admin functionalities
adminRouter.post("/login", userAuthentication_1.default, adminController_1.loginAdmin);
adminRouter.post("/product", userAuthentication_1.default, multerMiddleware_1.default.array("images"), adminController_1.addProduct);
adminRouter.get("/", userAuthentication_1.default, adminController_1.getAllUsers);
adminRouter.get("/:id", userAuthentication_1.default, adminController_1.getUserById);
adminRouter.patch("/toggleStatus", adminController_1.toggleUserAccess);
adminRouter.delete("/:id", userAuthentication_1.default, adminController_1.deleteUser);
exports.default = adminRouter;
