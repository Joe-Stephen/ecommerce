import { Router } from "express";
const router = Router();

//user functions
import {
  createUser,
  loginUser,
  resetPassword,
  getAllProducts,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  getUserCart,
  addToCart,
  decreaseCartQuantity,
  removeCartItem,
} from "../user/userController";

//admin functions
import {addProduct} from "../admin/adminController";

//middlewares
import upload from "../admin/multerMiddleware";
import verifyUser from "../user/userAuthentication";

//user functionality routes
router.post("/", createUser);
router.post("/login", loginUser);
router.patch("/resetPassword", verifyUser, resetPassword);
router.get("/products", getAllProducts);
router.get("/cart", getUserCart);
router.post("/cart", addToCart);
router.patch("/decreaseCartQuantity", decreaseCartQuantity);
router.delete("/removeCartItem", removeCartItem);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

//admin functionality routes
router.post("/product", upload.array('images'), addProduct);

export default router;
