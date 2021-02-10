import { Scene, SystemConstructor, systems } from "aframe";

import "../../examples/SampleSystem";
import { SampleSystem } from "../../examples/SampleSystem";

import { BaseSystem } from "./BaseSystem";
import { system } from "./system.decorator";
import { initializeSystemInstance } from "../shared/test-helpers";

@system("empty")
export class EmptySystem extends BaseSystem {
  static schema = {};
  someProperty = true;
}

describe("BaseSystem", () => {
  describe("toSystem", () => {
    const RegisteredEmptySystem = systems.empty as SystemConstructor<EmptySystem>;

    let system: InstanceType<typeof RegisteredEmptySystem>;

    describe("given a System with no init method", () => {
      beforeEach(() => {
        system = new RegisteredEmptySystem(
          document.createElement("a-scene") as Scene
        );
      });

      it("runs the constructor during init", () => {
        expect(system.someProperty).toBe(true);
      });
    });

    describe("given the SampleSystem", () => {
      const RegisteredSampleSystem = systems.sample as SystemConstructor<SampleSystem>;

      let system: SampleSystem;

      beforeEach(() => {
        system = new RegisteredSampleSystem(
          document.createElement("a-scene") as Scene
        );
      });

      describe("given the system is initialized", () => {
        beforeEach(() => {
          initializeSystemInstance(system);
        });

        it("has isolated instance variables", () => {
          const system2 = new RegisteredSampleSystem(
            document.createElement("a-entity") as Scene
          );

          initializeSystemInstance(system2);

          system2.vector.setX(1);

          expect(system2.vector.x).toBe(1);
          expect(system.vector.x).toBe(0);
        });
      });
    });
  });
});
