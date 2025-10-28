const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // Should be 465
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `FriendSphere <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: // You can also send HTML emails
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    // Rethrow or handle specific errors differently if needed
    throw new Error("There was an error sending the email, try again later.");
  }
};

module.exports = sendEmail;
