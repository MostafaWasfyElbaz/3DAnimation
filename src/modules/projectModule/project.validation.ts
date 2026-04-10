import z from "zod";
import { generalValidation } from "../../utils";
import { IGeometry } from "../../common";

export const createProjectSchema = z.object({
  name: generalValidation.name,
});

export const getProjectByIdSchema = z.object({
  projectId: generalValidation.id,
});

export const deleteProjectSchema = z.object({
  projectId: generalValidation.id,
});

export const Image2ModelSchema = z.object({
  files: generalValidation.files({ fieldName: "images" }).min(3).max(5),
});

const geometrySchema = z.object({
  isObject3D: z.boolean().optional(),
  uuid: z.uuid().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  attributes: z.any(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const updateProjectSchema = z.object({
  geometries: z.array(geometrySchema).optional() as z.ZodType<IGeometry[]>,
  projectName: generalValidation.name.optional(),
  models: z.array(generalValidation.id).optional(),
});
