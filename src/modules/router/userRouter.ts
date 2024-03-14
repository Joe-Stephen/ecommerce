import { Router } from "express";
const userRouter = Router();

//user functions
import {
  createUser,
  loginUser,
  resetPassword,
  getAllProducts,
  updateUser,
  sendVerifyMail,
  verifyOtp,
} from "../user/userController";

//cart functions
import {
  addToCart,
  getUserCart,
  decreaseCartQuantity,
  increaseCartQuantity,
  removeCartItem,
} from "../cart/cartController";

//order functions
import {
  checkOut
} from "../order/orderController";

//middlewares
import verifyUser from "../user/userAuthentication";
import { getAllNotifications } from "../notifications/notificationController";

//user functionalities
userRouter.post("/login", loginUser);
userRouter.post("/sendOtp", sendVerifyMail);
userRouter.post("/verifyEmail", verifyOtp);
userRouter.get("/notifications", verifyUser, getAllNotifications);
userRouter.post("/", createUser);
userRouter.patch("/resetPassword", verifyUser, resetPassword);
userRouter.get("/products", getAllProducts);
userRouter.put("/:id", updateUser);

//cart functionalities
userRouter.get("/cart", verifyUser, getUserCart);
userRouter.post("/cart", verifyUser, addToCart);
userRouter.patch("/decreaseCartQuantity", verifyUser, decreaseCartQuantity);
userRouter.patch("/increaseCartQuantity", verifyUser, increaseCartQuantity);
userRouter.delete("/removeCartItem", removeCartItem);

//order functionalities
userRouter.post("/checkOut", verifyUser, checkOut);

export default userRouter;
