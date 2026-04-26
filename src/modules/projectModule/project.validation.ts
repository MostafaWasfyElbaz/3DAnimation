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
  files: generalValidation.files({ fieldName: "images" }).min(5).max(5),
});

const geometrySchema = z.object({
  uuid: z.uuid().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  parameters: z.any().optional(),
  position: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional(),
    })
    .optional(),
  rotation: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional(),
      _order: z.string().optional(),
    })
    .optional(),
  scale: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional(),
    })
    .optional(),
  color: z
    .object({
      r: z.number().optional(),
      g: z.number().optional(),
      b: z.number().optional(),
    })
    .optional(),
  opacity: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const updateProjectSchema = z.object({
  geometries: z.array(geometrySchema).optional() as z.ZodType<IGeometry[]>,
  projectName: generalValidation.name.optional(),
  models: z
    .array(
      z.object({
        _id: generalValidation.id,
        attributes: z.any(),
      }),
    )
    .optional(),
});
