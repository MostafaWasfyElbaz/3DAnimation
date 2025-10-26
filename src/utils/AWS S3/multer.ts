import multer from "multer";
import { Request } from "express";
import { fileSizeError, invalidFileTypeError } from "../index";
import { StoreIn } from "../../common/index";

export const MimeType ={
    images:["image/jpeg","image/jpg","image/png"],
}

export const uploadFile = ({ storeIn=StoreIn.memory,mimeType=MimeType.images }: { storeIn?: StoreIn,mimeType?:string[] }):multer.Multer => {
    const storage = storeIn === StoreIn.memory ? multer.memoryStorage() : multer.diskStorage({})
    const fileFilter = (req:Request,file:Express.Multer.File,cb:CallableFunction):void => {
        if(req.file && req.file.size >= 1024*1024*200 && storeIn === StoreIn.memory){
            cb(new fileSizeError())
        }
        if(!MimeType.images.includes(file.mimetype)){
            cb(new invalidFileTypeError())
        }
        cb(null,true)
        
    }
    return multer({storage,fileFilter}) 
};