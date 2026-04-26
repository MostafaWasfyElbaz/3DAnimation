import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import { ModelType } from "../common";

export async function generateModel({
  files,
  type = ModelType.Image,
  prompt,
}: {
  files?: Express.Multer.File[];
  type?: ModelType;
  prompt?: string;
}): Promise<Buffer | null> {
  const form = new FormData();
  try {
    if (files && files.length == 5 && type === ModelType.Image) {
      files.forEach((file) => {
        form.append("images", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
          knownLength: file.size,
        });
      });

      const res: AxiosResponse<Buffer> = await axios.post(
        "https://mostafa-wasfy-elbaz-3danimationai.hf.space/predict-img",
        // "http://127.0.0.1:8000/predict",
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          responseType: "arraybuffer",
        },
      );
      return res.data;
    } else if (prompt && type === ModelType.Text) {
      form.append("prompt", prompt || "");

      const res: AxiosResponse<Buffer> = await axios.post(
        "https://mostafa-wasfy-elbaz-3danimationai.hf.space/predict-text",
        // "http://127.0.0.1:8000/predict",
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          responseType: "arraybuffer",
        },
      );
      return res.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
