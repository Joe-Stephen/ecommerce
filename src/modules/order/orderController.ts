import { RequestHandler, Request } from "express";
import moment from "moment";
import { Op } from "sequelize";

//model imports
import User from "../user/userModel";
import Product from "../product/productModel";
import Cart from "../cart/cartModel";
import Order from "./orderModel";
import OrderProducts from "./orderProductsModel";
import Cancel from "./cancelOrderModel";

export const checkOut: RequestHandler = async (req, res, next) => {
  try {
    const date = moment();
    console.log("date test i ", date.format("dddd"));
    const day = date.format("dddd");
    //checking if the order date is on weekends
    if (day === "Saturday" || day === "Sunday") {
      console.log("Cannot place an order on weekends.");
      return res
        .status(400)
        .json({ message: "Cannot place an order on weekends." });
    }
    const loggedInUser = req.body.user;
    if (!loggedInUser) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    const user = await User.findOne({ where: { email: loggedInUser.email } });
    if (!user) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    const pendingOrder = await Order.findAll({
      where: { userId: user.id, orderStatus: "To be approved" },
    });
    if (pendingOrder.length > 0) {
      console.log("This user has a pending approval.");
      return res.status(400).json({
        message:
          "Couldn't checkout products as you already have a pending approval.",
      });
    }
    const userWithCart = await User.findByPk(user.id, {
      include: [
        {
          model: Cart,
          include: [Product],
        },
      ],
    });
    const productsInCart = userWithCart?.dataValues.Cart.dataValues.Products;
    const productArray = productsInCart.map(
      (product: any) => product.dataValues
    );
    const orderProducts: number[] = [];
    let grandTotal: number = 0;
    productArray.forEach((product: any) => {
      product.subTotal =
        product.selling_price * product.CartProducts.dataValues.quantity;
      grandTotal += product.subTotal;
      orderProducts.push(product.id);
    });
    const orderObject: any = await Order.create({
      userId: user.id,
      totalAmount: grandTotal,
    });
    const promises = productArray.map(async (product: any) => {
      await OrderProducts.create({
        orderId: orderObject.id,
        productId: product.id,
        price: product.selling_price,
        quantity: product.CartProducts.dataValues.quantity,
      });
    });
    if (promises) {
      await Promise.all(promises);
      //removing user cart
      // await Cart.destroy({where:{userId:user.id }});
      return res.status(200).json({
        message: "Order has been placed.",
        data: orderObject,
      });
    }
  } catch (error) {
    console.error("Error in checkout function :", error);
    return res.status(400).json({ message: "Couldn't checkout products." });
  }
};

export const cancelOrder: RequestHandler = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      console.log("No order id found in query.");
      res.status(400).json({ message: "Please provide an order id." });
    }
    const { reason } = req.body;
    if (!reason) {
      console.log("No reason provided.");
      res.status(400).json({ message: "Please provide your reason." });
    }
    const cancelRequest = await Cancel.create({
      orderId: orderId,
      reason: reason,
    });
    console.log("Cancel request has been submitted.");
    return res.status(200).json({
      message: "Cancel request has been submitted.",
    });
  } catch (error) {
    console.error("An error happened in the cancelOrder function :", error);
    res
      .status(500)
      .json({ message: "Internal server error while cancelling the order." });
  }
};
