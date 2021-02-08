import { Component, ComponentDefinition, Scene, System } from "aframe";
import { Object3D } from "three";

import { ComponentData, GenericBaseComponent } from "./BaseComponent";
import { attachEvents, toComponent } from "./toComponent";

/**
 * Given a component instance, inject common properties, attach event listeners
 * and call init. Used for testing.
 */
export function initializeComponentInstance<
  D extends ComponentData,
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
  D extends ComponentData,
  S extends System,
  Class extends GenericBaseComponent<D, S>
>(ComponentClass: Class, initialData: D): InstanceType<Class> {
  const component = toComponent(ComponentClass);

  const instance = Object.create(component);

  return initializeComponentInstance(instance, initialData);
}
