import { BaseComponent } from "../src/.";

export interface SampleComponentData {
  enabled: boolean;
}

export class SampleComponent extends BaseComponent<SampleComponentData> {
  static schema = {
    enabled: { type: "boolean" },
  };

  someProperty = true;
  someObject: Record<string, string> = {};

  getSomeProperty() {
    return this.someProperty;
  }
}
