import { Schema, Entity, Component, System } from "aframe";
import { Camera } from "three";

import { DataObject } from "shared/types";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
export declare class AbstractBaseComponent<
  D extends DataObject = DataObject,
  S extends System = System
> implements Component<D, S> {
  static schema: Schema;
  static multiple?: boolean;
  /** If not false, bind the events object to the component instance. */
  static bindEvents?: boolean;

  attrName?: string;
  data: D;
  dependencies?: string[];
  el: Entity;
  id: string;
  initialized: boolean;
  multiple?: boolean;
  name: string;
  schema: Schema<D>;
  system: S | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events?: Record<string, (...args: any[]) => any>;

  init(data?: D): void;
  pause(): void;
  play(): void;
  remove(): void;
  tick?(time: number, timeDelta: number): void;
  tock?(time: number, timeDelta: number, camera: Camera): void;
  update(oldData: D): void;
  updateSchema?(): void;

  extendSchema(update: Schema): void;
  flushToDOM(): void;
}

/** The properties that must be set before component initialization. */
interface StaticComponentProperties<D extends DataObject = DataObject> {
  schema: Schema<D>;
  multiple?: boolean;
  bindEvents?: boolean;
}

/** A class that describes the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class {
  static schema = {};
} as typeof AbstractBaseComponent;

/** Describes a component class with generic data and system. */
export interface GenericBaseComponent<
  D extends DataObject = DataObject,
  S extends System = System
> extends StaticComponentProperties {
  new (): AbstractBaseComponent<D, S>;
}
