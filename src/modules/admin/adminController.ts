import { io } from "../../index";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import moment from "moment";

//importing services
import { sendMail } from "../services/sendMail";
import { notify, notifyAll, notifySelected } from "../services/notify";

//importing models
import User from "../user/userModel";
import Product from "../product/productModel";
import Image from "../product/imageModel";
import Order from "../order/orderModel";
import OrderProducts from "../order/orderProductsModel";

//importing DB queries
import DBQueries from "../services/dbQueries";
const dbQueries = new DBQueries();

//admin login
export const loginAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Please provide all the details.");
      return res
        .status(400)
        .json({ message: "Please provide all the details." });
    }
    const user: User | null | undefined = await dbQueries.findUserByEmail(
      email
    );
    if (!user) {
      console.log("No admin found with this email!");
      return res
        .status(400)
        .json({ message: "No admin found with this email!" });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const loggedInUser = {
        id: user.id,
        name: user.username,
        email: user.email,
        token: generateToken(user.email),
      };
      console.log("Logged in as admin.");
      return res
        .status(201)
        .json({ message: "Logged in as admin.", data: loggedInUser });
    } else {
      console.log("Incorrect password.");
      return res.status(201).json({ message: "Incorrect password.l" });
    }
  } catch (error) {
    console.error("Error in login function :", error);
    return res.status(400).json({ message: "Login unsuccessfull." });
  }
};

//JWT generator function
const generateToken = (email: string) => {
  return jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

//creating new product
export const addProduct: RequestHandler = async (req, res, next) => {
  try {
    const { name, brand, description, category, regular_price, selling_price } =
      req.body;

    if (
      !name ||
      !brand ||
      !description ||
      !category ||
      !regular_price ||
      !selling_price
    ) {
      console.log("Please provide all the details.");
      return res
        .status(400)
        .json({ message: "Please provide all the details." });
    }
    const formData = {
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      category: category.trim(),
      regular_price: parseInt(regular_price),
      selling_price: parseInt(selling_price),
    };
    //name validation rules
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    if (!nameRegex.test(formData.name)) {
      return res.status(400).json({ message: "Invalid name." });
    }
    const existingProduct: Product | null | undefined =
      await dbQueries.findProductByName(name);
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "A product with this name already exists." });
    }
    //price validations
    if (formData.selling_price > formData.regular_price) {
      return res.status(400).json({
        message: "Selling price shouldn't be greater than regular price.",
      });
    }
    //creating new product
    const newProduct: Product | null | undefined =
      await dbQueries.createProduct(formData);
    if (!newProduct) {
      console.log("An error happened while creating new product.");
      return res.status(500).json({
        message: "An error happened while creating new product.",
      });
    }
    //uploading image files
    const promises = (req.files as File[] | undefined)?.map(
      async (file: any) => {
        await Image.create({
          productId: newProduct.id,
          image: file.originalname,
        });
      }
    );

    if (promises) {
      await Promise.all(promises);
      res
        .status(200)
        .json({ message: "Product added successfully", data: newProduct });
    } else {
      console.log(
        "An error happened while creating the product: promises is null"
      );
      res.status(500).send("An error happened while creating the product.");
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Error creating product");
  }
};

//updating a product
export const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      console.log("Please provide the productId.");
      return res.status(400).json({ message: "Please provide the productId." });
    }
    const { name, brand, description, category, regular_price, selling_price } =
      req.body;
    if (
      !name ||
      !brand ||
      !description ||
      !category ||
      !regular_price ||
      !selling_price
    ) {
      console.log("Please provide all the details.");
      return res
        .status(400)
        .json({ message: "Please provide all the details." });
    }
    const formData = {
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      category: category.trim(),
      regular_price: parseInt(regular_price),
      selling_price: parseInt(selling_price),
    };
    //name validation rules
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    if (!nameRegex.test(formData.name)) {
      return res.status(400).json({ message: "Invalid name." });
    }
    if (typeof productId === "string") {
      const existingProduct: Product | null | undefined =
        await dbQueries.checkForDuplicateProduct(
          formData.name,
          parseInt(productId, 10)
        );
      if (existingProduct) {
        return res
          .status(400)
          .json({ message: "A product with this name already exists." });
      }
      //price validations
      if (formData.selling_price > formData.regular_price) {
        return res.status(400).json({
          message: "Selling price shouldn't be greater than regular price.",
        });
      }
      //updating the product
      const newProduct = dbQueries.updateProduct(
        formData,
        parseInt(productId, 10)
      );
      //clearing existing images
      const result: boolean = await dbQueries.clearExistingImages(
        parseInt(productId, 10)
      );
      if (!result) {
        console.log("An error happened while clearing old product images.");
        return res.status(400).json({
          message: "An error happened while clearing old product images.",
        });
      }
      //uploading image files
      const promises = (req.files as File[] | undefined)?.map(
        async (file: any) => {
          await dbQueries.saveProductImages(parseInt(productId, 10), file);
        }
      );
      if (promises) {
        await Promise.all(promises);
      }
      res
        .status(200)
        .json({ message: "Product updated successfully", data: newProduct });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
};

