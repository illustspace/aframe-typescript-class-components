import { initializeTestComponent } from "../src/shared/test-helpers";

import { SampleComponent } from "./SampleComponent";

describe("SampleComponent", () => {
  let component: SampleComponent;

  beforeEach(() => {
    component = initializeTestComponent(SampleComponent, {
      enabled: false,
      name: "Alice",
    });
  });

  it("sets initialized on init", () => {
    expect(component.greeting).toBe("Hello, Alice");
  });

  it("works without a sceneEl", () => {
    component.el.sceneEl = undefined;
    expect(() => {
      component.init();
    }).not.toThrow();
  });

  it("moves forward on click", () => {
    expect(component.el.object3D.position.z).toBe(0);
    component.el.emit("click");
    expect(component.el.object3D.position.z).toBe(-1);
    component.el.emit("click");
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

  it("updates the vector on events", () => {
    expect(component.getVectorX()).toBe(0);
    component.el.sceneEl?.dispatchEvent(new Event("some-event"));
    expect(component.getVectorX()).toBe(1);
  });
});
