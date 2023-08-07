const nodemailer = require("nodemailer");
let env = require("dotenv").config();
const auth_email = process.env.Email
const auth_password = process.env.Pass;


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: auth_email,
        pass: auth_password
    }
})
let sendEmailOTP = (email:any, otpEmail:any) => {
  const mailOptions = {
    to: email,
    from: auth_email,
    subject: "Otp for registration is: ",
    html:
      "<h3>OTP for email verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otpEmail +
      "</h1>", // html body
  };
  return transporter.sendMail(mailOptions);
};
module.exports = { sendEmailOTP };