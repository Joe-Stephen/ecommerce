import { RequestHandler } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtp } from "../services/sendOtp";

//model imports
import User from "../user/userModel";
import Image from "../product/imageModel";
import Product from "../product/productModel";
import Verifications from "./verificationsModel";

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

//@desc sending otp for email verification
//@route POST /sendOtp
//@access Public
export const sendVerifyMail: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json("Please enter your email.");
    }
    console.log(`Received email= ${email}`);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("This email is already registered!");
      return res
        .status(400)
        .json({ message: "This email is already registered!" });
    } else {
      //sending otp
      await sendOtp(email);
      console.log(`Otp has been sent to ${email}.`);
      return res.status(201).json("Otp has been sent to your email address.");
    }
  } catch (error) {
    console.error("Error in sendOtp function :", error);
    return res.status(500).json("Unexpected error happened while sending otp.");
  }
};

//@desc verifying otp
//@route POST /verify-otp
//@access Public
export const verifyOtp: RequestHandler = async (req, res, next) => {
  try {
    const { otpAttempt, email } = req.body;
    if (!otpAttempt || !email) {
      return res.status(400).json("Please enter your otp.");
    }
    console.log(`Received otp attempt= ${otpAttempt}`);
    console.log(`Received email= ${email}`);

    //checking for an existing user with the same email id
    const existingDoc = await Verifications.findOne({ where: { email } });
    if (!existingDoc) {
      return res
        .status(400)
        .json({ message: "No document found with this email." });
    }
    if (otpAttempt === existingDoc.otp) {
      await Verifications.destroy({ where: { email } });
      return res.status(200).json({ message: "Mail verified successfully." });
    }
    return res.status(400).json({ message: "Incorrect otp." });
  } catch (error) {
    console.error("Error in verifyOtp function :", error);
    return res
      .status(500)
      .json("Unexpected error happened while verifying otp.");
  }
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
    const { page = 1, searchKey, sortType } = req.query;
    const count = 5;
    const skip = (parseInt(page as string) - 1) * count;
    const whereCondition: any = { isBlocked: false };

    if (searchKey) whereCondition.name = { [Op.like]: `%${searchKey}%` };

    const orderCondition: any = sortType
      ? [["selling_price", `${sortType}`]]
      : [];

    const products = await Product.findAll({
      limit: count,
      offset: skip,
      where: whereCondition,
      order: orderCondition,
      include: [{ model: Image, attributes: ["image"] }],
    });

    const allProducts = products.map((product: any) => {
      const imageUrls = product.Images.map((image: any) => image.image);
      return { ...product.toJSON(), Images: imageUrls };
    });

    return res
      .status(200)
      .json({ message: "Products fetched successfully.", data: allProducts });
  } catch (error) {
    console.error("Error in finding all products function:", error);
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
      res.status(200).send("Images uploaded successfully");
    }
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
