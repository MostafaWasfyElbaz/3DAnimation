import mongoose from "mongoose";

export const DBConnection = async (): Promise<void> => {
  await mongoose
    .connect((process.env.MONGO_URL as string) || (process.env.URI as string))
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.log(error);
    });
};
