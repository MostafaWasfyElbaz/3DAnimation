import { Router } from "express";
import * as modules from "./modules/index";
const baseRouter = Router();

const routes = {
  auth: "/auth",
};

baseRouter.use(routes.auth, modules.authRouter);

export default baseRouter;
