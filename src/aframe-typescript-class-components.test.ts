import { Entity, Schema } from "aframe";
import { Object3D, Vector3 } from "three";
import { SampleComponent } from "../examples/SampleComponent";

import {
  BaseComponent,
  toComponent,
} from "./aframe-typescript-class-components";

export class EmptyComponent extends BaseComponent {
  someProperty = true;
}

type AframeComponent<C> = C & { schema: Schema };

describe("BaseComponent", () => {
  describe("toComponent", () => {
    let component: AframeComponent<EmptyComponent>;

    describe("given a Component with no init method", () => {
      beforeEach(() => {
        component = toComponent(
          EmptyComponent
        ) as AframeComponent<EmptyComponent>;
      });

      it("runs the constructor during init", () => {
        expect(component.someProperty).toBeFalsy();

        component.init({});

        expect(component.someProperty).toBe(true);
      });
    });

    describe("given the SampleComponent", () => {
      let component: AframeComponent<SampleComponent>;

      beforeEach(() => {
        component = toComponent(
          SampleComponent
        ) as AframeComponent<SampleComponent>;

        // Set the initial data state, since it's not initialized by Aframe in this test.
        component.data = { enabled: false };

        // Create a fake element with an Object3D.
        component.el = document.createElement("a-entity");
        component.el.object3D = new Object3D();
      });

      it("has a schema before init", () => {
        expect(component.schema).toEqual({
          enabled: { type: "boolean", default: true },
        });
      });

      it("runs the constructor during init", () => {
        expect(component.vector).toBeUndefined();

        component.init();

        expect(component.vector).toEqual(new Vector3(0, 0, 0));
      });

      it("runs the init function after construction", () => {
        expect(component.initialized).toBeFalsy();

        component.init();

        expect(component.initialized).toBe(true);
      });

      describe("given the component is initialized", () => {
        beforeEach(() => {
          component.init();
          component.el = {
            object3D: new Object3D(),
          } as Entity;
          component.data = { enabled: true };
        });

        it("does not add built-in methods (aframe will handle that)", () => {
          expect(() => component.update({ enabled: true })).toThrow(TypeError);
        });

        it("has defined built-in methods", () => {
          expect(() => component.tick(1, 1)).not.toThrow();
        });

        it("has custom methods", () => {
          expect(component.getVectorX()).toBe(0);
        });

        it("has isolated instance variables", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const component2 = toComponent(SampleComponent) as SampleComponent;

          component2.data = { enabled: false };
          component2.el = document.createElement("a-entity");
          component2.el.object3D = new Object3D();

          component2.init();

          component2.vector.setX(1);

          expect(component2.vector.x).toBe(1);
          expect(component.vector.x).toBe(0);
        });
      });
    });
  });
});
