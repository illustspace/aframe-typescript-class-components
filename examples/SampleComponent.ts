import { BaseComponent } from "../src/aframe-typescript-class-components";

export interface SampleComponentData {
  enabled: boolean;
}

export class SampleComponent extends BaseComponent<SampleComponentData> {
  static schema = {
    enabled: { type: "boolean" },
  };

  someProperty = true;
  someObject: Record<string, string> = {};

  getSomeProperty(): boolean {
    return this.someProperty;
  }
}
