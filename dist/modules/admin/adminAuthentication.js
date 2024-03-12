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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../user/userModel"));
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get token from the header
        const token = req.headers.authorization.split(" ")[1];
        //verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //get user from the token
        req.body.user = decoded;
        console.log("decoded is :", decoded.email);
        const user = yield userModel_1.default.findOne({ where: { email: decoded.email } });
        console.log("isAdmin :", user === null || user === void 0 ? void 0 : user.isAdmin);
        if (user === null || user === void 0 ? void 0 : user.isAdmin) {
            next();
        }
        else {
            console.log("You are not an admin.");
            return res.status(401).json({ message: "You are not an admin." });
        }
    }
    catch (error) {
        console.log("You are not an admin :", error);
        return res.status(401).json({ message: "You are not an admin." });
    }
});
exports.default = verifyAdmin;
