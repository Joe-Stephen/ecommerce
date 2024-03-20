import { RequestHandler } from "express";

//importing models
import Notification from "./notificationModel";
import User from "../user/userModel";
import sequelize from "../config/db";

//importing DB queries
import DBQueries from "../services/dbQueries";
const dbQueries = new DBQueries();

export const getAllNotifications: RequestHandler = async (req, res) => {
  try {
    const loggedInUser = req.body.user;
    const user = await dbQueries.findUserByEmail(loggedInUser.email);
    if (!user) {
      console.log("No user found.");
      return res.status(500).json({ message: "No user found." });
    }
    const allNotifications: Notification[] | [] | undefined =
      await dbQueries.findAllNotificationsByUserId(user.id);
    if (!allNotifications || allNotifications.length === 0) {
      return res.status(400).json({
        message: "No notifications found.",
      });
    }
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
    if (!ids || ids.length === 0) {
      console.log("No notification id provided.");
      return res
        .status(500)
        .json({ message: "Please provide notification id." });
    }
    await dbQueries.toggleStatusByIdArray(ids);
    console.log("Notification status has been toggled.");
    return res
      .status(200)
      .json({ message: "Notification status has been toggled." });
  } catch (error) {
    console.error("Error in notification toggle status :", error);
    return res
      .status(500)
      .json({ message: "Error in notification toggle status." });
  }
};
