import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../user/userModel";
import Product from "../product/productModel";
import Image from "../product/imageModel";

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

//creating new product
export const addProduct: RequestHandler = async (req, res, next) => {
  try {
    console.log("data in body :", req.body);
    console.log("files in upload :", req.files);
    const {name, brand, description, category, regular_price, selling_price}=req.body;

    if(!name || !brand || !description || !category || !regular_price || !selling_price){
      console.log("Please provide all the details.");
      return res.status(400).json({ message: "Please provide all the details." });      
    }



    //creating new product
    const newProduct = await Product.create({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      category: req.body.category,
      regular_price: req.body.regular_price,
      selling_price: req.body.selling_price,
    });

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
