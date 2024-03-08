import express, { Application } from "express";
import userRouter from "./modules/router/router";
import sequelize from "./modules/config/db";
import dotenv from "dotenv";
import User from "./modules/user/userModel";

dotenv.config();
const PORT = 3000 || process.env.PORT;
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRouter);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ message: err.message });
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Image model synchronized");
    return User.sync();
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
