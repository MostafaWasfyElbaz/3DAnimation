"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const friendRequest_repository_1 = __importDefault(require("../../DB/Repository/friendRequest.repository"));
const user_repository_1 = __importDefault(require("../../DB/Repository/user.repository"));
class UserServices {
    s3Services;
    friendRequestRepository;
    userRepository;
    constructor(s3Services = new utils_1.S3Services(), friendRequestRepository = new friendRequest_repository_1.default(), userRepository = new user_repository_1.default()) {
        this.s3Services = s3Services;
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
    }
    uploadProfilePicture = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { file } = req;
            const Key = await this.s3Services.uploadSingleFile({
                file: file,
                Path: `${user._id}/profilePicture`,
            });
            user.profileImage = Key;
            await user.save();
            return (0, utils_1.successHandler)({
                res,
                msg: "Profile picture uploaded successfully",
                data: { Key },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    uploadFileWithPreSignedUrl = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { ContentType, Originalname } = req.body;
            const { url, Key } = await this.s3Services.preSignedUrl({
                ContentType,
                Originalname,
                Path: `${user._id}/presigned-profilePicture`,
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "PreSigned URL generated successfully",
                data: { url, Key },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    uploadCoverImages = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { files } = req;
            const keys = await this.s3Services.uploadMultiFiles({
                files: files,
                Path: `${user._id}/coverImages`,
            });
            user.coverImages = keys;
            await user.save();
            return (0, utils_1.successHandler)({
                res,
                msg: "Cover images uploaded successfully",
                data: { keys },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    getFilesOrDownload = async (req, res, next) => {
        try {
            const { path } = req.params;
            const { downloadName } = req.query;
            const Key = path.join("/");
            const file = await this.s3Services.getAsset({ Key });
            const stream = file.Body;
            if (!file?.Body) {
                throw new utils_1.notFoundError();
            }
            res.set("Content-Type", file.ContentType);
            if (downloadName) {
                res.set("Content-Disposition", `attachment; filename=${downloadName}.${Key.split(".").pop()}`);
            }
            return (0, utils_1.successHandler)({
                res,
                msg: "File downloaded successfully",
                data: { stream },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    getFilesOrDownloadPreSignedUrl = async (req, res, next) => {
        try {
            const { path } = req.params;
            const { downloadName, download } = req.query;
            const Key = path.join("/");
            const url = await this.s3Services.getAssetPreSignedUrl({
                Key: Key,
                downloadName: downloadName,
                download: download,
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "link generated successfully",
                data: { url },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    deleteProfileImage = async (req, res, next) => {
        try {
            const { path } = req.params;
            const Key = path.join("/");
            if (res.locals.user.profileImage !== Key) {
                throw new utils_1.unauthorizedError();
            }
            const file = await this.s3Services.deleteAsset({ Key });
            return (0, utils_1.successHandler)({
                res,
                msg: "profile image deleted successfully",
                data: { file },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    deleteCoverImages = async (req, res, next) => {
        try {
            const { urls } = req.body;
            if (urls.length === 0) {
                throw new utils_1.notFoundError();
            }
            for (const url of urls) {
                if (!res.locals.user.coverImages.includes(url)) {
                    throw new utils_1.unauthorizedError();
                }
            }
            const file = await this.s3Services.deleteAssets({ urls });
            return (0, utils_1.successHandler)({
                res,
                msg: "cover images deleted successfully",
                data: { file },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    updateUserBasicInfo = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { firstName, lastName } = req.body;
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            await user.save();
            return (0, utils_1.successHandler)({
                res,
                msg: "User info updated successfully",
                data: { user },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    sendFriendRequest = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { to } = req.body;
            if (user._id.toString() === to) {
                throw new utils_1.unableToSetFriendRequest();
            }
            let friend;
            try {
                friend = await this.userRepository.findById({ id: to });
                if (!friend) {
                    throw new utils_1.notFoundError();
                }
            }
            catch (err) {
                throw err;
            }
            try {
                await this.friendRequestRepository.createFriendRequest({
                    user,
                    friend,
                });
            }
            catch (err) {
                throw err;
            }
            return (0, utils_1.successHandler)({
                res,
                msg: "Friend request sent successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    acceptFriendRequest = async (req, res, next) => {
    };
}
exports.default = UserServices;
