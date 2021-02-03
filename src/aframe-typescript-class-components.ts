/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Schema, ComponentDefinition, Entity } from "aframe";
import { Camera } from "three";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
declare class AbstractBaseComponent<D extends object = any> {
  static schema: Schema;

  el: Entity;
  data: D;
  dependencies?: string[];
  name: string;
  events: Record<string, (event: any) => void>;

  init(_data: D): void;
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

type ComponentObject<T> = Record<keyof T, any> & { schema: Schema };

/** A class that describes the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class EmptyComponent {} as typeof AbstractBaseComponent;

interface GenericBaseComponent<D extends object> {
  new (): AbstractBaseComponent<D>;
  schema: Schema<D>;
}

export const toComponent = <D extends object>(
  ComponentClass: GenericBaseComponent<D>
): ComponentDefinition<AbstractBaseComponent<D>> => {
  const prototype = ComponentClass.prototype as InstanceType<
    typeof ComponentClass
  >;

  /** The final component object. */
  const component = { schema: ComponentClass.schema } as ComponentObject<
    typeof prototype
  >;

  /** Methods to copy over to the object. */
  const methodKeys = Object.getOwnPropertyNames(prototype) as (
    | keyof typeof prototype
    | "constructor"
  )[];

  // Move methods onto the component object.
  methodKeys.forEach((key) => {
    if (key !== "constructor") {
      component[key] = prototype[key];
    }
  });

  /** A reference to the original init method, to be called after property initialization. */
  const onInit = prototype.init;

  // Override the init method to make a new instance of the class, and pass the properties to the component.
  component.init = function (data: D) {
    const instance = new ComponentClass();

    const propertyKeys = Object.getOwnPropertyNames(
      instance
    ) as (keyof typeof instance)[];

    // Remember
    propertyKeys.forEach((key) => {
      this[key] = instance[key];
    });

    if (onInit) {
      onInit.call(this, data);
    }
  };

  return component;
};
