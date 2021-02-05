/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import {
  Schema,
  ComponentDefinition,
  Entity,
  Component,
  System,
  Scene,
} from "aframe";
import { Camera, Object3D } from "three";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
declare class AbstractBaseComponent<
  T extends object = any,
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
interface StaticComponentProperties<D extends object = any> {
  schema: Schema<D>;
  multiple?: boolean;
  bindEvents?: boolean;
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

    // Bind evens to the component instance.
    if (ComponentClass.bindEvents !== false) {
      for (const eventName in this.events) {
        this.events[eventName] = this.events[eventName].bind(this);
      }
    }
  };

  return component;
};

/** Attaches event listeners like Aframe does when a component is playing. */
export const attachEvents = (component: AbstractBaseComponent): void => {
  for (const eventName in component.events) {
    component.el.addEventListener(eventName, component.events[eventName]);
  }
};

/**
 * Convert a component class to an Aframe component, inject common properties,
 * and call init. Used for testing.
 */
export const initializeTestComponent = <
  D extends object,
  S extends System,
  Class extends GenericBaseComponent<D, S>
>(
  ComponentClass: Class,
  initialData: D
): ComponentDefinition<InstanceType<Class>> => {
  const component = toComponent(ComponentClass);

  // Set up a valid element.
  component.el = document.createElement("a-entity");
  component.el.object3D = new Object3D();
  component.el.sceneEl = document.createElement("a-scene") as Scene;

  // Initialize with initial data.
  component.data = initialData;
  component.init(initialData);

  // Attach event listeners as if the component was playing.
  attachEvents(component);

  return component;
};
