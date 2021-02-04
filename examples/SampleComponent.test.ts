import { Entity, ComponentDefinition } from "aframe";
import { Object3D } from "three";

import { SampleComponent } from "./SampleComponent";

describe("SampleComponent", () => {
  describe("given the SampleComponent", () => {
    let component: ComponentDefinition<SampleComponent>;

    beforeEach(() => {
      component = new SampleComponent();
      component.init();

      component.el = {
        object3D: new Object3D(),
      } as Entity;
    });

    it("sets initialized on init", () => {
      expect(component.initialized).toBe(true);
    });

    it("moves forward on click", () => {
      expect(component.el.object3D.position.z).toBe(0);
      component.events.click();
      expect(component.el.object3D.position.z).toBe(-1);
      component.events.click();
      expect(component.el.object3D.position.z).toBe(-2);
    });
  });
});
