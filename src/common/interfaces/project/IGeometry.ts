import { UUIDTypes } from "uuid";

export interface IGeometry {
  uuid: UUIDTypes;
  name: string;
  type: string;
  attributes: any;
  createdAt: Date;
  updatedAt: Date;
}
