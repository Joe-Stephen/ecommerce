import { RequestHandler } from "express";
import { Op } from "sequelize";
import { generateOtp } from "../services/otpGenerator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redis from "../config/redis";

//importing services
import { sendMail } from "../services/sendMail";

//model imports
import User from "../user/userModel";
import Product from "../product/productModel";

//importing DB queries
import DBQueries from "../services/dbQueries";
import Image from "../product/imageModel";
const dbQueries = new DBQueries();

//@desc creating a new user
//@route POST /
//@access Public
export const createUser: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.log("Please provide all the details.");
    return res.status(400).json({ message: "Please provide all the details." });
  }
  //checking for existing user
  const existingUser = await dbQueries.findUserByEmail(email);
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
  const user: User | null | undefined = await dbQueries.createUser(
    username,
    email,
    hashedPassword
  );
  if (!user) {
    console.log("Error in the create user function.");
    return res
      .status(500)
      .json({ message: "Error in the create user function." });
  }
  //setting user login details in redis
  redis.set(email, hashedPassword);
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
    const existingUser = await dbQueries.findUserByEmail(email);
    if (existingUser) {
      console.log("This email is already registered!");
      return res
        .status(400)
        .json({ message: "This email is already registered!" });
    } else {
      const otp: string = generateOtp();
      const subject: string = "Register OTP Verification";
      const text: string = `Your OTP for verification is ${otp}`;
      //sending otp
      await sendMail(email, subject, text);
      const verificationDoc = await dbQueries.createVerification(email, otp);
      console.log(`OTP has been saved to verifications : ${verificationDoc}`);
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
    const existingDoc = await dbQueries.findVerificationByEmail(email);
    if (!existingDoc) {
      return res
        .status(400)
        .json({ message: "No document found with this email." });
    }
    if (otpAttempt === existingDoc.otp) {
      dbQueries.destroyVerificationByEmail(email);
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
    // const user: User | null | undefined = await dbQueries.findUserByEmail(
    //   email
    // );
    let userPassword!: string;
    //accessing user data from redis
    await redis.get(email, (err: Error, password: string) => {
      if (err) {
        console.error(
          "Error happened while getting user data from redis :",
          err
        );
      }
      userPassword = password;
    });
    if (!userPassword) {
      console.log("No user found with this email!");
      return res
        .status(400)
        .json({ message: "No user found with this email!" });
    }
    if (userPassword && (await bcrypt.compare(password, userPassword))) {
      const loggedInUser = {
        email: email,
        token: generateToken(email),
      };
      console.log("User logged in successfully");
      return res
        .status(201)
        .json({ message: "Login successfull", data: loggedInUser });
    } else {
      console.log("Incorrect password.");
      return res.status(201).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error in login function :", error);
    return res.status(400).json({ message: "Login unsuccessfull." });
  }
};

export const getAllProducts: RequestHandler = async (req, res, next) => {
  try {
    //setting type for product object
    type productType = {
      name: string;
      brand: string;
      description: string;
      category: string;
      regular_price: number;
      selling_price: number;
    };
    var redisProducts: productType[] = [];
    let allRedisProducts: any = [];
    const { page = 1, searchKey, sortType } = req.query;
    const count = 4;    
    // const skip = (parseInt(page as string) - 1) * count;
    // const whereCondition: any = { isBlocked: false };
    // if (searchKey) whereCondition.name = { [Op.like]: `%${searchKey}%` };
    // const orderCondition: any = sortType
    //   ? [["selling_price", `${sortType}`]]
    //   : [];
    // const products: Product[] | [] | undefined =
    //   await dbQueries.findAllProductsWithFilter(
    //     count,
    //     skip,
    //     whereCondition,
    //     orderCondition
    //   );
    
    //getting product from redis
    let keys: any = [];
    async function getAllKeys(cursor: any) {
      const promises: Promise<void>[] = [];
      await redis.scan(
        cursor,
        "MATCH",
        "product_*",
        async (err: Error, reply: any) => {
          if (err) {
            console.error(
              "Error happened while getting user data from redis :",
              err
            );
          }
          const [newCursor, matchedKeys] = reply;
          matchedKeys.forEach(async (key: string) => {
            const promise = new Promise<void>((resolve, reject) => {
              redis.get(key, (err: Error, product: any) => {
                if (err) {
                  console.error(
                    "Error happened while getting user data from redis :",
                    err
                  );
                } else {
                  redisProducts?.push(JSON.parse(product));
                  resolve();
                }
              });
            });
            promises.push(promise);
          });
          keys = keys.concat(matchedKeys);
          if (newCursor !== "0") {
            getAllKeys(newCursor);
          } else {
            await Promise.all(promises).then(async () => {
              const promises = redisProducts.map(async (product: any) => {
                const images = await Image.findAll({
                  where: { productId: product.id },
                  raw: true,
                });
                product.images = [...images];
                allRedisProducts.push(product);
                return product;
              });
              await Promise.all(promises);
              //searching
              if (searchKey) {
                allRedisProducts = allRedisProducts.filter((product: any) =>
                  product.name.includes(searchKey)
                );
                console.log("The search products :", allRedisProducts);
              }
              //pagination
              const paginated=allRedisProducts.slice((parseInt(page as string)*count), (parseInt(page as string)*count)+count);
              console.log("pagination applied :", paginated)
              //sorting
              if (sortType && sortType === "DESC") {
                paginated.sort(
                  (a: any, b: any) => b.selling_price - a.selling_price
                );
              } else if (sortType && sortType === "ASC") {
                paginated.sort(
                  (a: any, b: any) => a.selling_price - b.selling_price
                );
              }
              return res.status(200).json({
                message: "Products fetched successfully.",
                data: paginated,
              });
            });
          }
        }
      );
    }
    getAllKeys("0");
    // if (!products) {
    //   console.log("No products found.");
    //   return res.status(500).json({ message: "No products has been found." });
    // }
    // const allProducts = products.map((product: any) => {
    //   const imageUrls = product.Images.map((image: any) => image.image);
    //   return { ...product.toJSON(), Images: imageUrls };
    // });
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
    const user: User | null | undefined = await dbQueries.findUserByEmail(
      email
    );
    if (!user) {
      console.log("No user found with this email!");
      return res
        .status(400)
        .json({ message: "No user found with this email!" });
    }
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //updating password and saving document
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password :", error);
    return res.status(400).json({ message: "Error changing password." });
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

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      console.log("Please provide all the details.");
      return res
        .status(400)
        .json({ message: "Please provide all the details." });
    }
    if (typeof id === "string") {
      const existingUser: User | null | undefined =
        await dbQueries.checkForDuplicateUser(email, parseInt(id, 10));
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "A product with this name already exists." });
      }
      //hashing password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await dbQueries.updateUserById(
        parseInt(id),
        username,
        email,
        hashedPassword
      );
      const updatedUser: User | null | undefined = await dbQueries.findUserById(
        parseInt(id, 10)
      );
      return res
        .status(200)
        .json({ message: "User updated successfully.", data: updatedUser });
    }
  } catch (error) {}
};
