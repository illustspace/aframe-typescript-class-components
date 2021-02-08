import { registerComponent, System } from "aframe";

import {
  AbstractBaseComponent,
  BindableMethod,
  ComponentData,
  GenericBaseComponent,
} from "./BaseComponent";
import { toComponent } from "./toComponent";

/** Decorator to register the class as an Aframe component. */
export function component(name: string) {
  return function <
    D extends ComponentData,
    S extends System,
    Class extends GenericBaseComponent<D, S>
  >(target: Class): void {
    registerComponent(name, toComponent(target));
  };
}

/** Property decorator to bind the method to the component instance. */
export function bind<T extends AbstractBaseComponent, K extends keyof T>(
  target: T,
  propertyKey: K,
  descriptor: TypedPropertyDescriptor<T[K]>
): void {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new TypeError(
      `Only methods can be decorated with @bind. <${propertyKey}> is not a method!`
    );
  }

  (descriptor.value as BindableMethod)._bindToAframe = true;
}
