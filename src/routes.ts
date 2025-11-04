import { Router } from "express";
import * as modules from "./modules/index";
const baseRouter = Router();

const routes = {
  auth: "/auth",
  model: "/model",
};
baseRouter.use(routes.auth, modules.authRouter);
baseRouter.use(routes.model, modules.modelRouter);
export default baseRouter;
