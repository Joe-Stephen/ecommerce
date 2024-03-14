import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import moment from "moment";

//importing services
import { sendMail } from "../services/sendMail";
import  notify  from "../services/notify";

//importing models
import User from "../user/userModel";
import Product from "../product/productModel";
import Image from "../product/imageModel";
import Order from "../order/orderModel";
import OrderProducts from "../order/orderProductsModel";

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
    const user = await User.findOne({ where: { email: email } });
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

//reset password
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body.user;
    const { password } = req.body;
    const user: User | null = await User.findOne({ where: { email: email } });
    if (!user) {
      console.log("No user found with this email!");
      return res
        .status(400)
        .json({ message: "No user found with this email!" });
    }
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.update(
      { password: hashedPassword },
      { where: { email: email } }
    );
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password :", error);
    return res.status(400).json({ message: "Error changing password." });
  }
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
    const existingProduct = await Product.findOne({ where: { name: name } });
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
    const newProduct = await Product.create(formData);

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
    }
    res
      .status(200)
      .json({ message: "Product added successfully", data: newProduct });
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
    const existingProduct = await Product.findOne({
      where: { name: name, id: { [Op.ne]: productId } },
    });
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
    const newProduct = await Product.update(formData, {
      where: { id: productId },
    });

    //clearing existing images
    await Image.destroy({ where: { productId: productId } });

    //uploading image files
    const promises = (req.files as File[] | undefined)?.map(
      async (file: any) => {
        await Image.create({
          productId: productId,
          image: file.originalname,
        });
      }
    );

    if (promises) {
      await Promise.all(promises);
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", data: newProduct });
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
      const user = await User.findByPk(userId as string, {});
      if (user) {
        user.isBlocked = !user.isBlocked;
        await user?.save();
        console.log("User status has been changed successfully.");
        return res
          .status(200)
          .json({ message: "User status has been changed successfully." });
      } else {
        console.error("No user found.");
        res.status(400).send("No user found.");
      }
    } else {
      console.error("Please provide a user id.");
      res.status(400).send("Please provide a user id.");
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Error creating product");
  }
};

//delete an existing user
export const deleteUser: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const deletedUser: User | null = await User.findByPk(id);
  await User.destroy({ where: { id } });
  return res
    .status(200)
    .json({ message: "User deleted successfully.", data: deleteUser });
};

//get all users
export const getAllUsers: RequestHandler = async (req, res, next) => {
  const allUsers: User[] = await User.findAll();
  return res
    .status(200)
    .json({ message: "Fetched all users.", data: allUsers });
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
    const { startDate, endDate } = req.query;
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
    const allOrders: Order[] = await Order.findAll(queryOptions);
    const formattedOrders = allOrders.map((order: any) => {
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
      const order = await Order.findByPk(orderId as string, {
        include: [
          {
            model: OrderProducts,
            as: "orderProducts",
            include: [Product],
          },
        ],
      });
      if (!order) {
        console.log("No order found with this order id.");
        return res
          .status(400)
          .json({ message: "No order found with this order id." });
      }
      //getting user from user model
      const user = await User.findByPk(order?.userId);
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
        order.expectedDeliveryDate = new Date(currDate);
        order.expectedDeliveryDate.setDate(currDate.getDate() + 3);
        await order?.save();
        //creating notification info
        const userId: number = order.userId;
        const label: string = "Order approved!";
        const content: string = `Your order with id:${order.id} has been approved by admin.`;
        //calling notify service
        await notify(userId, label, content);
        //using mail service to notify the user about the status change
        let productInfo: string[] = [];
        order?.dataValues.orderProducts.forEach((item: any) => {
          productInfo.push(`
          Product name: ${item.Product.name} Price: ₹${item.Product.selling_price}
          `);
        });
        const email = user.email;
        const subject = "Order approval notification.";
        const text = `Your order has been approved by admin.
        Order id: ${orderId}
        Order date: ${moment(order.orderDate).format("DD-MM-YYYY")}
        Expected delivery date:${moment(order.expectedDeliveryDate).format(
          "DD-MM-YYYY"
        )}
        products: ${productInfo}
        Total amount: ₹${order.totalAmount}/-`;
        await sendMail(email, subject, text);
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
  const { id } = req.params;
  const user: User | null = await User.findByPk(id);
  return res
    .status(200)
    .json({ message: "User fetched successfully.", data: user });
};
