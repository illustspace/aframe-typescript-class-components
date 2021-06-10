import {
  Component,
  ComponentDefinition,
  Scene,
  System,
  SystemDefinition,
} from "aframe";
import { Object3D } from "three";

import { GenericBaseComponent } from "../component/BaseComponent";
import { attachEvents, toComponent } from "../component/toComponent";

import { DataObject } from "./types";
import { toSystem } from "../system/toSystem";
import { GenericBaseSystem } from "../system/BaseSystem";

/**
 * Given a component instance, inject common properties, attach event listeners
 * and call init. Used for testing.
 */
export function initializeComponentInstance<
  D extends DataObject,
  S extends System,
  Comp extends Component<D, S>
>(component: Comp, initialData: D): ComponentDefinition<Comp> {
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
}

/**
 * Given a component class, create an initialized component instance.
 * Used for testing.
 */
export function initializeTestComponent<
  D extends DataObject,
  S extends System,
  Class extends GenericBaseComponent<D, S>
>(ComponentClass: Class, initialData: D): InstanceType<Class> {
  const component = toComponent(ComponentClass);

  const instance = Object.create(component);

  return initializeComponentInstance(instance, initialData);
}

/**
 * Given a system instance, inject common properties, attach event listeners
 * and call init. Used for testing.
 */
export function initializeSystemInstance<
  D extends DataObject,
  Sys extends System<D>
>(system: Sys, initialData?: D): SystemDefinition<Sys> {
  system.el = document.createElement("a-scene") as Scene;

  // Initialize with initial data.
  if (initialData) {
    system.data = initialData;
  }

  system.init();

  return system;
}

/**
 * Given a system class, create an initialized system instance.
 * Used for testing.
 */
export function initializeTestSystem<
  D extends DataObject,
  Class extends GenericBaseSystem<D>
>(SystemClass: Class, initialData: D): InstanceType<Class> {
  const system = toSystem(SystemClass);

  const instance = Object.create(system);

  return initializeSystemInstance(instance, initialData);
}
