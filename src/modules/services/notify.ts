import Notification from "../notifications/notificationModel";

//creating notification
const notify = async (userId: number, label: string, content: string) => {
  const notification = await Notification.create({
    userId,
    label,
    content,
  });
  return notification;
};

export default notify;
