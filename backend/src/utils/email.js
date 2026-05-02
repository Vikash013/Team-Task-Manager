import nodemailer from 'nodemailer';

const hasResendConfig = () => Boolean(process.env.RESEND_API_KEY);
const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const getEmailFrom = () => process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER;

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

const sendWithResend = async ({ to, subject, text, html }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: [to],
        subject,
        text,
        html
      }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        sent: false,
        reason: body.message || body.error?.message || 'Resend email delivery failed'
      };
    }

    return { sent: true };
  } catch (error) {
    console.error(`Resend delivery failed: ${error.message}`);
    return {
      sent: false,
      reason: error.name === 'AbortError' ? 'Resend connection timeout' : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithSmtp = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: getEmailFrom(),
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

export const sendEmail = async ({ to, subject, text, html }) => {
  if (hasResendConfig()) {
    return sendWithResend({ to, subject, text, html });
  }

  if (hasSmtpConfig()) {
    return sendWithSmtp({ to, subject, text, html });
  }

  return {
    sent: false,
    reason: 'Email provider is not configured'
  };
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
