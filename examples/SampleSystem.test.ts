import { Vector3 } from "three";
import { initializeTestSystem } from "../src/shared/test-helpers";

import { SampleSystem } from "./SampleSystem";

describe("SampleSystem", () => {
  let system: SampleSystem;

  beforeEach(() => {
    system = initializeTestSystem(SampleSystem, {
      enabled: false,
      name: "Alice",
    });
  });

  it("sets initialized on init", () => {
    expect(system.vector).toEqual(new Vector3(0, 0, 0));
  });

  it("updates the vector on events", () => {
    expect(system.vector.x).toBe(0);
    system.el.emit("some-event");
    expect(system.vector.x).toBe(1);
  });
});
