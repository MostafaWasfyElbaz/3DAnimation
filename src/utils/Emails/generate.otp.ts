import { customAlphabet } from "nanoid";

export const generateOTP = () => {
  return customAlphabet(
    process.env.OTP_ALPAHBET as string,
    Number(process.env.OTP_SIZE)
  )();
};
