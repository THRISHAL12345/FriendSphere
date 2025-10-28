const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter (service that sends email - e.g., SendGrid, Gmail for dev)
  //    Replace with your actual email service configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.sendgrid.net
    port: process.env.EMAIL_PORT, // e.g., 587 or 465
    auth: {
      user: process.env.EMAIL_USERNAME, // e.g., 'apikey' for SendGrid
      pass: process.env.EMAIL_PASSWORD, // Your API key or password
    },
    // For services like Gmail, you might need secure: false and specific TLS settings
  });

  // 2. Define email options
  const mailOptions = {
    from: `FriendSphere <${process.env.EMAIL_FROM}>`, // Your "from" address
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
    throw new Error("There was an error sending the email, try again later.");
  }
};

module.exports = sendEmail;
