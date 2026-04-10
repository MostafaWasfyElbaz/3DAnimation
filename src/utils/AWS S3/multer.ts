import multer from "multer";

export const uploadFile = ({}: { mimeType?: string[] }): multer.Multer => {
  const storage = multer.memoryStorage();
  const limits = {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 5,
    },
  };

  return multer({
    storage,
    ...limits,
  });
};
