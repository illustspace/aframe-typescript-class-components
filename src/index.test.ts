import { SampleComponent } from "../examples/SampleComponent";

import { toComponent } from ".";

const initialData = {
  enabled: true,
};

describe("BaseComponent", () => {
  describe("toComponent", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let component: SampleComponent;

    beforeEach(() => {
      component = toComponent(SampleComponent) as SampleComponent;
    });

    it("does runs the constructor during init", () => {
      expect(component.someProperty).toBeFalsy();

      component.init(initialData);

      expect(component.someProperty).toBe(true);
    });

    describe("given the component is initialized", () => {
      beforeEach(() => {
        component = toComponent(SampleComponent) as SampleComponent;
        component.init(initialData);
      });

      it("has methods", () => {
        expect(component.getSomeProperty()).toBe(true);
      });

      it("has isolated instance variables", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const component2 = toComponent(SampleComponent) as SampleComponent;

        component2.init(initialData);

        component2.someObject.foo = "bar";

        expect(component2.someObject.foo).toBe("bar");
        expect(component.someObject.foo).toBeUndefined();
      });
    });
  });
});
