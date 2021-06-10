import { Entity, Schema, System } from "aframe";
import { AnyData, UnknownData } from "../component/BaseComponent";

import { DataObject } from "../shared/types";

/** A fake base Aframe system class that defines the methods Aframe will inject into the system at runtime. */
export declare class AbstractBaseSystem<D extends DataObject = UnknownData>
  implements System<D> {
  static schema: Schema<AnyData>;

  data: D;
  schema: Schema<D>;
  el: Entity;

  init(): void;
  pause(): void;
  play(): void;
  tick?(time: number, timeDelta: number): void;
}

/** The properties that must be set before system initialization. */
interface StaticSystemProperties<D extends DataObject = DataObject> {
  schema: Schema<D>;
}

/** A class that describes the methods Aframe will inject into the system at runtime. */
export const BaseSystem = class {
  static schema = {};
} as typeof AbstractBaseSystem;

/** Describes a system class with generic data and system. */
export interface GenericBaseSystem<D extends DataObject = DataObject>
  extends StaticSystemProperties<D> {
  new (): AbstractBaseSystem<D>;
}
