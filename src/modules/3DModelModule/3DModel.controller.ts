import { Router } from "express";
import { auth, validationMiddleware } from "../../middleware";
import _3DModelServices from "./3DModel.service";
import { uploadFile } from "../../utils";
import { uploadModelSchema } from "./3DModel.validation";
const router = Router();
const routes = {
  uploadModel: "/upload-model",
};

router.post(
  routes.uploadModel,
  auth({}),
  validationMiddleware(uploadModelSchema),
  _3DModelServices.uploadModel
);
export default router;
