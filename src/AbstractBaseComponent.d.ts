/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Entity, Schema } from "aframe";
import { Camera } from "three";

/** A fake base Aframe component that defines the methods Aframe will inject into the component at runtime. */
export class AbstractBaseComponent<D extends object = any> {
  el: Entity = {} as Entity;

  schema: Schema<D>;
  /** Re-define the default schema values and types here. */
  data = {} as D;
  dependencies?: string[];
  name;
  events: Record<string, (event: any) => void>;

  init(_data: D): void;
  pause(): void;
  play(): void;
  remove(): void;
  tick?(_time: number, _timeDelta: number): void;
  tock?(_time: number, _timeDelta: number, _camera: Camera): void;
  update(_oldData: D): void;
  updateSchema?(): void;

  extendSchema(_update: Schema): void;
  flushToDOM(): void;
}
