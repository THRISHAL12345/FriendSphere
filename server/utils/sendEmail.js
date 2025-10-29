const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // --- Use explicit settings instead of service ---
    host: "smtp.gmail.com", // Gmail SMTP host
    port: 465, // Port for SSL
    secure: true, // Use SSL (required for port 465)
    // --- End explicit settings ---
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
  });

  const mailOptions = {
    from: `FriendSphere <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // Uncomment if sending HTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully via Gmail");
  } catch (error) {
    console.error("Error sending email via Gmail:", error); // Log the detailed error
    throw new Error("There was an error sending the email, try again later.");
  }
};

module.exports = sendEmail;
