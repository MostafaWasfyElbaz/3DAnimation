"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Services = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const index_1 = require("../../common/index");
const fs_1 = require("fs");
const index_2 = require("../index");
const nanoid_1 = require("nanoid");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Services {
    constructor() { }
    uploadSingleFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", file, storeIn = index_1.StoreIn.memory, }) => {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            ACL,
            Key: `${process.env.APP_NAME}/users/${Path}/${(0, nanoid_1.nanoid)(15)}_${file.originalname}`,
            Body: storeIn == index_1.StoreIn.memory ? file.buffer : (0, fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        });
        await (0, index_2.s3Client)().send(command);
        if (!command.input.Key) {
            throw new index_2.failedToUpload();
        }
        return command.input.Key;
    };
    uploadSingleLargeFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", file, storeIn = index_1.StoreIn.disk, }) => {
        const upload = new lib_storage_1.Upload({
            client: (0, index_2.s3Client)(),
            partSize: 10 * 1024 * 1024,
            params: {
                Bucket,
                ACL,
                Key: `${process.env.APP_NAME}/users/${Path}/${(0, nanoid_1.nanoid)(15)}_${file.originalname}`,
                Body: storeIn == index_1.StoreIn.memory ? file.buffer : (0, fs_1.createReadStream)(file.path),
                ContentType: file.mimetype,
            },
        });
        upload.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });
        const { Key } = await upload.done();
        if (!Key) {
            throw new index_2.failedToUpload();
        }
        return Key;
    };
    uploadMultiFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", files, storeIn = index_1.StoreIn.memory, }) => {
        const Keys = Promise.all(storeIn == index_1.StoreIn.memory
            ? files.map((file) => {
                return this.uploadSingleFile({
                    file,
                    Bucket,
                    ACL,
                    Path,
                    storeIn,
                });
            })
            : files.map((file) => {
                return this.uploadSingleLargeFile({
                    file,
                    Bucket,
                    ACL,
                    Path,
                    storeIn,
                });
            }));
        return Keys;
    };
    preSignedUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, Path = "general", ContentType, Originalname, expiresIn = 120, }) => {
        const safeName = Originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${process.env.APP_NAME}/${Path}/${(0, nanoid_1.nanoid)(15)}_${safeName}`,
            ContentType,
            ACL: "private",
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)((0, index_2.s3Client)(), command, { expiresIn });
        if (!url || !command.input.Key) {
            throw new index_2.failedToGenerateLink();
        }
        return { url, Key: command.input.Key };
    };
    getAsset = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await (0, index_2.s3Client)().send(command);
    };
    getAssetPreSignedUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, expiresIn = 120, downloadName, download, }) => {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download == "true"
                ? `attachment; filename=${downloadName}.${Key.split(".").pop()}`
                : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)((0, index_2.s3Client)(), command, { expiresIn });
        if (!url || !command.input.Key) {
            throw new index_2.failedToGenerateLink();
        }
        return url;
    };
    deleteAsset = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await (0, index_2.s3Client)().send(command);
    };
    deleteAssets = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false, }) => {
        const Objects = urls.map((url) => {
            return { Key: url };
        });
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet,
            },
        });
        return await (0, index_2.s3Client)().send(command);
    };
}
exports.S3Services = S3Services;
