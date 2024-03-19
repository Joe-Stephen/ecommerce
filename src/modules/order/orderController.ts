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
import CartProducts from "../cart/cartProductsModel";

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
    if (!userWithCart) {
      console.log("No user with cart found.");
      return res.status(400).json({ message: "No user with cart found." });
    }
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
      await Cart.destroy({ where: { userId: user.id } });
      //removing cart products
      await CartProducts.destroy({ where: { cartId: userWithCart.id } });
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
      return res.status(400).json({ message: "Please provide an order id." });
    }
    const { reason } = req.body;
    if (!reason) {
      console.log("No reason provided.");
      return res.status(400).json({ message: "Please provide your reason." });
    } else {
      const order = await Order.findOne({ where: { id: orderId } });
      if (!order) {
        console.log("There is no order with this id.");
        return res
          .status(400)
          .json({ message: "There is no order with this id." });
      }
      if (order?.orderStatus === "To be approved") {
        const cancelRequest = await Cancel.create({
          orderId: orderId,
          reason: reason,
        });
        order.orderStatus = "Cancelled";
        await order.save();
        console.log("Cancel request has been submitted.");
        //restoring cart
        console.log("the order :", order);
        const orderProducts: any = await OrderProducts.findAll({
          where: { orderId: order.id },
        });
        if (!orderProducts) {
          console.log("No order products found in the order.");
          return res
            .status(400)
            .json({ message: "No order products found in the order." });
        }
        console.log("the order products is :", orderProducts);
        const userCart = await Cart.create({ userId: order.userId });
        //adding products back to cart
        const promises = orderProducts.map(async (product: any) => {
          await CartProducts.create({
            cartId: userCart.id,
            productId: product.productId,
            quantity: product.quantity,
          });
        });
        if (promises) {
          await Promise.all(promises);
          console.log("Cart has been restored.");
          return res.status(200).json({
            message: "Cancel request has been submitted.",
          });
        } else {
          console.log("Unexpected error happened in cancel order function.");
          return res.status(500).json({
            message: "Unexpected error happened while cancelling the order.",
          });
        }
      } else if (order?.orderStatus === "Cancelled") {
        console.log("This order is already cancelled.");
        return res
          .status(400)
          .json({ message: "This order is already cancelled." });
      } else {
        console.log(
          "This order is already approved by admin, cannot be cancelled."
        );
        return res.status(400).json({
          message:
            "This order is already approved by admin, cannot be cancelled.",
        });
      }
    }
  } catch (error) {
    console.error("An error happened in the cancelOrder function :", error);
    return res
      .status(500)
      .json({ message: "Internal server error while cancelling the order." });
  }
};

