"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./modules/router/router"));
const db_1 = __importDefault(require("./modules/config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = __importDefault(require("./modules/user/userModel"));
dotenv_1.default.config();
const PORT = 3000 || process.env.PORT;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/", router_1.default);
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
db_1.default
    .sync()
    .then(() => {
    console.log("Image model synchronized");
    return userModel_1.default.sync();
})
    .then(() => {
    console.log("User model synchronized");
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error synchronizing models:", error);
});
