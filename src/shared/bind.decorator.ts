import { DataObject } from "./types";

export interface BindableMethod extends Function {
  _bindToAframe?: boolean;
}

/** Property decorator to bind the method to the component instance. */
export function bind<T extends DataObject, K extends keyof T>(
  target: T,
  propertyKey: K,
  descriptor: TypedPropertyDescriptor<T[K]>
): void {
  if (typeof descriptor?.value !== "function") {
    throw new TypeError(
      `Only methods can be decorated with @bind. <${propertyKey}> is not a method!`
    );
  }

  (descriptor.value as BindableMethod)._bindToAframe = true;
}
