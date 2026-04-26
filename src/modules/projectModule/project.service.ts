import { NextFunction, Request, Response } from "express";
import { IProjectServices, ModelType } from "../../common";
import { ProjectRepository } from "../../DB";
import {
  createProjectDTO,
  deleteProjectDTO,
  getProjectByIdDTO,
  text2ModelDTO,
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
import { generateModel } from "../../utils/generateModel";

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

      if (!project) {
        throw new projectCreationFailed("dublicate name", 400);
      }

      if (!project.id || !project.name) {
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
            async (model: {
              _id: string;
              modelUrl: string;
              attributes: any;
            }) => {
              const preSignedModel = await this.s3Services.getModelUrl({
                fileKey: model.modelUrl,
              });
              return {
                _id: model._id,
                modelUrl: preSignedModel,
                attributes: model.attributes,
              };
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
      throw error;
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

      return successHandler({
        res,
        msg: "Projects fetched successfully",
        status: 200,
        data: { projects },
      });
    } catch (error) {
      throw new internalServerError();
    }
  };

  deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: deleteProjectDTO =
      req.params as unknown as deleteProjectDTO;
    const user = res.locals.user;
    try {
      const project = await this.projectRepo.getProjectById({
        projectId: projectId,
        userId: res.locals.user._id,
      });
      if (!project) {
        throw new projectNotFound();
      }
      if (!user.approved) {
        await this.s3Services.deleteFolder({
          Prefix: `${process.env.APP_NAME}/users/${user.approved ? "approved" : "notApproved"}/${res.locals.user._id}/${project.name}/`,
        });
      }

      const isDeleted = await this.projectRepo.deleteProject({
        projectId: projectId,
        userId: res.locals.user._id,
      });
      if (!isDeleted) {
        throw new projectNotFound("Failed to delete project", 400);
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
    const toDelete = [];
    const data = {};

    if (!models && !geometries && !projectName) {
      return successHandler({
        res,
        msg: "No changes made to the project",
      });
    }
    if (projectName) {
      Object.assign(data, { projectName });
    }
    if (geometries) {
      Object.assign(data, { geometries });
    }
    if (models) {
      Object.assign(data, { models });
    }

    const project = await this.projectRepo.getProjectById({
      projectId: projectId,
      userId: res.locals.user._id,
    });
    if (!project) {
      throw new projectNotFound();
    }

    const existingModels = project?.models?.map((model) => ({
      _id: model._id.toString(),
      url: model.modelUrl,
    }));

    if (models && existingModels) {
      toDelete.push(
        ...existingModels.filter(
          (model) => !models.some((m) => m._id === model._id.toString()),
        ),
      );
    }
    try {
      if (!user.approved && toDelete.length > 0) {
        await this.s3Services.deleteAssets({
          urls: toDelete.map((model) => model.url),
        });
      }
      const updatedProject = await this.projectRepo.updateProject({
        projectId: projectId,
        userId: user._id,
        data,
        toDelete,
      });
      if (!updatedProject) {
        throw new projectNotFound("Failed to update project", 400);
      }
      return successHandler({
        res,
        msg: "Project updated successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  Image2Model = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length !== 5) {
      return res.status(400).json({
        message: "Please upload exactly 5 images.",
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
      const model = await generateModel({ files, type: ModelType.Image });
      if (!model) {
        throw new modelCreationFailed();
      }
      const uploadedRawImages = await this.s3Services.uploadMultiFiles({
        files,
        Path: `${res.locals.approved ? "approved" : "notApproved"}/${res.locals.user._id}/${project.name}/raw-images`,
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
        Path: `${res.locals.approved ? "approved" : "notApproved"}/${res.locals.user._id}/${project.name}/models`,
      });

      if (!uploadedModel) {
        throw new internalServerError("Failed to upload model to S3.");
      }
      const getGlbFile = await this.s3Services.getModelUrl({
        fileKey: uploadedModel,
        expiresIn: 1200,
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
          _id: saveModel?.models?.[
            saveModel?.models?.length - 1
          ]?._id.toString(),
          modelUrl: getGlbFile,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  text2Model = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    const { prompt } = req.body as text2ModelDTO;
    try {
      const project = await this.projectRepo.getProjectById({
        projectId,
        userId: res.locals.user._id,
      });
      if (!project) {
        throw new projectNotFound();
      }
      const model = await generateModel({ prompt, type: ModelType.Text });
      if (!model) {
        throw new modelCreationFailed();
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
        Path: `${res.locals.approved ? "approved" : "notApproved"}/${res.locals.user._id}/${project.name}/models`,
      });

      if (!uploadedModel) {
        throw new internalServerError("Failed to upload model to S3.");
      }
      const getGlbFile = await this.s3Services.getModelUrl({
        fileKey: uploadedModel,
        expiresIn: 1200,
      });

      if (!getGlbFile) {
        throw new internalServerError("Failed to get model URL from S3.");
      }
      const saveModel = await this.projectRepo.createModel({
        projectId,
        userId: res.locals.user._id,
        data: {
          modelUrl: uploadedModel,
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
          _id: saveModel?.models?.[
            saveModel?.models?.length - 1
          ]?._id.toString(),
          modelUrl: getGlbFile,
        },
      });
    } catch (error) {
      throw error;
    }
  };
  uploadGlb = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const { projectId }: getProjectByIdDTO = req.params as getProjectByIdDTO;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length !== 1) {
      return res.status(400).json({
        message: "Please upload exactly 1 file.",
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
      const uploadedModel = await this.s3Services.uploadSingleFile({
        file: {
          fieldname: "model",
          originalname: "generated-model.glb",
          encoding: "7bit",
          mimetype: "model/gltf-binary",
          size: files[0]?.size,
          destination: "",
          filename: "",
          path: "",
          buffer: files[0]?.buffer,
        } as Express.Multer.File,
        Path: `${res.locals.approved ? "approved" : "notApproved"}/${res.locals.user._id}/${project.name}/models`,
      });
      if (!uploadedModel) {
        throw new internalServerError("Failed to upload model to S3.");
      }

      const saveModel = await this.projectRepo.createModel({
        projectId,
        userId: res.locals.user._id,
        data: {
          modelUrl: uploadedModel,
        },
      });
      if (!saveModel) {
        throw new internalServerError("Failed to save model to database.");
      }

      return successHandler({
        res,
        msg: "Model uploaded successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };
}
