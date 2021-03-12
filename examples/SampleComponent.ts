import { Schema } from "aframe";
import { Vector3 } from "three";

import { BaseComponent } from "../src/component/BaseComponent";
import { component } from "../src/component/component.decorator";
import { bind } from "../src/shared/bind.decorator";
import { SampleSystem } from "./SampleSystem";

export interface SampleComponentData {
  enabled: boolean;
  name: string;
}

@component("sample")
export class SampleComponent extends BaseComponent<
  SampleComponentData,
  SampleSystem
> {
  static schema: Schema<SampleComponentData> = {
    enabled: { type: "boolean", default: true },
    name: { type: "string", default: "" },
  };
  static multiple = true;

  greeting!: string;
  vector = new Vector3(0, 0, 0);

  events = {
    click(this: SampleComponent): void {
      // Move forward on click.
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  init(): void {
    this.greeting = `Hello, ${this.data.name}`;

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

  @bind
  onSceneEvent(): void {
    this.vector.setX(this.vector.x + 1);
  }
}
