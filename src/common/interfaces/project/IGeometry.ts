export interface IGeometry {
  uuid: string;
  geometryType: string;
  name: string;
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
      roughness?: number;
      metalness?: number;
      wireframe?: boolean;
      shininess?: number;
      transmission?: number;
      clearcoat?: number;
      clearcoatRoughness?: number;
      thickness?: number;
      ior?: number;
    };
  };
}
