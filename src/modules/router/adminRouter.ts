import { Router } from "express";
const adminRouter = Router();

//admin functions
import {
  loginAdmin,
  addProduct,
  deleteUser,
  getAllUsers,
  getUserById,
} from "../admin/adminController";

//middlewares
import upload from "../admin/multerMiddleware";
import verifyAdmin from "../user/userAuthentication";

//admin functionalities
adminRouter.post("/login", loginAdmin);

adminRouter.post("/product", verifyAdmin, upload.array("images"), addProduct);
adminRouter.get("/", verifyAdmin, getAllUsers);
adminRouter.get("/:id", verifyAdmin, getUserById);
adminRouter.delete("/:id", verifyAdmin, deleteUser);

export default adminRouter;
