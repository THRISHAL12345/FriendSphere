const cron = require("node-cron");
const User = require("../models/User");
const Room = require("../models/Room");
const Notification = require("../models/Notification");

const birthdayCheck = () => {
  // This schedule runs the task every day at 10:00 AM.
  // For testing, you can change it to '* * * * *' to run every minute.
  cron.schedule("0 10 * * *", async () => {
    console.log("Running daily birthday check...");

    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 5);

    const targetMonth = targetDate.getMonth() + 1; // getMonth() is 0-indexed
    const targetDay = targetDate.getDate();

    try {
      // Find all users whose birthday is on the target date.
      // We use an aggregation pipeline to compare month and day parts of the date.
      const birthdayUsers = await User.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$dateOfBirth" }, targetMonth] },
                { $eq: [{ $dayOfMonth: "$dateOfBirth" }, targetDay] },
              ],
            },
          },
        },
      ]);

      if (birthdayUsers.length === 0) {
        console.log("No upcoming birthdays found.");
        return;
      }

      console.log(`Found ${birthdayUsers.length} upcoming birthday(s).`);

      // For each user with an upcoming birthday...
      for (const birthdayUser of birthdayUsers) {
        // Find all rooms they are a member of
        const rooms = await Room.find({ members: birthdayUser._id });

        // For each of those rooms...
        for (const room of rooms) {
          // Find all other members to notify
          const membersToNotify = room.members.filter(
            (memberId) => memberId.toString() !== birthdayUser._id.toString()
          );

          const message = `Get ready to celebrate! ${birthdayUser.name}'s birthday is in 5 days.`;

          // Create a notification for each member
          for (const memberId of membersToNotify) {
            await Notification.create({
              recipient: memberId,
              message: message,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error during birthday check:", error);
    }
  });
};

module.exports = birthdayCheck;
