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
exports.notifySelected = exports.notifyAll = exports.notify = void 0;
const notificationModel_1 = __importDefault(require("../notifications/notificationModel"));
const userModel_1 = __importDefault(require("../user/userModel"));
//creating notification
const notify = (userId, label, content) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notificationModel_1.default.create({
        userId,
        label,
        content,
    });
    return notification;
});
exports.notify = notify;
const notifyAll = (label, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield userModel_1.default.findAll();
        if (!allUsers) {
            console.log("No users found!");
            return null;
        }
        const promises = allUsers.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
            yield notificationModel_1.default.create({ userId: user.id, label, content });
        }));
        if (promises) {
            yield Promise.all(promises);
            return true;
        }
    }
    catch (error) {
        console.error("An error happened in the notify all service :", error);
        return null;
    }
});
exports.notifyAll = notifyAll;
const notifySelected = (ids, label, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedUsers = yield userModel_1.default.findAll({ where: { id: ids } });
        console.log("the selected users :", selectedUsers);
        if (!selectedUsers) {
            console.log("No users found!");
            return null;
        }
        const promises = selectedUsers.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
            yield notificationModel_1.default.create({ userId: user.id, label, content });
        }));
        if (promises) {
            yield Promise.all(promises);
            return true;
        }
    }
    catch (error) {
        console.error("An error happened in the notify selected service :", error);
        return null;
    }
});
exports.notifySelected = notifySelected;
