import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { StoreIn } from "../../index";
import {
  GetObjectCommandOutput,
  DeleteObjectCommandOutput,
} from "@aws-sdk/client-s3";

export interface IS3Services {
  uploadSingleFile({
    Bucket,
    ACL,
    Path,
    file,
    storeIn,
  }: {
    Bucket: string;
    ACL: ObjectCannedACL;
    Path: string;
    file: Express.Multer.File;
    storeIn: StoreIn;
  }): Promise<string>;
  uploadSingleLargeFile({
    Bucket,
    ACL,
    Path,
    file,
    storeIn,
  }: {
    Bucket: string;
    ACL: ObjectCannedACL;
    Path: string;
    file: Express.Multer.File;
    storeIn: StoreIn;
  }): Promise<string>;
  uploadMultiFiles({
    Bucket,
    ACL,
    Path,
    files,
    storeIn,
  }: {
    Bucket: string;
    ACL: ObjectCannedACL;
    Path: string;
    files: Express.Multer.File[];
    storeIn: StoreIn;
  }): Promise<string[]>;
  preSignedUrl({
    Bucket,
    Path,
    ContentType,
    Originalname,
    expiresIn,
  }: {
    Bucket?: string;
    Path?: string;
    ContentType: string;
    Originalname: string;
    expiresIn?: number;
  }): Promise<{ url: string; Key: string }>;
  getAsset({
    Bucket,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput>;
  getAssetPreSignedUrl({
    Bucket,
    Key,
    expiresIn,
    downloadName,
    download,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string;
    download?: string;
  }): Promise<string>;
  deleteAsset({
    Bucket,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput>;
  deleteAssets({
    Bucket,
    urls,
    Quiet,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectCommandOutput>;
}