//toggling the user access status (block/unblock)
export const toggleUserAccess: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (userId) {
      if (typeof userId === "string") {
        const user: User | null | undefined = await dbQueries.findUserById(
          parseInt(userId, 10)
        );
        if (user) {
          user.isBlocked = !user.isBlocked;
          await user?.save();
          console.log("User status has been changed successfully.");
          return res
            .status(200)
            .json({ message: "User status has been changed successfully." });
        } else {
          console.error("No user found.");
          return res.status(400).send("No user found.");
        }
      }
    } else {
      console.error("Please provide a user id.");
      return res.status(400).send("Please provide a user id.");
    }
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).send("Error toggling user status.");
  }
};

//delete an existing user
export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      console.log("No user id received in params.");
      return res.status(400).json({ message: "Please provide a user id." });
    }
    if (typeof id === "string") {
      const userToDelete: User | null | undefined =
        await dbQueries.findUserById(parseInt(id, 10));
      if (!userToDelete) {
        console.error("No user found with this id.");
        return res.status(400).send("No user found with this id.");
      }
      const result: boolean = await dbQueries.deleteUserById(parseInt(id, 10));
      if (!result) {
        console.log("An error happened while deleting the user.");
        return res
          .status(500)
          .json({ message: "An error happened while deleting the user." });
      }
      console.log("User deleted successfully.");
      return res
        .status(200)
        .json({ message: "User deleted successfully.", data: deleteUser });
    }
  } catch (error) {
    console.error("Error deleting user :", error);
    return res.status(500).send("Error deleting user.");
  }
};

//get all users
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const allUsers: User[] | [] | undefined = await dbQueries.findAllUsers();
    if (!allUsers || allUsers.length === 0) {
      console.log("No users found.");
      return res.status(500).json({ message: "No users found." });
    }
    return res
      .status(200)
      .json({ message: "Fetched all users.", data: allUsers });
  } catch (error) {
    console.error("Error fetching all users :", error);
    return res.status(500).send("Error fetching all users.");
  }
};

//get all orders
export const getAllOrders: RequestHandler = async (req, res, next) => {
  try {
    let queryOptions: any = {
      include: [
        {
          model: OrderProducts,
          as: "orderProducts",
        },
      ],
      order: [["orderDate", "ASC"]],
    };
    let { startDate, endDate, today } = req.query;
    if (today) {
      const currDate = new Date();
      const start = currDate.setDate(currDate.getDate() - 1);
      const end = currDate.setDate(currDate.getDate() + 1);
      queryOptions.where = {
        orderDate: {
          [Op.between]: [start, end],
        },
      };
    }
    if (startDate && endDate) {
      queryOptions.where = {
        orderDate: {
          [Op.between]: [startDate, endDate],
        },
      };
    } else if (startDate && !endDate) {
      queryOptions.where = {
        orderDate: {
          [Op.gte]: startDate,
        },
      };
    } else if (!startDate && endDate) {
      queryOptions.where = {
        orderDate: {
          [Op.lte]: endDate,
        },
      };
    }
    const allOrders: Order[] | [] | undefined =
      await dbQueries.findAllOrdersWithOptions(queryOptions);
    if (!allOrders || allOrders.length === 0) {
      console.log("No orders found.");
      return res.status(400).json({ message: "No orders found." });
    }
    const formattedOrders: Object[] = allOrders.map((order: any) => {
      return { ...order.toJSON() };
    });
    formattedOrders.forEach((order: any) => {
      order.orderDate = moment(order.orderDate).format("YYYY-MM-DD");
      order.createdAt = moment(order.createdAt).format("YYYY-MM-DD");
      order.updatedAt = moment(order.updatedAt).format("YYYY-MM-DD");
      order.orderProducts.forEach((product: any) => {
        product.createdAt = moment(product.createdAt).format("YYYY-MM-DD");
        product.updatedAt = moment(product.updatedAt).format("YYYY-MM-DD");
      });
    });
    return res
      .status(200)
      .json({ message: "Fetched all orders.", data: formattedOrders });
  } catch (error) {
    console.error("Error fetching all orders. :", error);
    res.status(500).send("Error fetching all orders. ");
  }
};

