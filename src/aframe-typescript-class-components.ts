/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Schema, ComponentDefinition, Entity, Component, System } from "aframe";
import { Camera } from "three";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
declare class AbstractBaseComponent<
  T extends object = any,
  S extends System = System
> implements Component<T> {
  static schema: Schema;
  static multiple?: boolean;

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

  /** Register event listeners. */
  registerEvents(): Record<string, (...args: any[]) => any>;

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
interface StaticComponentProperties<D extends object = any> {
  schema: Schema<D>;
  multiple?: boolean;
}

/** A class that describes the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class EmptyComponent {} as typeof AbstractBaseComponent;

/** Describes a component class with generic data and system. */
interface GenericBaseComponent<
  D extends object = any,
  S extends System = System
> extends StaticComponentProperties {
  new (): AbstractBaseComponent<D, S>;
}

/** Convert a ComponentClass into a ComponentDefinition for Aframe. */
export const toComponent = <
  D extends object,
  S extends System,
  Class extends GenericBaseComponent<D, S>
>(
  ComponentClass: Class
): ComponentDefinition<InstanceType<Class>> => {
  const prototype = ComponentClass.prototype;

  /** The final component object. */
  const component = {
    schema: ComponentClass.schema,
    multiple: ComponentClass.multiple,
  } as ComponentDefinition<InstanceType<Class>>;

  /** Methods to copy over to the object. */
  const methodKeys = Object.getOwnPropertyNames(prototype) as (
    | keyof InstanceType<Class>
    | "constructor"
  )[];

  // Move methods onto the component object.
  methodKeys.forEach((key) => {
    if (key !== "constructor") {
      component[key] = prototype[key];
    }
  });

  /** A reference to the original init method, to be called after property initialization. */
  const onInit: (data: D) => void = prototype.init;

  // Override the init method to make a new instance of the class, and pass the properties to the component.
  component.init = function (data: D) {
    const instance = new ComponentClass() as InstanceType<Class>;

    const propertyKeys = Object.getOwnPropertyNames(
      instance
    ) as (keyof InstanceType<Class>)[];

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
