import { UUIDTypes } from "uuid";

export interface IGeometry {
  uuid: UUIDTypes;
  name: string;
  type: string;
  parameters: any;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
    _order: string;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  color: {
    r: number;
    g: number;
    b: number;
  };
  opacity: number;
  createdAt: Date;
  updatedAt: Date;
}
