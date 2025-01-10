const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: process.env.EMAIL_USER, // Set your email
    pass: process.env.EMAIL_PASS, // Set your password
  },
});

exports.sendEmail = ({ to, subject, template, context }) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(__dirname, "../templates", `${template}.ejs`);
    ejs.renderFile(templatePath, context, (err, data) => {
      if (err) return reject(err);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: data,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });
  });
};
