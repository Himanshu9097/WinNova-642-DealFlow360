const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"DealFlow360" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to DealFlow360!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D6536D;">Welcome to DealFlow360, ${name}!</h2>
      <p>We're thrilled to have you onboard.</p>
      <p>Your workspace is now ready. You can log in and start closing deals, managing inventory, and generating invoices seamlessly.</p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendAdminCreatedUserEmail = async (to, name, password) => {
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:5175';
  const subject = 'You have been invited to DealFlow360';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D6536D;">Welcome to DealFlow360, ${name}!</h2>
      <p>Your Company Administrator has created an account for you.</p>
      <p><strong>Your Temporary Password:</strong> ${password}</p>
      <p>You can log in at <a href="${loginUrl}/login">${loginUrl}/login</a>.</p>
      <p><em>Please change your password after logging in.</em></p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const subject = 'Reset Your DealFlow360 Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D6536D;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password for your DealFlow360 account.</p>
      <p>Click the button below to reset it. This link will expire in 1 hour.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D6536D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px; margin-bottom: 20px;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendAdminCreatedUserEmail,
  sendPasswordResetEmail
};
