import { ComponentDefinition, System } from "aframe";

import { BindableMethod } from "../shared/bind.decorator";
import { DataObject } from "../shared/types";

import { AbstractBaseComponent, GenericBaseComponent } from "./BaseComponent";

/** Convert a ComponentClass into a ComponentDefinition for Aframe. */
export function toComponent<
  D extends DataObject,
  S extends System,
  Class extends GenericBaseComponent<D, S>
>(ComponentClass: Class): ComponentDefinition<InstanceType<Class>> {
  const prototype = ComponentClass.prototype;

  /** The final component object. */
  const component = {
    schema: ComponentClass.schema,
    multiple: ComponentClass.multiple,
    dependencies: ComponentClass.dependencies,
  } as ComponentDefinition<InstanceType<Class>>;

  /** Methods to copy over to the object. */
  const methodKeys = Object.getOwnPropertyNames(
    prototype
  ) as (keyof InstanceType<Class>)[];

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

    // Pass new instance values to the component instance.
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
}

/** Attaches event listeners like Aframe does when a component is playing. */
export function attachEvents<D extends DataObject, S extends System>(
  component: AbstractBaseComponent<D, S>
): void {
  for (const eventName in component.events) {
    component.el.addEventListener(eventName, component.events[eventName]);
  }
}
