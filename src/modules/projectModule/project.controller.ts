import { Router } from "express";
import { auth, validationMiddleware } from "../../middleware";
import {
  createProjectSchema,
  Image2ModelSchema,
  updateProjectSchema,
  uploadGlbSchema,
} from "./project.validation";
import ProjectService from "./project.service";
import { uploadFile } from "../../utils";

const routes = {
  createProject: "/",
  getAllProjects: "/",
  getProjectById: "/:projectId",
  updateProject: "/:projectId",
  deleteProject: "/:projectId",
  Image2Model: "/image2model/:projectId",
  text2Model: "/text2model/:projectId",
  uploadGlb: "/upload-glb/:projectId",
};

const router = Router();
const projectService = new ProjectService();

router.post(
  routes.createProject,
  auth(),
  validationMiddleware(createProjectSchema),
  projectService.createProject,
);
router.post(
  routes.Image2Model,
  auth(),
  uploadFile({}).array("images", 5),
  validationMiddleware(Image2ModelSchema),
  projectService.Image2Model,
);
router.post(routes.text2Model, auth(), projectService.text2Model);
router.post(
  routes.uploadGlb,
  auth(),
  uploadFile({ mimeType: ["model/gltf-binary"] }).array("model", 1),
  validationMiddleware(uploadGlbSchema),
  projectService.uploadGlb,
);

router.get(routes.getProjectById, auth(), projectService.getProjectById);
router.get(routes.getAllProjects, auth(), projectService.getAllProjects);

router.patch(
  routes.updateProject,
  auth(),
  validationMiddleware(updateProjectSchema),
  projectService.updateProject,
);

router.delete(routes.deleteProject, auth(), projectService.deleteProject);
export default router;
