/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

import { Schema, ComponentDefinition } from "aframe";
import { AbstractBaseComponent } from "./AbstractBaseComponent";

type ComponentMethods<T> = Record<keyof T, any> & { schema: Schema };
type ComponentValues<T> = Record<keyof T, any>;

/** A fake base Aframe component that defines the methods Aframe will inject into the component at runtime. */
export const BaseComponent = class EmptyComponent {} as typeof AbstractBaseComponent;

interface GenericBaseComponent<D extends object> {
  new (): AbstractBaseComponent<D>;
  schema: Schema;
}

export const toComponent = <D extends object>(
  ComponentClass: GenericBaseComponent<D>
): ComponentDefinition<AbstractBaseComponent<D>> => {
  const instance = new ComponentClass();

  /** The final component object. */
  const component = {
    schema: ComponentClass.schema,
  } as ComponentMethods<typeof instance>;

  /** Values to be initialized, from static properties. */
  const initValues = {} as ComponentValues<typeof instance>;

  const methodKeys = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance)
  ) as (keyof typeof instance | "constructor")[];

  const propertyKeys = Object.getOwnPropertyNames(
    instance
  ) as (keyof typeof instance)[];

  methodKeys.forEach((key) => {
    if (key !== "constructor") {
      component[key] = instance[key];
    }
  });

  propertyKeys.forEach((key) => {
    if (key !== "data" && key !== "el") {
      initValues[key] = instance[key];
    }
  });

  const onInit = instance.init;

  component.init = function (data: D) {
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
