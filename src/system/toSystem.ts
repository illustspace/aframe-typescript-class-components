import { SystemDefinition } from "aframe";

import { BindableMethod } from "../shared/bind.decorator";
import { DataObject } from "../shared/types";

import { GenericBaseSystem } from "./BaseSystem";

/** Convert a SystemClass into a SystemDefinition for Aframe. */
export function toSystem<
  D extends DataObject,
  Class extends GenericBaseSystem<D>
>(SystemClass: Class): SystemDefinition<InstanceType<Class>> {
  const prototype = SystemClass.prototype;

  /** The final system object. */
  const system = {
    schema: SystemClass.schema,
  } as SystemDefinition<InstanceType<Class>>;

  /** Methods to copy over to the object. */
  const methodKeys = Object.getOwnPropertyNames(
    prototype
  ) as (keyof InstanceType<Class>)[];

  // Move methods onto the system object.
  methodKeys.forEach((key) => {
    if (key !== "constructor") {
      system[key] = prototype[key];
    }
  });

  /** A reference to the original init method, to be called after property initialization. */
  const onInit: () => void = prototype.init;

  // Override the init method to make a new instance of the class, and pass the properties to the system.
  system.init = function () {
    const instance = new SystemClass() as InstanceType<Class>;

    const propertyKeys = Object.getOwnPropertyNames(
      instance
    ) as (keyof InstanceType<Class>)[];

    // Pass new instance values to the system instance.
    propertyKeys.forEach((key) => {
      this[key] = instance[key];
    });

    // Bind any methods marked with @bind.
    methodKeys.forEach((key) => {
      const method = (this[key] as unknown) as BindableMethod;
      if (method._bindToAframe && typeof method === "function") {
        this[key] = method.bind(this);
      }
    });

    if (onInit) {
      onInit.call(this);
    }
  };

  return system;
}
