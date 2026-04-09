import { Router } from "express";
import * as modules from "./modules/index";
const baseRouter = Router();

const routes = {
  auth: "/auth",
  project: "/project",
};
baseRouter.use(routes.auth, modules.authRouter);
baseRouter.use(routes.project, modules.projectRouter);
export default baseRouter;
