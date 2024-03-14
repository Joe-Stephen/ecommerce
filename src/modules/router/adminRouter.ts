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
  getAllOrders,
  approveOrder,
  updateProduct
} from "../admin/adminController";

//middlewares
import upload from "../admin/multerMiddleware";
import verifyAdmin from "../admin/adminAuthentication";

//admin functionalities
adminRouter.post("/login", loginAdmin);
adminRouter.post("/product", verifyAdmin, upload.array("images"), addProduct);
adminRouter.post("/updateProduct", verifyAdmin, upload.array("images"), updateProduct);
adminRouter.get("/", verifyAdmin, getAllUsers);
adminRouter.get("/orders", verifyAdmin, getAllOrders);
adminRouter.patch("/approveOrder", approveOrder);
adminRouter.get("/:id", verifyAdmin, getUserById);
adminRouter.patch("/toggleStatus", verifyAdmin, toggleUserAccess);
adminRouter.delete("/:id", verifyAdmin, deleteUser);

export default adminRouter;
