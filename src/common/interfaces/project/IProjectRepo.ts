import { HydratedDocument, UpdateResult } from "mongoose";
import { IProject } from "./IProject";
import { IModel } from "./IModel";
import { IGeometry } from "../..";

export interface IProjectRepo {
  createProject({
    name,
    userId,
  }: {
    name: string;
    userId: string;
  }): Promise<{ id: string; name: string } | null>;

  getProjectById({
    projectId,
    userId,
  }: {
    projectId: string;
    userId: string;
  }): Promise<IProject | null>;

  getAllProjects({ userId }: { userId: string }): Promise<IProject[] | null>;

  deleteProject({
    projectId,
    userId,
  }: {
    projectId: string;
    userId: string;
  }): Promise<boolean>;
  updateProject({
    projectId,
    data,
    userId,
  }: {
    projectId: string;
    data: {
      projectName?: string;
      geometries?: IGeometry[];
      models?: IModel[];
    };
    userId: string;
    toDelete?: { _id: string; url: string }[];
  }): Promise<HydratedDocument<IProject> | null>;

  createModel({
    projectId,
    userId,
    data,
  }: {
    projectId: string;
    userId: string;
    data: Partial<IModel>;
  }): Promise<HydratedDocument<IProject> | null>;
}
