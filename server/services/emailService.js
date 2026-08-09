import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your Kitchen Keeps password',
    html: `
      <p>We received a request to reset your Kitchen Keeps password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
