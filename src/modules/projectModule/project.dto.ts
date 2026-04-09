import z from "zod";
import {
  createProjectSchema,
  deleteProjectSchema,
  getProjectByIdSchema,
  Image2ModelSchema,
  updateProjectSchema,
} from "./project.validation";

export type createProjectDTO = z.infer<typeof createProjectSchema>;
export type getProjectByIdDTO = z.infer<typeof getProjectByIdSchema>;
export type deleteProjectDTO = z.infer<typeof deleteProjectSchema>;
export type Image2ModelDTO = z.infer<typeof Image2ModelSchema>;
export type updateProjectDTO = z.infer<typeof updateProjectSchema>;
