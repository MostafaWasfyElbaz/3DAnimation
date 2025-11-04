import { HydratedDocument } from "mongoose";
import { I3DMoldeService, IUser, StoreIn } from "../../common";
import { Request, Response } from "express";
import { successHandler, S3Services, failedToGenerateLink } from "../../utils";
import { UserRepository } from "../../DB";

class _3DModelService implements I3DMoldeService {
  constructor(
    private s3Services = new S3Services(),
    private userModel = new UserRepository()
  ) {}

  uploadModel = async (req: Request, res: Response): Promise<Response> => {
    const user: HydratedDocument<IUser> = res.locals.user;
    const { ContentType, Originalname } = req.body;
    try {
      const { url, Key } = await this.s3Services.preSignedUrl({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Path: "models",
        ContentType,
        Originalname,
      });
      if (!url || !Key) {
        throw new failedToGenerateLink();
      }
      await this.userModel.updateOne({
        filter: { _id: user._id },
        data: { $push: { models: Key } },
      });
      return successHandler({
        res,
        data: { url, Key },
        msg: "Model uploaded successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };
}

const _3DModelServices = new _3DModelService();
export default _3DModelServices;
