import { Router } from "express";
const userRouter = Router();

//user functions
import {
  createUser,
  loginUser,
  resetPassword,
  getAllProducts,
  updateUser,
} from "../user/userController";

//cart functions
import {
  addToCart,
  getUserCart,
  decreaseCartQuantity,
  increaseCartQuantity,
  removeCartItem,
} from "../cart/cartController";

//admin functions
import { addProduct } from "../admin/adminController";

//middlewares
import upload from "../admin/multerMiddleware";
import verifyUser from "../user/userAuthentication";

//user functionalities
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

export default userRouter;
