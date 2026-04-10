import axios, { AxiosResponse } from "axios";
import FormData from "form-data";

export async function generateModel({
  files,
}: {
  files: Express.Multer.File[];
}) {
  const form = new FormData();

  if (files.length === 0 || files.length < 3 || files.length > 5) {
    return null;
  }

  files.forEach((file) => {
    form.append("images", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
  });

  try {
    const res: AxiosResponse<Buffer> = await axios.post(
      "https://mostafa-wasfy-elbaz-3danimationai.hf.space/predict",
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
  } catch (error: any) {
    throw error;
  }
}
