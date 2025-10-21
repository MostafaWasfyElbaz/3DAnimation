import jwt, { Secret } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { IPayload } from "../common";

export const generateToken = ({
  payload,
}: {
  payload: string | object;
}): { accessToken: string; refreshToken: string } => {
  const jti = nanoid();
  const accessToken = generateAccessToken({ payload, jwtid: jti });
  const refreshToken = generateRefreshToken({ payload, jwtid: jti });
  return { accessToken, refreshToken };
};

export const generateAccessToken = ({
  payload,
  jwtid,
}: {
  payload: string | object;
  jwtid: string;
}): string => {
  return jwt.sign(payload, process.env.ACCESS_SIGNITURE as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION as string,
    jwtid,
  });
};

export const generateTempToken = ({
  payload,
}: {
  payload: string | object;
}): string => {
  return jwt.sign(payload, process.env.TEMP_SIGNITURE as string, {
    expiresIn: process.env.TEMP_TOKEN_EXPIRATION as string,
  });
};

export const generateRefreshToken = ({
  payload,
  jwtid,
}: {
  payload: string | object;
  jwtid: string;
}): string => {
  return jwt.sign(payload, process.env.REFRESH_SIGNITURE as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION as string,
    jwtid,
  });
};

export const verifyToken = ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): IPayload => {
  return jwt.verify(token, secret) as IPayload;
};
