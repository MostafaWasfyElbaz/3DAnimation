"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const DB_1 = require("../../DB");
class _3DModelService {
    s3Services;
    userModel;
    constructor(s3Services = new utils_1.S3Services(), userModel = new DB_1.UserRepository()) {
        this.s3Services = s3Services;
        this.userModel = userModel;
    }
    uploadModel = async (req, res) => {
        const user = res.locals.user;
        const { ContentType, Originalname } = req.body;
        try {
            const { url, Key } = await this.s3Services.preSignedUrl({
                Bucket: process.env.AWS_BUCKET_NAME,
                Path: "models",
                ContentType,
                Originalname,
            });
            if (!url || !Key) {
                throw new utils_1.failedToGenerateLink();
            }
            await this.userModel.updateOne({
                filter: { _id: user._id },
                data: { $push: { models: Key } },
            });
            return (0, utils_1.successHandler)({
                res,
                data: { url, Key },
                msg: "Model uploaded successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
}
const _3DModelServices = new _3DModelService();
exports.default = _3DModelServices;
