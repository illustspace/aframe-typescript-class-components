import { Scene } from "aframe";
import { Object3D } from "three";

import { SampleComponent } from "./SampleComponent";

describe("SampleComponent", () => {
  let component: SampleComponent;

  beforeEach(() => {
    component = new SampleComponent();

    // Set the initial data state, since it's not initialized by Aframe in this test.
    component.data = { enabled: false };

    // Create a fake element, and add an Object3D to it if your component refers to that.
    component.el = document.createElement("a-entity");
    component.el.object3D = new Object3D();
    component.el.sceneEl = document.createElement("a-scene") as Scene;

    // Call the init function to set up the component.
    component.init();
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

  it("does not rotate when not enabled", () => {
    component.tick(0, 1000);
    expect(component.el.object3D.rotation.z).toBe(0);
  });

  it("rotates when enabled", () => {
    component.data.enabled = true;

    expect(component.el.object3D.rotation.z).toBe(0);
    component.tick(0, 500);
    expect(component.el.object3D.rotation.z).toBeCloseTo(Math.PI / 2, 2);
  });

  it("rotates when enabled", () => {
    component.data.enabled = true;

    expect(component.el.object3D.rotation.z).toBe(0);
    component.tick(0, 500);
    expect(component.el.object3D.rotation.z).toBeCloseTo(Math.PI / 2, 2);
  });

  describe("given a sceneEl", () => {
    it("updates the vector on events", () => {
      expect(component.getVectorX()).toBe(0);
      component.el.sceneEl?.dispatchEvent(new Event("some-event"));
      expect(component.getVectorX()).toBe(1);
    });
  });
});
