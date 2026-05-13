import z from "zod";
import { generalValidation } from "../../utils";
import { IGeometry, IProject, Model } from "../../common";

const sceneSchema = z.strictObject({
  backgroundColor: z.string(),
  fog: z
    .strictObject({
      type: z.string(),
      color: z.string(),
      density: z.number(),
      near: z.number(),
      far: z.number(),
    })
    .optional(),
  lights: z
    .array(
      z.strictObject({
        id: z.string(),
        type: z.string(),
        color: z.string(),
        intensity: z.number(),
        position: z.strictObject({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }),
      }),
    )
    .optional(),
});

export const createProjectSchema = z.object({
  name: generalValidation.name,
  scene: sceneSchema.optional() as z.ZodType<IProject["scene"]>,
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

const geometrySchema = z.strictObject({
  uuid: generalValidation.uuid,
  geometryType: z.string(),
  name: generalValidation.name,
  visible: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  castShadow: z.boolean().optional(),
  receiveShadow: z.boolean().optional(),
  position: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  rotation: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  scale: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  size: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  material: z
    .strictObject({
      type: z.string(),
      color: z.string().optional(),
      props: z
        .strictObject({
          opacity: z.number().optional(),
          roughness: z.number().optional(),
          metalness: z.number().optional(),
          wireframe: z.boolean().optional(),
          shininess: z.number().optional(),
          transmission: z.number().optional(),
          clearcoat: z.number().optional(),
          clearcoatRoughness: z.number().optional(),
          thickness: z.number().optional(),
          ior: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});

const attributesSchema = z.strictObject({
  uuid: generalValidation.uuid,
  name: generalValidation.name,
  type: z.string(),
  visible: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  castShadow: z.boolean().optional(),
  receiveShadow: z.boolean().optional(),
  position: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  rotation: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  scale: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  size: z
    .strictObject({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  material: z
    .strictObject({
      type: z.string(),
      color: z.string().optional(),
      props: z
        .strictObject({
          opacity: z.number().optional(),
          transparent: z.boolean().optional(),
          roughness: z.number().optional(),
          metalness: z.number().optional(),
          wireframe: z.boolean().optional(),
          emissive: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const updateProjectSchema = z.object({
  geometries: z.array(geometrySchema).optional() as z.ZodType<IGeometry[]>,
  projectName: generalValidation.name.optional(),
  models: z
    .array(
      z.object({
        _id: generalValidation.id,
        attributes: attributesSchema,
      }),
    )
    .optional(),
  scene: sceneSchema.optional(),
});

export const text2ModelSchema = z.object({
  prompt: z.string().min(1).max(500),
});

export const uploadGlbSchema = z.object({
  files: generalValidation
    .files({ fieldName: "model", Types: Object.values(Model) })
    .max(1),
});