//approving an order
export const approveOrder: RequestHandler = async (req, res, next) => {
  try {
    //getting user id from request query
    const { orderId } = req.query;
    if (orderId) {
      if (typeof orderId === "string") {
        const order = await dbQueries.findOrderById(parseInt(orderId, 10));
        if (!order) {
          console.log("No order found with this order id.");
          return res
            .status(400)
            .json({ message: "No order found with this order id." });
        }
        //getting user from user model
        const user = await dbQueries.findUserById(order.userId);
        if (!user) {
          console.log("No user found. User is not logged in.");
          return res
            .status(400)
            .json({ message: "No user found. User is not logged in." });
        }
        //checking if the order is not null and order status is not approved already
        if (order && order.orderStatus === "To be approved") {
          //if yes, changing the status to "Approved"
          order.orderStatus = "Approved";

          const currDate = new Date();
          const today = moment();
          const targetDate = moment(today.add(3, "days"));
          order.expectedDeliveryDate = new Date(currDate);
          let duration: number = 3;
          if (
            targetDate.format("dddd") === "Saturday" ||
            targetDate.format("dddd") === "Sunday"
          ) {
            order.expectedDeliveryDate.setDate(currDate.getDate() + 5);
            duration = 5;
          } else {
            order.expectedDeliveryDate.setDate(currDate.getDate() + 3);
          }
          await order?.save();
          //creating notification info
          const userId: number = order.userId;
          const label: string = "Order approved!";
          const content: string = `Your order with id:${order.id} has been approved by admin.`;
          //calling notify service
          await notify(userId, label, content);
          //sending notification to user via socket.io connection
          io.emit("notifyClient", label+" "+content);
          //using mail service to notify the user about the status change
          let productInfo: string = "";
          order?.dataValues.orderProducts.forEach((item: any) => {
            productInfo += `<li class="product">${item.Product.name} Price: ₹${item.Product.selling_price}</li>`;
          });
          const email = user.email;
          const subject = "Order approval notification.";
          const text = `Your order has been approved by admin.`;
          const html = `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Details</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #007bff;
                text-align: center;
              }
              .order-details {
                margin-bottom: 20px;
              }
              .products {
                margin-left: 20px;
              }
              .product {
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Your Order Details</h1>
              <div class="order-details">
                <p><strong>Your order has been approved by admin.</strong></p>
                <p><strong>Order id:</strong> ${order.id}</p>
                <p><strong>Order date:</strong> ${moment(
                  order.orderDate
                ).format("DD-MM-YYYY")}</p>
                <p><strong>Expected delivery date:</strong> ${moment(
                  order.expectedDeliveryDate
                ).format("DD-MM-YYYY")}</p>
                <p><strong>Expected delivery duration:</strong> ${duration} days</p>
                <p><strong>Products:</strong></p>
                <ul class="products">${productInfo}</ul>
                <p><strong>Total amount:</strong> ₹${order.totalAmount}/-</p>
              </div>
            </div>
          </body>
          </html>
          `;
          await sendMail(email, subject, text, html);
          console.log("Order has been approved successfully.");
          return res
            .status(200)
            .json({ message: "Order has been approved successfully." });
        } else if (order && order.orderStatus !== "To be approved") {
          console.log("This order is already approved.");
          res.status(400).send("This order is already approved.");
        } else {
          console.log("No order found.");
          res.status(400).send("No order found.");
        }
      }
    } else {
      console.error("Please provide an order id.");
      res.status(400).send("Please provide an order id.");
    }
  } catch (error) {
    console.error("Error approving the order :", error);
    res.status(500).send("Error approving the order");
  }
};

//get user by id
export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      console.log("No user id received in params.");
      return res.status(400).json({ message: "Please provide a user id." });
    }
    if (typeof id === "string") {
      const userToDelete: User | null | undefined =
        await dbQueries.findUserById(parseInt(id, 10));
      const user: User | null | undefined = await dbQueries.findUserById(
        parseInt(id, 10)
      );
      return res
        .status(200)
        .json({ message: "User fetched successfully.", data: user });
    }
  } catch (error) {
    console.error("Error in getUserById function.", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const notifyUser: RequestHandler = async (req, res, next) => {
  try {
    const { label, content } = req.body;
    if (!label || !content) {
      console.log("No label or content found in the request body.");
      return res.status(400).json({ message: "Please provide all the fields." });
    }
    await dbQueries.createNotificationForOne(2, label, content);
    io.emit("notifyClient", label+" "+content);

    console.log("The user has been notified.");
    return res.status(200).json({ message: "The user has been notified." });
  } catch (error) {
    console.error("Error in notifyUser function:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const notifyAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const { label, content } = req.body;
    if (!label || !content) {
      console.log("No label or content found in the request body.");
      res.status(400).json({ message: "Please provide all the fields." });
    }
    await notifyAll(label, content);
    console.log("All users have been notified.");
    res.status(200).json({ message: "All users have been notified." });
  } catch (error) {
    console.error("Error in notifyAllUsers function.", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const notifySelectedUsers: RequestHandler = async (req, res, next) => {
  try {
    const { ids, label, content } = req.body;
    if (!ids || !label || !content) {
      console.log("No label or content or ids found in the request body.");
      res.status(400).json({ message: "Please fill all the fields." });
    }
    await notifySelected(ids, label, content);
    console.log("Selected users have been notified.");
    res.status(200).json({ message: "Selected users have been notified." });
  } catch (error) {
    console.error("Error in notifySelectedUsers function.", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
