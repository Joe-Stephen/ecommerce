import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get token from the header
    const token = req.headers.authorization!.split(" ")[1];

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    //get user from the token
    req.body.user = decoded;
    next();
  } catch (error) {
    console.log("Not authorized! :", error);
    return res.status(401).json({ message: "Not authorized!" });
  }
};

export default verifyUser;
