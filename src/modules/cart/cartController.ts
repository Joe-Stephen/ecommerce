import { RequestHandler, Request } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//model imports
import User from "../user/userModel";
import Image from "../product/imageModel";
import Product from "../product/productModel";
import Cart from "../cart/cartModel";
import CartProducts from "../cart/cartProductsModel";

export const getUserCart: RequestHandler = async (req, res, next) => {
  try {
    const userWithCart = await User.findByPk(1, {
      include: [
        {
          model: Cart,
          include: [Product],
        },
      ],
    });
    const productsInCart = userWithCart?.dataValues.Cart.dataValues.Products;
    console.log("The products in cart object :", productsInCart);
    const productArray = productsInCart.map(
      (product: any) => product.dataValues
    );
    let grandTotal: number = 0;
    productArray.forEach((product: any) => {
      product.subTotal =
        product.selling_price * product.CartProducts.dataValues.quantity;
      grandTotal += product.subTotal;
    });
    return res.status(200).json({
      message: "Product has been added to cart.",
      cartProducts: userWithCart?.dataValues.Cart.dataValues.Products,
      cartGrandTotal: grandTotal,
    });
  } catch (error) {
    console.error("Error in finding all products function :", error);
    return res.status(400).json({ message: "Couldn't load all products." });
  }
};

export const addToCart: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.body);

    let userCart = await Cart.findOne({ where: { userId: 1 } });
    if (!userCart) {
      userCart = await Cart.create({
        userId: 1,
      });
      await CartProducts.create({
        cartId: userCart.id,
        productId: 3,
        quantity: 1,
      });
      console.log("Product has been added to cart.");
      return res
        .status(200)
        .json({ message: "Product has been added to cart." });
    } else {
      const existingProduct = await CartProducts.findOne({
        where: { cartId: 1, productId: 3 },
      });
      if (!existingProduct) {
        CartProducts.create({ cartId: 1, productId: 3, quantity: 1 });
        console.log("Product has been added to cart.");
        return res
          .status(200)
          .json({ message: "Product has been added to cart." });
      } else {
        existingProduct.quantity += 1;
        await existingProduct.save();
        console.log("Product has been added to cart.");
        return res
          .status(200)
          .json({ message: "Product has been added to cart." });
      }
    }
  } catch (error) {
    console.error("Error in user add to cart function :", error);
    return res.status(400).json({ message: "Couldn't add to cart." });
  }
};

export const decreaseCartQuantity: RequestHandler = async (req, res, next) => {
  try {
    let userCart = await Cart.findOne({ where: { userId: 1 } });
    if (!userCart) {
      console.log("No cart found.");
      return res.status(400).json({ message: "No cart found." });
    } else {
      const existingProduct = await CartProducts.findOne({
        where: { cartId: 3, productId: 5 },
      });
      if (!existingProduct) {
        console.log("This product is not in the cart.");
        return res
          .status(400)
          .json({ message: "This product is not in the cart." });
      } else if (existingProduct.quantity > 1) {
        existingProduct.quantity -= 1;
        await existingProduct.save();
        console.log("Product quantity has been reduced.");
        return res
          .status(200)
          .json({ message: "Product has been added to cart." });
      } else if (existingProduct.quantity === 1) {
        await CartProducts.destroy({ where: { cartId: 3, productId: 5 } });
        console.log("Product has been removed.");
        return res.status(200).json({ message: "Product has been removed." });
      }
    }
  } catch (error) {
    console.error("Error in user decreaseCartQuantity function :", error);
    return res.status(400).json({ message: "Couldn't decreaseCartQuantity." });
  }
};

export const increaseCartQuantity: RequestHandler = async (req, res, next) => {
  try {
    let userCart = await Cart.findOne({ where: { userId: 1 } });
    if (!userCart) {
      console.log("No cart found.");
      return res.status(400).json({ message: "No cart found." });
    } else {
      const existingProduct = await CartProducts.findOne({
        where: { cartId: 3, productId: 5 },
      });
      if (!existingProduct) {
        console.log("This product is not in the cart.");
        return res
          .status(400)
          .json({ message: "This product is not in the cart." });
      } else if (existingProduct) {
        existingProduct.quantity += 1;
        await existingProduct.save();
        console.log("Product quantity has been increased.");
        return res
          .status(200)
          .json({ message: "Product quantity has been increased." });
      }
    }
  } catch (error) {
    console.error("Error in user increaseCartQuantity function :", error);
    return res.status(400).json({ message: "Couldn't increaseCartQuantity." });
  }
};

export const removeCartItem: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.body);
    let userCart = await Cart.findOne({ where: { userId: 1 } });
    if (!userCart) {
      console.log("No cart found.");
      return res.status(400).json({ message: "No cart found." });
    } else {
      const existingProduct = await CartProducts.findOne({
        where: { cartId: 1, productId: 3 },
      });
      if (!existingProduct) {
        console.log("This product is not in the cart.");
        return res
          .status(400)
          .json({ message: "This product is not in the cart." });
      } else if (existingProduct) {
        await CartProducts.destroy({ where: { cartId: 1, productId: 3 } });
        console.log("Product has been removed.");
        return res.status(200).json({ message: "Product has been removed." });
      }
    }
  } catch (error) {
    console.error("Error in user remove cart item function :", error);
    return res.status(400).json({ message: "Couldn't remove cart item." });
  }
};
