import { BaseSystem } from "../system/BaseSystem";

import { bind, BindableMethod } from "./bind.decorator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyBind = bind as (...args: any[]) => void;

describe("bind", () => {
  it("throws on when not decorating a function", () => {
    expect(() => {
      class BadSystem extends BaseSystem {
        @anyBind
        property = true;
      }

      return BadSystem;
    }).toThrow(TypeError);
  });

  describe("given a class with a bound method", () => {
    class BoundSystem extends BaseSystem {
      @bind
      bound() {
        return true;
      }

      unbound() {
        return false;
      }
    }

    it("sets metadata on a function", () => {
      const instance = new BoundSystem();

      expect((instance.bound as BindableMethod)._bindToAframe).toBe(true);

      expect(
        (instance.unbound as BindableMethod)._bindToAframe
      ).toBeUndefined();
    });
  });
});
