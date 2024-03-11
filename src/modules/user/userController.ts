import { RequestHandler } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../user/userModel";
import Image from "../product/imageModel";
import Product from "../product/productModel";
import Cart from "../cart/cartModel";
import CartProducts from "../cart/cartProductsModel";

export const createUser: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("Please provide all the details.");
    return res.status(400).json({ message: "Please provide all the details." });
  }
  //checking for existing user
  const existingUser = await User.findOne({ where: { email: email } });
  if (existingUser) {
    console.log("This email is already registered.");
    return res
      .status(400)
      .json({ message: "This email is already registered." });
  }

  //hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //user creation
  const user: User | null = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  return res
    .status(200)
    .json({ message: "User created successfully", data: user });
};

export const loginUser: RequestHandler = async (req, res, next) => {
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
      console.log("No user found with this email!");
      return res
        .status(400)
        .json({ message: "No user found with this email!" });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const loggedInUser = {
        id: user.id,
        name: user.username,
        email: user.email,
        token: generateToken(user.email),
      };
      console.log("User logged in successfully");
      return res
        .status(201)
        .json({ message: "Login successfull", data: loggedInUser });
    } else {
      console.log("Incorrect password.");
      return res.status(201).json({ message: "Incorrect password.l" });
    }
  } catch (error) {
    console.error("Error in login function :", error);
    return res.status(400).json({ message: "Login unsuccessfull." });
  }
};

export const getAllProducts: RequestHandler = async (req, res, next) => {
  try {
    //pagination config
    const page: any = req.query.page;
    const count: number = 5;
    const skip: number = (parseInt(page) - 1) * count;
    //finding all products
    const products = await Product.findAll({
      limit: count,
      offset: skip,
      where: { isBlocked: false },
      include: [{ model: Image, attributes: ["image"] }],
    });
    //formatting images array
    const allProducts = products.map((product: any) => {
      const imageNames = product.Images.map((image: any) => image.image);
      return { ...product.toJSON(), Images: imageNames }; // Replace Images with imageUrls
    });
    return res
      .status(200)
      .json({ message: "Products fetched successfully.", data: allProducts });
  } catch (error) {
    console.error("Error in finding all products function :", error);
    return res.status(400).json({ message: "Couldn't load all products." });
  }
};

export const searchProducts: RequestHandler = async (req, res, next) => {
  try {
    //pagination config
    const searchKey: any = req.query.searchKey;

    //search all products
    const products = await Product.findAll({
      where: { isBlocked: false, name: { [Op.like]: `%${searchKey}%` } },
      include: [{ model: Image, attributes: ["image"] }],
    });
    //formatting images array
    const allProducts = products.map((product: any) => {
      const imageNames = product.Images.map((image: any) => image.image);
      return { ...product.toJSON(), Images: imageNames }; // Replace Images with imageUrls
    });
    return res
      .status(200)
      .json({ message: "Products fetched successfully.", data: allProducts });
  } catch (error) {
    console.error("Error in finding all products function :", error);
    return res.status(400).json({ message: "Couldn't load all products." });
  }
};

export const sortProducts: RequestHandler = async (req, res, next) => {
  try {
    const sortType: any = req.query.sortType;
    //search all products
    let products: any;
    if (sortType === "highToLow") {
      products = await Product.findAll({
        where: { isBlocked: false },
        order: [["selling_price", "DESC"]],
        include: [{ model: Image, attributes: ["image"] }],
      });
    } else if (sortType === "lowToHigh") {
      products = await Product.findAll({
        where: { isBlocked: false },
        order: [["selling_price", "ASC"]],
        include: [{ model: Image, attributes: ["image"] }],
      });
    }else{
      console.log("The required sort type is not defined.");
      return res.status(400).json({ message: "The required sort type is not defined." });
    }
    //formatting images array
    const allProducts = products.map((product: any) => {
      const imageNames = product.Images.map((image: any) => image.image);
      return { ...product.toJSON(), Images: imageNames };
    });
    return res
      .status(200)
      .json({ message: "Sort applied successfully.", data: allProducts });
  } catch (error) {
    console.error("Couldn't sort the products.", error);
    return res.status(400).json({ message: "Couldn't sort the products." });
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
    console.log(req.body);
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

//JWT generator function
const generateToken = (email: string) => {
  return jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

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

export const addProduct: RequestHandler = async (req, res, next) => {
  try {
    console.log("body in upload :", req.files);

    const promises = (req.files as File[] | undefined)?.map(
      async (file: any) => {
        await Image.create({
          postId: req.body.postId,
          image: file.originalname,
        });
      }
    );

    if (promises) {
      await Promise.all(promises);
    }
    res.status(200).send("Images uploaded successfully");
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).send("Error uploading images");
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const deletedUser: User | null = await User.findByPk(id);
  await User.destroy({ where: { id } });
  return res
    .status(200)
    .json({ message: "User deleted successfully.", data: deleteUser });
};

export const getAllUsers: RequestHandler = async (req, res, next) => {
  const allUsers: User[] = await User.findAll();
  return res
    .status(200)
    .json({ message: "Fetched all users.", data: allUsers });
};

export const getUserById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const user: User | null = await User.findByPk(id);
  return res
    .status(200)
    .json({ message: "User fetched successfully.", data: user });
};

export const updateUser: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  await User.update({ ...req.body }, { where: { id } });
  const updatedUser: User | null = await User.findByPk(id);
  return res
    .status(200)
    .json({ message: "User updated successfully.", data: updateUser });
};
