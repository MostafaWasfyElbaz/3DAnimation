import { NextFunction, Request, Response } from "express";

export interface IProjectServices {
  createProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;

  getProjectById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;

  getAllProjects(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;

  deleteProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;

  Image2Model(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;

  updateProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response>;
}
