import { Vector3 } from "three";
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

  initialized = false;
  vector = new Vector3(0, 0, 0);

  events = {
    click: (): void => {
      // Move forward on click.
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  init(): void {
    this.initialized = true;

    this.el.sceneEl?.addEventListener("some-event", this.onSceneEvent);
  }

  tick(time: number, deltaTime: number): void {
    if (this.data.enabled) {
      // Rotate 180 degrees every second.
      this.el.object3D.rotateZ(Math.PI * (deltaTime / 1000));
    }
  }

  getVectorX(): number {
    return this.vector.x;
  }

  onSceneEvent = (): void => {
    this.vector.setX(this.vector.x + 1);
  };
}

AFRAME.registerComponent("sample", toComponent(SampleComponent));
