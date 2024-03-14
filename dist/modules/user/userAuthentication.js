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
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get token from the header
        const token = req.headers.authorization.split(" ")[1];
        //verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //get user from the token
        req.body.user = decoded;
        const user = yield userModel_1.default.findOne({ where: { email: decoded.email } });
        if (!user) {
            console.log("No user found with this email address!");
            return res
                .status(500)
                .json({ message: "No user found with this email address!" });
        }
        if (user === null || user === void 0 ? void 0 : user.isBlocked) {
            console.log("No access, user is currently blocked!");
            return res
                .status(401)
                .json({ message: "Access denied, your account is currently blocked!" });
        }
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > decoded.exp) {
            console.log("Token has been expired!");
            return res
                .status(401)
                .json({ message: "Your token has been expired, please login again." });
        }
        else {
            next();
        }
    }
    catch (error) {
        console.log("Not authorized! :", error);
        return res.status(401).json({ message: "Not authorized!" });
    }
});
exports.default = verifyUser;
