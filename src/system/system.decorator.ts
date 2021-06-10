import { registerSystem } from "aframe";

import { DataObject } from "../shared/types";

import { GenericBaseSystem } from "./BaseSystem";
import { toSystem } from "./toSystem";

/** Decorator to register a class as an Aframe system. */
export function system(name: string) {
  return function <D extends DataObject, Class extends GenericBaseSystem<D>>(
    target: Class
  ): void {
    registerSystem(name, toSystem(target));
  };
}
