import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../user/userModel";
import { log } from "console";

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get token from the header
    const token = req.headers.authorization!.split(" ")[1];

    //verify token
    const decoded:any= jwt.verify(token, process.env.JWT_SECRET as string);

    //get user from the token
    req.body.user = decoded;
    const user = await User.findOne({ where: { email: decoded.email } });    
    if (user?.isAdmin) {
      next();
    } else {
      console.log("You are not an admin.");
      return res.status(401).json({ message: "You are not an admin." });
    }
  } catch (error) {
    console.log("You are not an admin :", error);
    return res.status(401).json({ message: "You are not an admin." });
  }
};

export default verifyAdmin;
