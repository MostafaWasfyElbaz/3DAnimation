import { Model, HydratedDocument, Types } from "mongoose";
import { IProject, IProjectRepo, IGeometry, IModel } from "../../common";
import DBRepository from "./db.repository";
import { Project } from "../models/project.model";

export default class ProjectRepository
  extends DBRepository<IProject>
  implements IProjectRepo
{
  constructor(protected override readonly model: Model<IProject> = Project) {
    super(model);
  }

  createProject = async ({
    name,
    userId,
    scene,
  }: {
    name: string;
    userId: string;
    scene: IProject["scene"];
  }): Promise<{
    id: string;
    name: string;
  } | null> => {
    const existingProject = await this.model.findOne({ name, userId });
    if (existingProject) {
      return null;
    }
    const projects = await this.create({
      data: [{ name, userId: new Types.ObjectId(userId), scene }],
    });
    const project = projects[0] as HydratedDocument<IProject>;

    if (!project) {
      return null;
    }

    return {
      id: project._id.toString(),
      name: project.name,
    };
  };

  createModel = async ({
    projectId,
    userId,
    data,
  }: {
    projectId: string;
    userId: string;
    data: Partial<IModel>;
  }): Promise<HydratedDocument<IProject> | null> => {
    const project = await this.findOne({
      filter: { _id: projectId, userId },
      projection: { _id: 1 },
    });
    if (!project) {
      return null;
    }
    const model = await this.findOneAndUpdate({
      filter: { _id: projectId, userId },
      data: { $push: { models: data } },
    });
    if (!model) {
      return null;
    }

    return model;
  };

  getProjectById = async ({
    projectId,
    userId,
  }: {
    projectId: string;
    userId: string;
  }): Promise<HydratedDocument<IProject> | null> => {
    const project = await this.findOne({
      filter: { _id: projectId, userId },
      projection: {
        name: 1,
        _id: 1,
        geometries: 1,
        models: 1,
        scene: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });
    if (!project) {
      return null;
    }
    return project;
  };

  getAllProjects = async ({
    userId,
  }: {
    userId: string;
  }): Promise<HydratedDocument<IProject>[] | null> => {
    const projects = await this.find({
      filter: { userId },
      projection: { name: 1, _id: 1 },
    });
    if (!projects) {
      return null;
    }
    return projects;
  };

  deleteProject = async ({
    projectId,
    userId,
  }: {
    projectId: string;
    userId: string;
  }): Promise<boolean> => {
    const result = await this.deleteOne({
      filter: { _id: projectId, userId },
    });
    return result.deletedCount === 1;
  };

  updateProject = async ({
    projectId,
    userId,
    data,
    toDelete,
  }: {
    projectId: string;
    data: {
      projectName?: string;
      geometries?: IGeometry[];
      models?: IModel[];
      scene?: IProject["scene"];
    };
    userId: string;
    toDelete?: { _id: string; url: string }[];
  }): Promise<HydratedDocument<IProject> | null> => {
    const project = await this.findOne({ filter: { _id: projectId, userId } });

    if (!project) {
      return null;
    }
    if (data.projectName) project.name = data.projectName;
    if (data.geometries) project.geometries = data.geometries;
    if (data.scene) project.scene = data.scene;
    if (toDelete && toDelete.length > 0 && project.models) {
      const idsToDelete = toDelete.map((m) => new Types.ObjectId(m._id));
      (project.models as any).pull(...idsToDelete);
    }
    if (data.models && data.models.length > 0 && project.models) {
      for (const item of data.models) {
        const modelToUpdate = project.models.find(
          (model: any) => model._id.toString() === item._id,
        );
        if (modelToUpdate) {
          modelToUpdate.attributes = item.attributes;
        }
      }
    }
    await project.save();

    return project;
  };
}
