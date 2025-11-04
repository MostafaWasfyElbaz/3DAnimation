import {
  ObjectCannedACL,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  DeleteObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { StoreIn, IS3Services } from "../../common/index";
import { createReadStream } from "fs";
import { failedToGenerateLink, failedToUpload, s3Client } from "../index";
import { nanoid } from "nanoid";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Services implements IS3Services {
  constructor() {}
  uploadSingleFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    Path = "general",
    file,
    storeIn = StoreIn.memory,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    Path?: string;
    file: Express.Multer.File;
    storeIn?: StoreIn;
  }): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${process.env.APP_NAME}/users/${Path}/${nanoid(15)}_${
        file.originalname
      }`,
      Body:
        storeIn == StoreIn.memory ? file.buffer : createReadStream(file.path),
      ContentType: file.mimetype,
    });
    await s3Client().send(command);
    if (!command.input.Key) {
      throw new failedToUpload();
    }
    return command.input.Key;
  };

  uploadSingleLargeFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    Path = "general",
    file,
    storeIn = StoreIn.memory,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    Path?: string;
    file: Express.Multer.File;
    storeIn?: StoreIn;
  }): Promise<string> => {
    const upload = new Upload({
      client: s3Client(),
      partSize: 10 * 1024 * 1024,
      params: {
        Bucket,
        ACL,
        Key: `${process.env.APP_NAME}/users/${Path}/${nanoid(15)}_${
          file.originalname
        }`,
        Body:
          storeIn == StoreIn.memory ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    upload.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
      throw new failedToUpload();
    }
    return Key;
  };

  uploadMultiFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    Path = "general",
    files,
    storeIn = StoreIn.memory,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    Path?: string;
    files: Express.Multer.File[];
    storeIn?: StoreIn;
  }): Promise<string[]> => {
    const Keys = Promise.all(
      storeIn == StoreIn.memory
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
          })
    );
    return Keys;
  };
  preSignedUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Path = "general",
    ContentType,
    Originalname,
    expiresIn = 120,
  }: {
    Bucket?: string;
    Path?: string;
    ContentType: string;
    Originalname: string;
    expiresIn?: number;
  }): Promise<{ url: string; Key: string }> => {
    const safeName = Originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(
      0,
      200
    );
    const command = new PutObjectCommand({
      Bucket,
      Key: `${process.env.APP_NAME}/${Path}/${nanoid(15)}_${safeName}`,
      ContentType,
      ACL: "private",
    });
    const url = await getSignedUrl(s3Client(), command, { expiresIn });
    if (!url || !command.input.Key) {
      throw new failedToGenerateLink();
    }
    return { url, Key: command.input.Key };
  };
  getAsset = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });
    return await s3Client().send(command);
  };
  getAssetPreSignedUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    expiresIn = 120,
    downloadName,
    download,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string;
    download?: string;
  }): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download == "true"
          ? `attachment; filename=${downloadName}.${Key.split(".").pop()}`
          : undefined,
    });
    const url = await getSignedUrl(s3Client(), command, { expiresIn });
    if (!url || !command.input.Key) {
      throw new failedToGenerateLink();
    }
    return url;
  };
  deleteAsset = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });
    return await s3Client().send(command);
  };
  deleteAssets = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    urls,
    Quiet = false,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectCommandOutput> => {
    const Objects = urls.map((url) => {
      return { Key: url };
    });
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects,
        Quiet,
      },
    });
    return await s3Client().send(command);
  };
}
