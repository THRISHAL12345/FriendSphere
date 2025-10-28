const sgMail = require("@sendgrid/mail");

// Set the SendGrid API key from environment variables
sgMail.setApiKey(process.env.EMAIL_PASSWORD);

const sendEmail = async (options) => {
  const msg = {
    to: options.email,
    from: process.env.EMAIL_FROM, // This should be a verified sender in your SendGrid account
    subject: options.subject,
    text: options.message,
    // You can also add an html property for HTML emails
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully via SendGrid");
  } catch (error) {
    console.error("Error sending email via SendGrid:", error);

    // If the error object has more details, log them
    if (error.response) {
      console.error(error.response.body);
    }

    // Throw a generic error to the user
    throw new Error("There was an error sending the email, try again later.");
  }
};

module.exports = sendEmail;
