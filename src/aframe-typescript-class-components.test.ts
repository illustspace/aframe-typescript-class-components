import { SampleComponent } from "../examples/SampleComponent";

import {
  BaseComponent,
  toComponent,
} from "./aframe-typescript-class-components";

export class EmptyComponent extends BaseComponent {
  someProperty = true;
}

describe("BaseComponent", () => {
  describe("toComponent", () => {
    let component: EmptyComponent;

    describe("given a Component with no init method", () => {
      beforeEach(() => {
        component = toComponent(EmptyComponent) as EmptyComponent;
      });

      it("runs the constructor during init", () => {
        expect(component.someProperty).toBeFalsy();

        component.init({});

        expect(component.someProperty).toBe(true);
      });
    });

    describe("given the SampleComponent", () => {
      let component: SampleComponent;

      beforeEach(() => {
        component = toComponent(SampleComponent) as SampleComponent;
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
          component = toComponent(SampleComponent) as SampleComponent;
          component.init();
        });

        it("has methods", () => {
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
