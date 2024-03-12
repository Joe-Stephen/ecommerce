import { RequestHandler, Request } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//model imports
import User from "../user/userModel";
import Product from "../product/productModel";
import Cart from "../cart/cartModel";
import Order from "./orderModel";
import OrderProducts from "./orderProductsModel";

export const checkOut: RequestHandler = async (req, res, next) => {
  try {
    const pendingOrder= await Order.findAll({where:{userId:1, orderStatus:"Pending"}});    
    if(pendingOrder.length>0){
      console.log("This user has a pending order.");
      return res.status(400).json({ message: "Couldn't checkout products as you already have a pending order." });      
    }
    const userWithCart = await User.findByPk(1, {
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
      userId: 1,
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
      // await Cart.destroy({where:{userId:1}});
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


