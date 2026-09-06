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

const sendCustomerCreatedEmail = async (to, customerName, companyName) => {
  if (!to) return;
  const subject = `Welcome to ${companyName || 'DealFlow360'} - Customer Profile Created`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D6536D;">Hello ${customerName},</h2>
      <p>A new customer account profile has been created for you under <strong>${companyName || 'DealFlow360'}</strong>.</p>
      <p>You can now receive quotations, track deals, and view invoices online seamlessly.</p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendNewQuotationEmail = async (to, customerName, quoteNumber, grandTotal, portalUrl) => {
  if (!to) return;
  const subject = `New Quotation ${quoteNumber} Received`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D6536D;">New Quotation Available</h2>
      <p>Hi ${customerName || 'Valued Customer'},</p>
      <p>You have received a new quotation <strong>${quoteNumber}</strong> with a total value of <strong>₹${Number(grandTotal || 0).toLocaleString()}</strong>.</p>
      ${portalUrl ? `<p><a href="${portalUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D6536D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View & Accept Quotation</a></p>` : ''}
      <br/>
      <p>Best regards,<br/>The DealFlow360 Sales Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendQuotationStatusUpdateEmail = async (to, customerName, quoteNumber, newStatus, portalUrl) => {
  if (!to) return;
  const subject = `Quotation ${quoteNumber} Status Updated to ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D6536D;">Quotation Status Update</h2>
      <p>Hi ${customerName || 'Valued Customer'},</p>
      <p>The status of quotation <strong>${quoteNumber}</strong> has been updated to: <strong style="color: #D6536D;">${newStatus}</strong>.</p>
      ${portalUrl ? `<p><a href="${portalUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D6536D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Updated Quotation</a></p>` : ''}
      <br/>
      <p>Best regards,<br/>The DealFlow360 Sales Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const sendCompanyRegistrationEmail = async (to, adminName, companyName) => {
  if (!to) return;
  const subject = `Company Registration Successful - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D6536D;">Congratulations ${adminName}!</h2>
      <p>Your company <strong>${companyName}</strong> has been successfully registered on DealFlow360.</p>
      <p>Your administrator workspace is active. You can now configure products, invite team members, and start managing enterprise deal flows.</p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendAdminCreatedUserEmail,
  sendPasswordResetEmail,
  sendCustomerCreatedEmail,
  sendNewQuotationEmail,
  sendQuotationStatusUpdateEmail,
  sendCompanyRegistrationEmail
};
