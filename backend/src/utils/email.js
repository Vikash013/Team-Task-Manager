import nodemailer from 'nodemailer';

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!hasSmtpConfig()) {
    return {
      sent: false,
      reason: 'SMTP is not configured'
    };
  }

  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    return {
      sent: false,
      reason: error.message
    };
  }

  return { sent: true };
};

export const sendInviteEmail = ({ to, inviteUrl, role, invitedBy }) =>
  sendEmail({
    to,
    subject: 'You are invited to Team Task Manager',
    text: `${invitedBy} invited you to join Team Task Manager as ${role}. Accept your invite: ${inviteUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211c">
        <h2>Join Team Task Manager</h2>
        <p><strong>${invitedBy}</strong> invited you to join as <strong>${role}</strong>.</p>
        <p><a href="${inviteUrl}" style="display:inline-block;background:#1f6f54;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Accept invite</a></p>
        <p>If the button does not work, copy this link:</p>
        <p>${inviteUrl}</p>
      </div>
    `
  });

export const sendPasswordResetEmail = ({ to, resetUrl }) =>
  sendEmail({
    to,
    subject: 'Reset your Team Task Manager password',
    text: `Reset your Team Task Manager password using this link: ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211c">
        <h2>Password reset</h2>
        <p>Use the button below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#1f6f54;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Reset password</a></p>
        <p>If the button does not work, copy this link:</p>
        <p>${resetUrl}</p>
      </div>
    `
  });
