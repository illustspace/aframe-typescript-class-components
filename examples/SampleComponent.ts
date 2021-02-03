import { BaseComponent } from "../src/aframe-typescript-class-components";

export interface SampleComponentData {
  enabled: string;
}

export class SampleComponent extends BaseComponent<SampleComponentData> {
  static schema = {
    enabled: { type: "boolean", default: true },
  };

  someProperty = true;
  someObject: Record<string, string> = {};
  initialized = false;

  init(): void {
    this.initialized = true;
  }

  getSomeProperty(): boolean {
    return this.someProperty;
  }
}
