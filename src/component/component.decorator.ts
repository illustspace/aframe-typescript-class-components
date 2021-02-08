import { registerComponent, System } from "aframe";

import { DataObject } from "shared/types";
import { toComponent } from "component/toComponent";

import { GenericBaseComponent } from "./BaseComponent";

/** Decorator to register the class as an Aframe component. */
export function component(name: string) {
  return function <
    D extends DataObject,
    S extends System,
    Class extends GenericBaseComponent<D, S>
  >(target: Class): void {
    registerComponent(name, toComponent(target));
  };
}
