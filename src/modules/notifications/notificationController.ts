import { RequestHandler } from "express";

//importing models
import Notification from "./notificationModel";
import User from "../user/userModel";
import moment from "moment";
import sequelize from "../config/db";

export const getAllNotifications: RequestHandler = async (req, res) => {
  try {
    const loggedInUser = req.body.user;
    const user = await User.findOne({ where: { email: loggedInUser.email } });
    if (!user) {
      console.log("No user found.");
      return res.status(500).json({ message: "No user found." });
    }
    const allNotifications: Notification[] = await Notification.findAll({
      where: { userId: user.id },
    });
    return res.status(200).json({
      message: "Notifications has been fetched successfully.",
      data: allNotifications,
    });
  } catch (error) {
    console.error("Error in getAllNotifications function.", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const toggleStatus: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      console.log("No notification id provided.");
      return res
        .status(500)
        .json({ message: "Please provide notification id." });
    }
    const notification = await Notification.update(
      { checked: sequelize.literal("NOT checked") },
      { where: { id: ids } }
    );
    if (!notification) {
      console.log("No notification found with this id.");
      return res
        .status(400)
        .json({ message: "No notification found with this id." });
    } else {
      console.log("Notification status has been toggled.");
      return res
        .status(200)
        .json({ message: "Notification status has been toggled." });
    }
  } catch (error) {
    console.error("Error in notification toggle status :", error);
    return res
      .status(500)
      .json({ message: "Error in notification toggle status." });
  }
};
