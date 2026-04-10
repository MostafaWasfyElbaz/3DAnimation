import multer from "multer";

export const uploadFile = ({}: { mimeType?: string[] }): multer.Multer => {
  console.log("test multer")
  const storage = multer.memoryStorage();
  const limits = {
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 5,
    },
  };

  return multer({
    storage,
    ...limits
  });
};
