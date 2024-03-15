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
exports.toggleStatus = exports.getAllNotifications = void 0;
//importing models
const notificationModel_1 = __importDefault(require("./notificationModel"));
const userModel_1 = __importDefault(require("../user/userModel"));
const db_1 = __importDefault(require("../config/db"));
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUser = req.body.user;
        const user = yield userModel_1.default.findOne({ where: { email: loggedInUser.email } });
        if (!user) {
            console.log("No user found.");
            return res.status(500).json({ message: "No user found." });
        }
        const allNotifications = yield notificationModel_1.default.findAll({
            where: { userId: user.id },
        });
        return res.status(200).json({
            message: "Notifications has been fetched successfully.",
            data: allNotifications,
        });
    }
    catch (error) { }
});
exports.getAllNotifications = getAllNotifications;
const toggleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        if (!ids) {
            console.log("No notification id provided.");
            return res
                .status(500)
                .json({ message: "Please provide notification id." });
        }
        const notification = yield notificationModel_1.default.update({ checked: db_1.default.literal('NOT checked') }, { where: { id: ids } });
        if (!notification) {
            console.log("No notification found with this id.");
            return res
                .status(400)
                .json({ message: "No notification found with this id." });
        }
        else {
            console.log("Notification status has been toggled.");
            return res
                .status(200)
                .json({ message: "Notification status has been toggled." });
        }
    }
    catch (error) {
        console.error("Error in notification toggle status :", error);
        return res
            .status(500)
            .json({ message: "Error in notification toggle status." });
    }
});
exports.toggleStatus = toggleStatus;
