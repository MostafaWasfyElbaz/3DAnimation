import { NextFunction, Request, Response } from "express";
import { IProjectServices } from "../../common";
import { ProjectRepository } from "../../DB";
import {
  createProjectDTO,
  deleteProjectDTO,
  getProjectByIdDTO,
  updateProjectDTO,
} from "./project.dto";
import {
  modelCreationFailed,
  internalServerError,
  projectCreationFailed,
  projectNotFound,
  S3Services,
  successHandler,
} from "../../utils";
import { generateModel } from "../../utils/image2model";

export default class ProjectService implements IProjectServices {
  private projectRepo: ProjectRepository;
  private s3Services: S3Services;
  constructor() {
    this.projectRepo = new ProjectRepository();
    this.s3Services = new S3Services();
  }

  createProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { name }: createProjectDTO = req.body;

    const user = res.locals.user;
    try {
      const project = await this.projectRepo.createProject({
        name,
        userId: user._id,
      });

      if (!project?.id || !project?.name) {
        throw new projectCreationFailed();
      }

      return successHandler({
        res,
        msg: "Project created successfully",
        status: 201,
        data: { _id: project.id, name: project.name },
      });
    } catch (error) {
      throw error;
    }
  };

  getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    try {
      const project = await this.projectRepo.getProjectById({
        projectId: projectId,
        userId: res.locals.user._id,
      });
      if (!project) {
        throw new projectNotFound();
      }
      const projectData = (project as { toObject: () => any }).toObject();
      if (project?.models) {
        const models = await Promise.all(
          projectData.models.map(
            async (model: { _id: string; modelUrl: string }) => {
              const preSignedModel = await this.s3Services.getModelUrl({
                fileKey: model.modelUrl,
              });
              return { _id: model._id, modelUrl: preSignedModel };
            },
          ),
        );
        Object.assign(projectData, { models });
      }

      return successHandler({
        res,
        msg: "Project found successfully",
        status: 200,
        data: { project: projectData },
      });
    } catch (error) {
      throw next(error);
    }
  };

  getAllProjects = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    try {
      const projects = await this.projectRepo.getAllProjects({
        userId: res.locals.user._id,
      });
      if (!projects) {
        successHandler({
          res,
          msg: "No projects found",
          status: 200,
          data: { projects: [] },
        });
      }
      return successHandler({
        res,
        msg: "Projects fetched successfully",
        status: 200,
        data: { projects },
      });
    } catch (error) {
      next(error);
      return res;
    }
  };

  deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: deleteProjectDTO =
      req.params as unknown as deleteProjectDTO;
    try {
      const project = await this.projectRepo.getProjectById({
        projectId: projectId,
        userId: res.locals.user._id,
      });
      if (!project) {
        throw new projectNotFound();
      }
      if (!res.locals.user.approved) {
        const projectData = (project as { toObject: () => any }).toObject();
        const models = projectData.models ?? [];

        const modelKeys = models
          .map((model: { modelUrl?: string }) => model.modelUrl)
          .filter((key: string | undefined): key is string => Boolean(key));

        const rawImageKeys = models
          .reduce(
            (acc: string[], model: { rawImagesUrls?: string[] }) => [
              ...acc,
              ...(model.rawImagesUrls ?? []),
            ],
            [],
          )
          .filter((key: string | undefined): key is string => Boolean(key));

        const keysToDelete = Array.from(
          new Set([...modelKeys, ...rawImageKeys]),
        );

        if (keysToDelete.length) {
          await this.s3Services.deleteAssets({
            urls: keysToDelete,
          });
        }
      }

      const isDeleted = await this.projectRepo.deleteProject({
        projectId: projectId,
        userId: res.locals.user._id,
      });
      if (!isDeleted) {
        throw new projectNotFound();
      }
      return successHandler({
        res,
        msg: "Project deleted successfully",
        status: 200,
        data: {},
      });
    } catch (error) {
      throw error;
    }
  };

  updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    const { geometries, projectName, models }: updateProjectDTO = req.body;
    const user = res.locals.user;
    const project = await this.projectRepo.getProjectById({
      projectId: projectId,
      userId: res.locals.user._id,
    });
    if (!project) {
      throw new projectNotFound();
    }
    const existingModels = project?.models?.map((model) => ({
      _id: model._id.toString(),
    }));
    const toDelete = [];
    const data = {};
    if (projectName) {
      Object.assign(data, { projectName });
    }
    if (geometries) {
      Object.assign(data, { geometries });
    }
    if (!models && !geometries && !projectName) {
      return successHandler({
        res,
        msg: "No changes made to the project",
      });
    }
    if (models && existingModels) {
      toDelete.push(
        ...existingModels.filter(
          (model) => !models.some((id) => id === model._id.toString()),
        ),
      );
    }

    try {
      const updatedProject = await this.projectRepo.updateProject({
        projectId: projectId,
        userId: user._id,
        data,
        toDelete,
      });
      if (!updatedProject) {
        throw new projectNotFound();
      }
      return successHandler({
        res,
        msg: "Project updated successfully",
        status: 200,
        data: { project: updatedProject },
      });
    } catch (error) {
      throw new internalServerError();
    }
  };

  Image2Model = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 3 || files.length > 5) {
      return res.status(400).json({
        message: "Please upload between 3 and 5 images.",
      });
    }
    try {
      const project = await this.projectRepo.getProjectById({
        projectId,
        userId: res.locals.user._id,
      });
      if (!project) {
        throw new projectNotFound();
      }
      const model = await generateModel({ files });
      if (!model) {
        throw new modelCreationFailed();
      }
      const uploadedRawImages = await this.s3Services.uploadMultiFiles({
        files,
        Path: `${res.locals.user._id}/raw-images`,
      });

      if (!uploadedRawImages || uploadedRawImages.length !== files.length) {
        throw new internalServerError("Failed to upload raw images to S3.");
      }
      const uploadedModel = await this.s3Services.uploadSingleFile({
        file: {
          fieldname: "model",
          originalname: "generated-model.glb",
          encoding: "7bit",
          mimetype: "model/gltf-binary",
          size: model.length,
          destination: "",
          filename: "",
          path: "",
          buffer: model,
        } as Express.Multer.File,
        Path: `${res.locals.user._id}/models`,
      });

      if (!uploadedModel) {
        throw new internalServerError("Failed to upload model to S3.");
      }
      const getGlbFile = await this.s3Services.getModelUrl({
        fileKey: uploadedModel,
      });

      if (!getGlbFile) {
        throw new internalServerError("Failed to get model URL from S3.");
      }

      const saveModel = await this.projectRepo.createModel({
        projectId,
        userId: res.locals.user._id,
        data: {
          modelUrl: uploadedModel,
          rawImagesUrls: uploadedRawImages,
        },
      });

      if (!saveModel) {
        throw new internalServerError("Failed to save model to database.");
      }

      return successHandler({
        res,
        msg: "Model created successfully",
        status: 200,
        data: {
          _id: saveModel.models
            ? saveModel?.models[saveModel?.models.length - 1]?._id
            : "",
          modelUrl: getGlbFile,
        },
      });
    } catch (error) {
      throw error;
    }
  };
}
