import { hash, compare } from "bcrypt";

export const createHash = async (text: string): Promise<string> => {
  return await hash(text, Number(process.env.SALT_ROUNDS));
};

export const compareHash = async (
  text: string,
  hash: string
): Promise<boolean> => {
  return await compare(text, hash);
};
