import { Router } from "express";
const router = Router();

//user functions
import {
  createUser,
  loginUser,
  resetPassword,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
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
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

//admin functionality routes
router.post("/product", upload.array('images'), addProduct);

export default router;
