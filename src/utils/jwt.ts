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
    expiresIn: "120 S",
    jwtid,
  });
};

export const generateTempToken = ({
  payload,
}: {
  payload: string | object;
}): string => {
  return jwt.sign(payload, process.env.TEMP_SIGNITURE as string, {
    expiresIn: "300 S",
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
    expiresIn: "7 D",
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
