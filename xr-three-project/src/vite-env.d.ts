/// <reference types="vite/client" />

declare module "*.glb" {
    const value: string;
    export default value;
}

declare module 'troika-three-text' {
  import { Mesh, MeshBasicMaterial, BufferGeometry } from 'three';
  import { TextOptions } from 'troika-three-text/dist/TextBuilder';

  export class Text extends Mesh<BufferGeometry, MeshBasicMaterial> {
    constructor();
    text: string;
    anchorX: string | number;
    anchorY: string | number;
    color: string | number;
    maxWidth: number;
    fontSize: number;
    font: string;
    letterSpacing: number;
    lineHeight: number;
    outlineColor: string | number;
    outlineWidth: number;
    outlineBlur: number;
    outlineOffsetX: number;
    outlineOffsetY: number;
    strokeColor: string | number;
    strokeWidth: number;
    curveRadius: number;
    sync: () => void;
    [key: string]: any;
  }
}