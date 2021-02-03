/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Schema, ComponentDefinition, Entity } from "aframe";
import { Camera } from "three";

/** A fake base Aframe component class that defines the methods Aframe will inject into the component at runtime. */
declare class AbstractBaseComponent<D extends object = any> {
  el: Entity;

  schema: Schema<D>;
  /** Re-define the default schema values and types here. */
  data: D;
  dependencies?: string[];
  name: string;
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

type ComponentMethods<T> = Record<keyof T, any>;
type ComponentValues<T> = Record<keyof T, any>;

/** A class that describes the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class EmptyComponent {} as typeof AbstractBaseComponent;

interface GenericBaseComponent<D extends object> {
  new (): AbstractBaseComponent<D>;
}

export const toComponent = <D extends object>(
  ComponentClass: GenericBaseComponent<D>
): ComponentDefinition<AbstractBaseComponent<D>> => {
  const prototype = ComponentClass.prototype as InstanceType<
    typeof ComponentClass
  >;

  /** The final component object. */
  const component = {} as ComponentMethods<typeof prototype>;

  /** Values to be initialized, from static properties. */
  const initValues = {} as ComponentValues<typeof prototype>;

  const methodKeys = Object.getOwnPropertyNames(
    Object.getPrototypeOf(prototype)
  ) as (keyof typeof prototype | "constructor")[];

  const propertyKeys = Object.getOwnPropertyNames(
    prototype
  ) as (keyof typeof prototype)[];

  // Move methods onto the component object.
  methodKeys.forEach((key) => {
    if (key !== "constructor") {
      component[key] = prototype[key];
    }
  });

  // Remember
  propertyKeys.forEach((key) => {
    initValues[key] = prototype[key];
  });

  const onInit = prototype.init;

  component.init = function (data: D) {
    const instance = new ComponentClass();
    const initKeys = Object.keys(initValues) as (keyof typeof instance)[];

    initKeys.forEach((key) => {
      this[key] = instance[key];
    });

    if (onInit) {
      onInit.call(this, data);
    }
  };

  return component;
};
