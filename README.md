# Aframe-Typescript-Class-Components

A simple tool for writing [Aframe](https://aframe.io/docs) components as TypeScript classes.

[![npm package](https://img.shields.io/npm/v/aframe-typescript-class-components.svg)](https://www.npmjs.com/package/aframe-typescript-class-components)
[![codecov](https://codecov.io/gh/will-wow/aframe-typescript-class-components/branch/main/graph/badge.svg)](https://codecov.io/gh/will-wow/aframe-typescript-class-components)
[![David Dependency Status](https://david-dm.org/will-wow/aframe-typescript-class-components.svg)](https://david-dm.org/will-wow/aframe-typescript-class-components)

I love Aframe for its document-centric approach to 3D development, but even though the docs are comprehensive, I'd be happy to read them less. TypeScript is great for its development experience, giving you type hints for what methods are available in a class. And Aframe components look _a lot_ like classes! Can you just pass a call to `AFRAME.registerComponent` and call it a day?

Unfortunately not, because Aframe components are a little magical - data like `this.el` and `this.data` are injected into your components by Aframe at runtime, and there's not a clean way to tell TypeScript about them while using the standard Aframe object syntax. On top of that, Aframe uses `Object.keys()` to pull in the methods from a component definition object, which doesn't play well with classes.

So all this library does is provide a fake class deceleration (`BaseComponent`) that describes all the Aframe component methods and properties, without adding any real code to your build. That lets you make a component class that extends from `BaseComponent`, and then you can add whatever methods and instance properties you want.

The library also provides a `toComponent` function that does some prototype juggling to convert a Component class into the ComponentDescription object that Aframe is looking for. And with that, you've got great type safety on your components!

## Installation

```bash
npm i aframe-typescript-class-components --save
# or
yarn add aframe-typescript-class-components
```

### Install Peer Dependencies

You'll also want to install the Aframe and Three.js type definitions as dependencies, if you haven't already:

```bash
npm i @types/aframe @types/three --save
# or
yarn add @types/aframe @types/three
```

## Example Usage

Here's an example of a normal Aframe component written with `aframe-typescript-class-components`.

```javascript
AFRAME.registerComponent("sample", {
  schema: {
    enabled: { type: "boolean", default: true },
  },
  multiple: true,

  init() {
    this.onSceneEvent = this.onSceneEvent.bind(this);

    this.initialized = false;
    this.vector = new Vector3(0, 0, 0);
    this.initialized = true;
  },
  events: {
    click() {
      // Move forward on click.
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  },
  tick(time, deltaTime) {
    if (this.data.enabled) {
      // Rotate 180 degrees every second.
      this.el.object3D.rotateZ(Math.PI * (deltaTime / 1000));
    }
  },
  getVectorX() {
    return this.vector.x;
  },
  onSceneEvent() {
    this.vector.setX(this.vector.x + 1);
  },
});
```

And here's the same component written with `aframe-typescript-class-components`:

```typescript
import { BaseComponent, toComponent } from "aframe-typescript-class-components";

export interface SampleComponentData {
  enabled: boolean;
}

export class SampleComponent extends BaseComponent<SampleComponentData> {
  static schema = {
    enabled: { type: "boolean" as const, default: true },
  };
  static multiple = true;

  initialized = false;
  vector = new Vector3(0, 0, 0);

  events = {
    click: (): void => {
      // Move forward on click.
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  init(): void {
    this.initialized = true;

    this.el.sceneEl?.addEventListener("some-event", this.onSceneEvent);
  }

  tick(time: number, deltaTime: number): void {
    if (this.data.enabled) {
      // Rotate 180 degrees every second.
      this.el.object3D.rotateZ(Math.PI * (deltaTime / 1000));
    }
  }

  getVectorX(): number {
    return this.vector.x;
  }

  onClick = (): void => {
    // Move forward on click.
    const z = this.el.object3D.position.z;
    this.el.object3D.position.setZ(z - 1);
  };

  onSceneEvent = (): void => {
    this.vector.setX(this.vector.x + 1);
  };
}

AFRAME.registerComponent("sample", toComponent(SampleComponent));
```

You now have type safety on your instance variables, compile-time checks that you've implemented the Aframe component interface correctly, and arrow-function methods (so no more `this.method.bind(this)` in your `init` method!)

Your class can initialize properties (like `vector` in the sample) in the top of the class, as usual in TypeScript. At runtime, these will actually be initialized in the `init()` lifecycle method, and will be independent for every instance of the component, just like in an Aframe component.

Note that you should define an interface matching your `schema` (which enforces the type of `this.data`), and pass it as a type parameter to `BaseComponent`. If you do that, you'll get type hints on `this.data`, and compiler will check your `schema` declaration matches up with the interface. One weird thing is you'll need to add `as const` to the `type` field, or TypeScript will have trouble inferring the schema property type (see the sample code).

## Warning on inheritance

Warning! While `toComponent` supports classes, it does _not_ support classes inheriting from other classes. It would probably be possible to do that by having `toComponent` walk the class hierarchy, but it's not a use case I need right now, so I didn't do it. The code is pretty simple, so if that would be useful to you, PRs are welcome!

## Testing

As your Aframe components get more complicated, it's helpful to be able to actually test them! While you might be able to get Aframe running in jsdom with Jest, it's often enough to just test the logic of the classes in isolation.

To do that with Jest (or ts-jest), you'll want to do a few things:

### Test Environment

Since many Aframe components refer to other components on the `document`, it's helpful to use jsdom to run your tests.

So, your `jest.config.js` should include jsdom:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
```

### Mock AFRAME.registerComponent

Your component files probably include a call to `AFRAME.registerComponent`. That's useful during runtime, but runs code you don't need in testing. A simple solution is to mock Aframe in your Jest `setupTests` file:

```typescript
import { ComponentConstructor, ComponentDefinition } from "aframe";

global.AFRAME = {
  registerComponent: (_name: string, _component: ComponentDefinition) =>
    ({} as ComponentConstructor<any>),
} as any;
```

### Setup

To test the component class without Aframe to do the initialization, you'll need to manually inject a few instance variables. It's usually a good idea to do that in a `beforeEach` to give yourself a good starting point, and then override any specific values in later tests. And make sure to make a new instance of the component for every test, so you don't keep hold onto state between tests.

```typescript
import { Object3D } from "three";

import { SampleComponent } from "./SampleComponent";

describe("SampleComponent", () => {
  let component: SampleComponent;

  beforeEach(() => {
    component = new SampleComponent();

    // Set the initial data state, since it's not initialized by Aframe in this test.
    component.data = { enabled: false };

    // Create a fake element, and add an Object3D and sceneEl to it, if your component refers to them.
    component.el = document.createElement("a-entity");
    component.el.object3D = new Object3D();
    component.el.sceneEl = document.createElement("a-scene") as Scene;

    // Call the init function to set up the component.
    component.init();
  });

  it("does not rotate when not enabled", () => {
    // You can lifecycle methods like tick and update manually.
    component.tick(0, 1000);
    expect(component.el.object3D.rotation.z).toBe(0);
  });

  it("rotates when enabled", () => {
    component.data.enabled = true;

    expect(component.el.object3D.rotation.z).toBe(0);
    component.tick(0, 500);
    expect(component.el.object3D.rotation.z).toBeCloseTo(Math.PI / 2, 2);
  });
});
```

See [examples/examples/SampleComponent.test.ts](./examples/examples/SampleComponent.test.ts) for a full example component test.

## Contributing

```bash
yarn install
yarn test
yarn lint
yarn format
yarn build
```
