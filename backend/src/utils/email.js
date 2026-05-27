const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send email'
    };
  }
};

const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await sendEmail(email, 'Password Reset - Hawkeye Campus', html);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  transporter
};
