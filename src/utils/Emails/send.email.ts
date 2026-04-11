import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST as string,
    port: Number(process.env.EMAIL_PORT) as number,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
    family: 4,
  } as any);

  const main = async () => {
    await transporter.sendMail({
      from: `Social App <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
  };
  main().catch((err) => {
    throw err;
  });
};
