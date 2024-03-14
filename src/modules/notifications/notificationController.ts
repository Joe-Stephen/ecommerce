import { RequestHandler } from "express";

//importing models
import Notification from "./notificationModel";
import User from "../user/userModel";

export const getAllNotifications: RequestHandler = async (req, res) => {
  try {
    const loggedInUser=req.body.user;
    const user= await User.findOne({where:{email:loggedInUser.email}});
    if (!user) {
      console.log("No user found.");
      return res
        .status(500)
        .json({ message: "No user found." });
    }
    const allNotifications: Notification[] = await Notification.findAll({
      where: { userId: user.id },
    });
    return res
      .status(200)
      .json({
        message: "Notifications has been fetched successfully.",
        data: allNotifications,
      });
  } catch (error) {}
};
