import { MultiPropertySchema, SinglePropertySchema } from "aframe";
import { Object3D, Vector3 } from "three";
import RegisteredSampleComponent, {
  SampleComponentData,
} from "../examples/SampleComponent";

import {
  attachEvents,
  BaseComponent,
  toComponent,
} from "./aframe-typescript-class-components";

export class EmptyComponent extends BaseComponent {
  static schema = {};
  static bindEvents = false;
  someProperty = true;
}

const RegisteredEmptyComponent = AFRAME.registerComponent(
  "empty",
  toComponent(EmptyComponent)
);

describe("BaseComponent", () => {
  describe("toComponent", () => {
    let component: InstanceType<typeof RegisteredEmptyComponent>;

    describe("given a Component with no init method", () => {
      beforeEach(() => {
        component = new RegisteredEmptyComponent(
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
      let component: InstanceType<typeof RegisteredSampleComponent>;

      beforeEach(() => {
        component = new RegisteredSampleComponent(
          document.createElement("a-entity"),
          "",
          ""
        );
        // Set the initial data state, since it's not initialized by Aframe in this test.
        component.data = { enabled: false, name: "Alice" };

        // Create a fake element with an Object3D.
        component.el = document.createElement("a-entity");
        component.el.object3D = new Object3D();
      });

      it("has a schema before init", () => {
        const schema = component.schema as MultiPropertySchema<SampleComponentData>;
        const enabled = schema.enabled as SinglePropertySchema<boolean>;
        expect(enabled.type).toEqual("boolean");
      });

      it("runs the constructor during init", () => {
        expect(component.vector).toBeUndefined();

        component.init();

        expect(component.vector).toEqual(new Vector3(0, 0, 0));
      });

      it("runs the init function after construction", () => {
        expect(component.greeting).toBeUndefined();

        component.init();

        expect(component.greeting).toBe("Hello, Alice");
      });

      describe("given the component is initialized", () => {
        beforeEach(() => {
          component.el = document.createElement("a-entity");
          component.el.object3D = new Object3D();
          component.data = { enabled: true, name: "Alice" };

          component.init(component.data);

          attachEvents(component);
        });

        it("has defined built-in methods", () => {
          expect(() => component.tick(1, 1)).not.toThrow();
        });

        it("has custom methods", () => {
          expect(component.getVectorX()).toBe(0);
        });

        it("has isolated instance variables", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const component2 = new RegisteredSampleComponent(
            document.createElement("a-entity"),
            "",
            "sample-2"
          );

          component2.data = { enabled: false };
          component2.el = document.createElement("a-entity");
          component2.el.object3D = new Object3D();

          component2.init();

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
