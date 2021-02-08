/* eslint-disable @typescript-eslint/no-explicit-any */

import { Schema, Entity, Component, System } from "aframe";
import { Camera } from "three";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
export declare class AbstractBaseComponent<
  T extends ComponentData = ComponentData,
  S extends System = System
> implements Component<T> {
  static schema: Schema;
  static multiple?: boolean;
  /** If not false, bind the events object to the component instance. */
  static bindEvents?: boolean;

  attrName?: string;
  data: T;
  dependencies?: string[];
  el: Entity;
  id: string;
  initialized: boolean;
  multiple?: boolean;
  name: string;
  schema: Schema<T>;
  system: S | undefined;
  events?: Record<string, (...args: any[]) => any>;

  init(data?: T): void;
  pause(): void;
  play(): void;
  remove(): void;
  tick?(time: number, timeDelta: number): void;
  tock?(time: number, timeDelta: number, camera: Camera): void;
  update(oldData: T): void;
  updateSchema?(): void;

  extendSchema(update: Schema): void;
  flushToDOM(): void;
}

/** The properties that must be set before component initialization. */
interface StaticComponentProperties<D extends ComponentData = any> {
  schema: Schema<D>;
  multiple?: boolean;
  bindEvents?: boolean;
}

export interface BindableMethod extends Function {
  _bindToAframe?: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ComponentData = object;

/** A class that describes the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class {} as typeof AbstractBaseComponent;

/** Describes a component class with generic data and system. */
export interface GenericBaseComponent<
  D extends ComponentData = any,
  S extends System = System
> extends StaticComponentProperties {
  new (): AbstractBaseComponent<D, S>;
}
