import { Schema } from "aframe";
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
      });

      it("has a schema before init", () => {
        expect(component.schema).toEqual({
          enabled: { type: "boolean", default: true },
        });
      });

      it("runs the constructor during init", () => {
        expect(component.someProperty).toBeFalsy();

        component.init();

        expect(component.someProperty).toBe(true);
      });

      it("runs the init function after construction", () => {
        expect(component.initialized).toBeFalsy();

        component.init();

        expect(component.initialized).toBe(true);
      });

      describe("given the component is initialized", () => {
        beforeEach(() => {
          component.init();
        });

        it("does not add built-in methods (aframe will handle that)", () => {
          expect(() => component.update({ enabled: true })).toThrow(TypeError);
        });

        it("has defined built-in methods", () => {
          expect(() => component.tick(1, 1)).not.toThrow();
        });

        it("has custom methods", () => {
          expect(component.getSomeProperty()).toBe(true);
        });

        it("has isolated instance variables", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const component2 = toComponent(SampleComponent) as SampleComponent;

          component2.init();

          component2.someObject.foo = "bar";

          expect(component2.someObject.foo).toBe("bar");
          expect(component.someObject.foo).toBeUndefined();
        });
      });
    });
  });
});
