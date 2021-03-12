# Aframe-Typescript-Class-Components

A simple tool for writing [Aframe](https://aframe.io/docs) components as TypeScript classes.

[![npm package](https://img.shields.io/npm/v/aframe-typescript-class-components.svg)](https://www.npmjs.com/package/aframe-typescript-class-components)
[![codecov](https://codecov.io/gh/will-wow/aframe-typescript-class-components/branch/main/graph/badge.svg)](https://codecov.io/gh/will-wow/aframe-typescript-class-components)
[![David Dependency Status](https://david-dm.org/will-wow/aframe-typescript-class-components.svg)](https://david-dm.org/will-wow/aframe-typescript-class-components)

I love Aframe for its document-centric approach to 3D development, but even though the docs are comprehensive, I'd be happy to need to look at them less. TypeScript is great for its development experience, giving you type hints for what methods are available in a class. And Aframe components look _a lot_ like classes! Can you just pass a class to `AFRAME.registerComponent` and call it a day?

Unfortunately no, because Aframe uses `Object.keys()` to pull in the methods from a component definition object, which doesn't play well with classes. And there's not a great way to get TypeScript to correctly type a `ComponentDefinition` object without declaring a bunch of interfaces.

So there needs to be just a little glue code that takes a well-typed class, and reformats it for Aframe. That's where this library comes in! It provides an empty class deceleration (`BaseComponent`) that describes all the component methods and properties that Aframe will inject. That lets you make a component class that extends from `BaseComponent`, and then you can add whatever methods and instance properties you want.

To actually use that class, the library also provides a `toComponent` function that does some prototype juggling to convert a Component class into the ComponentDescription object you can pass into `AFRAME.registerComponent`. And with that, you've got great type safety and type hints on your components, and can focus on making cool experiences!

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
    name: { type: "string", default: "" },
  },
  multiple: true,
  dependencies: ["other-component"],

  init() {
    this.onSceneEvent = this.onSceneEvent.bind(this);

    this.initialized = false;
    this.vector = new Vector3(0, 0, 0);

    this.greeting = `Hello, ${this.data.name}`;

    this.el.sceneEl?.addEventListener("some-event", this.onSceneEvent);
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
import { Vector3 } from "three";
import { BaseComponent, component } from "aframe-typescript-class-components";

import { SampleSystem } from "./SampleSystem";

export interface SampleComponentData {
  enabled: boolean;
  name: string;
}

@component("sample")
export class SampleComponent extends BaseComponent<
  SampleComponentData,
  SampleSystem
> {
  static schema: Schema<SampleComponentData> = {
    enabled: { type: "boolean", default: true },
    name: { type: "string", default: "" },
  };
  static multiple = true;
  static dependencies = ["other-component"];

  greeting!: string;
  vector = new Vector3(0, 0, 0);

  events = {
    click(this: SampleComponent): void {
      // Move forward on click.
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  init(): void {
    this.onSceneEvent = this.onSceneEvent.bind(this);

    this.greeting = `Hello, ${this.data.name}`;

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

  onSceneEvent(): void {
    this.vector.setX(this.vector.x + 1);
  }
}
```

You now have type safety on your instance variables, compile-time checks that you've implemented the Aframe component interface correctly, and arrow-function methods (so no more `this.method.bind(this)` in your `init` method!)

Your class can initialize properties (like `vector` in the sample) in the top of the class, as usual in TypeScript. At runtime, these will actually be initialized in the `init()` lifecycle method, and will be independent for every instance of the component, just like in an Aframe component.

Note that you should define an interface matching your `schema` (which sets the type of `this.data`), and pass it as a type parameter to `BaseComponent`. If you do that, you'll get type hints on `this.data`

If you want to check that your schema matches your data interface, you'll also want to add the `Schema<YourData>` type to the `static schema` declaration. TypeScript won't infer generic class types onto static properties, so you'll have to do that manually.

### Initializing properties in `init`

Sometimes you want to initialize an instance property in the `init` method, like if the value is initialized based on a `data` value. But in `strict` mode (which you should definitely be using!), TypeScript doesn't know that `init` is like a constructor, and will throw a type error.

To solve that, you can use the [Definite Assignment Assertion Modifier](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions) (like `greeting!: string;`) to tell TypeScript the value will be initialized outside of the constructor. Just make sure not to forget to do that initialization!

### Decorators

This library comes with a few decorators to make defining components and systems a little easier.

To enable decorators in a TypeScript project, you'll have to add `"experimentalDecorators": true` to your `tsconfig.json`.

```json
{
  "compilerOptions": {
    ...
    "experimentalDecorators": true
  },
}
```

If you're using the babel compiler, you'll also want to add the `@babel/plugin-proposal-decorators` plugin to your babel config file, with `legacy: true`.

```bash
yarn add @babel/plugin-proposal-decorators --dev
```

```javascript
module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    ["@babel/plugin-transform-runtime", { corejs: 3 }],
    "@babel/plugin-proposal-optional-chaining",
    // Decorators
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ],
};
```

#### Component registration

To register your component, you can add the provided `@component('component-name')` decorator. This will convert the component class to an Aframe `ComponentDescription` object, and register it with Aframe.

```typescript
import { BaseComponent, component } from "aframe-typescript-class-components";

@component("my-component")
export class MyComponent extends BaseComponent {}
```

If you don't want to use decorators, you can still manually register a component like so:

```typescript
import { registerComponent } from "aframe";
import { BaseComponent, toComponent } from "aframe-typescript-class-components";

export class MyComponent extends BaseComponent {}

registerComponent("my-component", toComponent(MyComponent));
```

#### Method binding

Because calling `this.myMethod = this.myMethod.bind(this)` in the `init` method is annoying, you may be tempted to add arrow functions as class properties. _Don't do that!_ They'll bind to the `this` of the class, not the component instance, and everything will break.

Instead, you can add the `@bind` decorator to any component method. `aframe-typescript-class-components` will then automatically bind the method to the component instance in the `init` lifecycle method.

Alternatively, you can just manually bind the method in the `init` method as usual.

### Systems

If you want to define a system with a class, you can! Just `import { BaseSystem, system } from 'aframe-typescript-class-components';`, and use the base class and decorator in the same way as you do for components.

### Caveats

Because of the way Aframe handles components, a few TypeScript features won't work the way you'd expect them to. Read on to avoid bugs!

#### Events

The `events` property has the same issue as class property arrow functions, where an arrow function as a key in the events object will bind to the wrong `this`. Instead, `aframe-typescript-class-components` looks for a `static bindEvents: boolean` in the class. Unless you set that to `false`, events will automatically be bound to the component instance.

#### Inheritance

While `toComponent` supports classes that inherit from `BaseComponent`, it does _not_ support deeper class hierarchies. It should probably be possible to do that by having `toComponent` walk the prototype chain, but it's not a use case I need right now, so I didn't do it. The `toComponent` code is pretty simple though, so if that would be useful to you, PRs are welcome!

## Testing

As your Aframe components get more complicated, it's helpful to be able to actually test them! While you might be able to get Aframe running in jsdom with Jest, it's often easier to just test the logic of the classes in isolation.

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

If you do want to test real registered components, you'll probably want to add [jest-canvas-mock](https://github.com/hustcc/jest-canvas-mock) to your Jest `setupFilesAfterEnv` list to avoid a warning about canvas not being defined.

### Setup

At runtime, Aframe injects things like `this.data` and `this.el` into your component, calls `init`, and sets up listeners for the `events` object.

To make testing classes easier, this library has a `initializeTestComponent` function to wrap the component in `toComponent`, and do that initialization for you. It's usually a good idea to call that in a `beforeEach` to give yourself a good starting point, and then override any specific values in later tests. And make sure to make a new instance of the component for every test, so you don't hold onto state between tests.

```typescript
import { initializeTestComponent } from "../src/aframe-typescript-class-components";

import { SampleComponent } from "./SampleComponent";

describe("SampleComponent", () => {
  let component: SampleComponent;

  beforeEach(() => {
    component = initializeTestComponent(SampleComponent, {
      enabled: false,
      name: "Alice",
    });
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
