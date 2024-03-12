import { Router } from "express";
const adminRouter = Router();

//admin functions
import {
  loginAdmin,
  addProduct,
  deleteUser,
  getAllUsers,
  getUserById,
  toggleUserAccess,
} from "../admin/adminController";

//middlewares
import upload from "../admin/multerMiddleware";
import verifyAdmin from "../user/userAuthentication";

//admin functionalities
adminRouter.post("/login", verifyAdmin, loginAdmin);

adminRouter.post("/product", verifyAdmin, upload.array("images"), addProduct);
adminRouter.get("/", verifyAdmin, getAllUsers);
adminRouter.get("/:id", verifyAdmin, getUserById);
adminRouter.patch("/toggleStatus", toggleUserAccess);
adminRouter.delete("/:id", verifyAdmin, deleteUser);

export default adminRouter;
