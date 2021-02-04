/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentConstructor, ComponentDefinition } from "aframe";

global.AFRAME = {
  registerComponent: (_name: string, _component: ComponentDefinition) =>
    ({} as ComponentConstructor<any>),
} as any;
