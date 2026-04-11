import nodemailer from "nodemailer";
import { google } from "googleapis";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    const OAuth2 = google.auth.OAuth2;
    const oAuth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID as string,
      process.env.OAUTH_CLIENT_SECRET as string,
      "https://developers.google.com/oauthplayground",
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN as string,
    });

    const accessToken = (await oAuth2Client.getAccessToken()).token;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER as string,
        clientId: process.env.OAUTH_CLIENT_ID as string,
        clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN as string,
        accessToken: accessToken as string,
      },
    } as any);

    await transporter.sendMail({
      from: `3DAnimation <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
  } catch (error) {
    throw error;
  }
};
