import {
  BaseComponent,
  toComponent,
} from "../src/aframe-typescript-class-components";

export interface SampleComponentData {
  enabled: boolean;
}

export class SampleComponent extends BaseComponent<SampleComponentData> {
  static schema = {
    enabled: { type: "boolean" as const, default: true },
  };
  static multiple = true;

  events = {
    click: (): void => {
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  someProperty = true;
  someObject: Record<string, string> = {};
  initialized = false;

  init(): void {
    this.initialized = true;
  }

  tick(_time: number, _deltaTime: number): void {
    // do something on tick.
  }

  getSomeProperty(): boolean {
    return this.someProperty;
  }
}

AFRAME.registerComponent("sample", toComponent(SampleComponent));
