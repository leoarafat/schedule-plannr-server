const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const moment = require("moment");
const db = require("./db");

// Create a transport object to send emails using Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourgmailusername@gmail.com",
    pass: "yourgmailpassword",
  },
});

// Check the schedule data in the database every minute
schedule.scheduleJob("* * * * *", async function () {
  // Get the current time
  const now = moment();

  // Get the schedules that are 15 minutes from now
  const schedules = await db.getScheduleByTime(now.add(15, "minutes"));
  const createSchedule = client.db("ScheduPlannr").collection("createSchedule");

  // Loop through the schedules and send a notification email for each one
  schedules.forEach(async function (schedule) {
    const mailOptions = {
      from: "yourgmailusername@gmail.com",
      to: schedule.email,
      subject: "Schedule Reminder",
      text: ` Your scheduled event "${schedule.title}" is starting in 15 minutes`,
    };

    await transporter.sendMail(mailOptions);
  });
});
    // Check the schedule data in the database every minute
    schedule.scheduleJob("* * * * *", async function () {
        // Get the current time
        const now = moment();
  
        // Get the schedules that are 15 minutes from now
        const schedules = await client
          .db("ScheduPlannr")
          .collection("createSchedule")
          .getScheduleByTime(now.add(15, "minutes"));
  
        // Loop through the schedules and send a notification email for each one
        schedules.forEach(async function (schedule) {
          const mailOptions = {
            from: process.env.EMAIL,
            to: schedule.email,
            subject: "Schedule Reminder",
            text: ` Your scheduled event "${schedule.title}" is starting in 15 minutes`,
          };
  
          await transporter.sendMail(mailOptions);
        });
      });