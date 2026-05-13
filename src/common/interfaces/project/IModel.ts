export interface IModel {
  _id: string;
  rawImagesUrls: string[];
  modelUrl: string;
  attributes: {
    uuid: string;
    name: string;
    type: string;
    visible?: boolean;
    isLocked?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
    position?: {
      x: number;
      y: number;
      z: number;
    };
    rotation?: {
      x: number;
      y: number;
      z: number;
    };
    scale?: {
      x: number;
      y: number;
      z: number;
    };
    size?: {
      x: number;
      y: number;
      z: number;
    };
    material?: {
      type: string;
      color?: string;
      props?: {
        opacity?: number;
        transparent?: boolean;
        roughness?: number;
        metalness?: number;
        wireframe?: boolean;
        emissive?: string;
      };
    };
  };
}
