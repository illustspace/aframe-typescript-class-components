import { ComponentDescriptor, components } from "aframe";

import "../../examples/SampleComponent";
import { SampleComponent } from "../../examples/SampleComponent";

import { BaseComponent } from "./BaseComponent";
import { component } from "./component.decorator";
import { initializeComponentInstance } from "../shared/test-helpers";

@component("empty")
export class EmptyComponent extends BaseComponent {
  static bindEvents = false;
  someProperty = true;
}

describe("BaseComponent", () => {
  describe("toComponent", () => {
    const RegisteredEmptyComponent = components.empty as ComponentDescriptor<EmptyComponent>;

    let component: InstanceType<typeof RegisteredEmptyComponent.Component>;

    describe("given a Component with no init method", () => {
      beforeEach(() => {
        component = new RegisteredEmptyComponent.Component(
          document.createElement("a-entity"),
          "",
          ""
        );
      });

      it("runs the constructor during init", () => {
        expect(component.someProperty).toBeFalsy();

        component.init({});

        expect(component.someProperty).toBe(true);
      });
    });

    describe("given the SampleComponent", () => {
      const RegisteredSampleComponent = components.sample as ComponentDescriptor<SampleComponent>;

      let component: SampleComponent;

      beforeEach(() => {
        component = new RegisteredSampleComponent.Component(
          document.createElement("a-entity"),
          "",
          ""
        );
      });

      it("runs the init function after construction", () => {
        expect(component.greeting).toBeUndefined();

        initializeComponentInstance(component, {
          enabled: true,
          name: "Alice",
        });

        component.init();

        expect(component.greeting).toBe("Hello, Alice");
      });

      describe("given the component is initialized", () => {
        beforeEach(() => {
          initializeComponentInstance(component, {
            enabled: true,
            name: "Alice",
          });
        });

        it("has defined built-in methods", () => {
          expect(() => component.tick(1, 1)).not.toThrow();
        });

        it("has custom methods", () => {
          expect(component.getVectorX()).toBe(0);
        });

        it("has isolated instance variables", () => {
          const component2 = new RegisteredSampleComponent.Component(
            document.createElement("a-entity"),
            "",
            "sample-2"
          );

          initializeComponentInstance(component2, { enabled: false });

          component2.vector.setX(1);

          expect(component2.vector.x).toBe(1);
          expect(component.vector.x).toBe(0);
        });

        it("correctly binds events", () => {
          expect(component.el.object3D.position.z).toBe(0);
          component.el.emit("click");
          expect(component.el.object3D.position.z).toBe(-1);
        });
      });
    });
  });
});
