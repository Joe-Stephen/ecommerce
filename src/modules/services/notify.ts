import User from "../user/userModel";

//importing services
import DBQueries from "./dbQueries";
const dbQueries = new DBQueries();

//creating notification
export const notify = async (
  userId: number,
  label: string,
  content: string
) => {
  const notification = await dbQueries.createNotificationForOne(
    userId,
    label,
    content
  );
  return notification;
};

export const notifyAll = async (label: string, content: string) => {
  try {
    const allUsers: User[] | [] | undefined = await dbQueries.findAllUsers();
    if (!allUsers || allUsers.length===0) {
      console.log("No users found!");
      return null;
    }
    const promises: any = allUsers.forEach(async (user: any) => {
      await dbQueries.createNotificationForOne( user.id, label, content );
    });
    if (promises) {
      await Promise.all(promises);
      return true;
    }
  } catch (error) {
    console.error("An error happened in the notify all service :", error);
    return null;
  }
};

export const notifySelected = async (
  ids: number[],
  label: string,
  content: string
) => {
  try {
    const selectedUsers = await dbQueries.findAllUsersInArray(ids);
    if (!selectedUsers) {
      console.log("No users found!");
      return null;
    }
    const promises: any = selectedUsers.forEach(async (user: any) => {
      await dbQueries.createNotificationForOne(user.id, label, content);
    });
    if (promises) {
      await Promise.all(promises);
      return true;
    }
  } catch (error) {
    console.error("An error happened in the notify selected service :", error);
    return null;
  }
};
