import { Vector3 } from "three";

import { BaseSystem } from "../src/system/BaseSystem";
import { system } from "../src/system/system.decorator";
import { bind } from "../src/shared/bind.decorator";

export interface SampleSystemData {
  enabled: boolean;
  name: string;
}

@system("sample")
export class SampleSystem extends BaseSystem<SampleSystemData> {
  static schema = {
    enabled: { type: "boolean" as const, default: true },
  };

  vector = new Vector3(0, 0, 0);

  init(): void {
    this.el.addEventListener("some-event", this.onSceneEvent);
  }

  @bind
  onSceneEvent(): void {
    this.vector.setX(this.vector.x + 1);
  }
}
