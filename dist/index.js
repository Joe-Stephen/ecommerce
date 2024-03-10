"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./modules/router/router"));
const db_1 = __importDefault(require("./modules/config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = 3000 || process.env.PORT;
const app = (0, express_1.default)();
//using middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// setting routers
app.use("/", router_1.default);
//syncing models and starting server
db_1.default
    .sync({ force: false })
    .then(() => {
    console.log("Models synchronized successfully.");
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error synchronizing models:", error);
});
