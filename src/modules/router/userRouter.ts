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

//user functionalities
userRouter.post("/sendOtp", sendVerifyMail);
userRouter.post("/verifyEmail", verifyOtp)
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.patch("/resetPassword", verifyUser, resetPassword);
userRouter.get("/products", getAllProducts);
userRouter.put("/:id", updateUser);

//cart functionalities
userRouter.get("/cart", getUserCart);
userRouter.post("/cart", addToCart);
userRouter.patch("/decreaseCartQuantity", decreaseCartQuantity);
userRouter.patch("/increaseCartQuantity", increaseCartQuantity);
userRouter.delete("/removeCartItem", removeCartItem);

//order functionalities
userRouter.post("/checkOut", checkOut);

export default userRouter;