export const editOrder: RequestHandler = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { productIds, action } = req.body;

    if (!orderId || !productIds || !action) {
      console.log("No order/productId/quantity provided in the req.query.");
      return res
      .status(400)
      .json({ message: "Please provide all the details." });
    }
    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) {
      console.log("No order found with this id.");
      return res.status(400).json({ message: "No order found with this id." });
    }

    if (order.orderStatus !== "To be approved") {
      console.log("This order cannot be edited.");
      return res.status(400).json({ message: "This order cannot be edited." });
    } else {
      let amount: number = 0;
      const products = await Product.findAll({ where: { id: productIds } });
      if (action === "add") {
        if (!products || products.length === 0) {
          console.log("No products specified for addition.");
          return res
            .status(400)
            .json({ message: "Please specify products for addition." });
        }
        const promises: any[] = products.map(async (product: any) => {
          amount += product.selling_price;
          const existingProduct = await OrderProducts.findOne({
            where: { productId: product.id, orderId: orderId },
          });
          if (existingProduct) {
            await OrderProducts.update(
              { quantity: existingProduct.quantity + 1 },
              { where: { id: existingProduct.id } }
            );
          } else {
            await OrderProducts.create({
              orderId: orderId,
              productId: product.id,
              price: product.selling_price,
              quantity: 1,
            });
          }
        });
        await Promise.all(promises);
        console.log("New products has been added to order products.");
        order.totalAmount += amount;
        await order.save();
        console.log("Order total amount has been updated.");
        console.log("Order has been edited.");
        return res.status(200).json({
          message: "Order has been edited.",
        });
      } else if (action === "remove") {
        if (!products || products.length === 0) {
          console.log("No products specified for removal.");
          return res
            .status(400)
            .json({ message: "Please specify products for removal." });
        }
        const promises: any[] = products.map(async (product: any) => {
          const existingProduct = await OrderProducts.findOne({
            where: { productId: product.id, orderId: orderId },
          });
          if (existingProduct) {
            amount = amount + existingProduct.price;
            if (existingProduct.quantity > 1) {
              existingProduct.quantity -= 1;
              await existingProduct.save();
            } else {
              await OrderProducts.destroy({
                where: { id: existingProduct.id },
              });
            }
          } else {
            console.log(`${product.name} is not in the order.`);
          }
        });
        await Promise.all(promises);
        console.log("The products has been removed from the order.");
        order.totalAmount -= amount;
        await order.save();
        console.log("Order total amount has been updated.");
        console.log("Order has been edited.");
        return res.status(200).json({
          message: "Order has been edited.",
        });
      }
    }
  } catch (error) {
    console.error("An error in edit order function :", error);
    return res.status(500).json({ message: "Couldn't edit the order." });
  }
};

// export const editOrder: RequestHandler = async (req, res, next) => {
//   try {
//     const { orderId } = req.query;
//     const { productIds, action } = req.body;

//     if (!orderId || !productIds || !action) {
//       console.log("No order/productId/action provided in the request.");
//       return res
//         .status(400)
//         .json({ message: "Please provide all the details." });
//     }

//     const order = await Order.findOne({ where: { id: orderId } });
//     if (!order) {
//       console.log("No order found with this id.");
//       return res.status(400).json({ message: "No order found with this id." });
//     }

//     if (order.orderStatus !== "To be approved") {
//       console.log("This order cannot be edited.");
//       return res.status(400).json({ message: "This order cannot be edited." });
//     }

//     let amount: number = 0;
//     const products = await Product.findAll({ where: { id: productIds } });
//     if (!products || products.length === 0) {
//       console.log("No products specified for action.");
//       return res.status(400).json({ message: "Please specify products." });
//     }

//     const promises: Promise<any>[] = products.map(async (product: any) => {
//       const existingProduct = await OrderProducts.findOne({
//         where: { productId: product.id, orderId: orderId },
//       });

//       if (action === "add") {
//         amount += product.selling_price;
//         if (existingProduct) {
//           await OrderProducts.update(
//             { quantity: existingProduct.quantity + 1 },
//             { where: { id: existingProduct.id } }
//           );
//         } else {
//           await OrderProducts.create({
//             orderId: orderId,
//             productId: product.id,
//             price: product.selling_price,
//             quantity: 1,
//           });
//         }
//       } else if (action === "remove") {
//         if (existingProduct) {
//           amount += existingProduct.price;
//           if (existingProduct.quantity > 1) {
//             existingProduct.quantity -= 1;
//             await existingProduct.save();
//           } else {
//             await OrderProducts.destroy({
//               where: { id: existingProduct.id },
//             });
//           }
//         } else {
//           console.log(`${product.name} is not in the order.`);
//         }
//       }
//     });

//     await Promise.all(promises);

//     if (action === "add") {
//       order.totalAmount += amount;
//     } else if (action === "remove") {
//       order.totalAmount -= amount;
//     }

//     await order.save();
//     console.log("Order has been edited.");
//     return res.status(200).json({ message: "Order has been edited." });
//   } catch (error) {
//     console.error("An error occurred in editOrder function:", error);
//     return res.status(500).json({ message: "Couldn't edit the order." });
//   }
// };
