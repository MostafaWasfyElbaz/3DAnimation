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

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

    const rawMessage = [
      `To: ${email}`,
      `From: 3DAnimation <${process.env.EMAIL_USER}>`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
  } catch (error) {
    throw error;
  }
};
