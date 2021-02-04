# Aframe-Typescript-Class-Components

A simple tool for writing [Aframe](https://aframe.io/docs) components as TypeScript classes.

[![npm package](https://img.shields.io/npm/v/aframe-typescript-class-components.svg)](https://www.npmjs.com/package/aframe-typescript-class-components)
[![codecov](https://codecov.io/gh/will-wow/aframe-typescript-class-components/branch/main/graph/badge.svg)](https://codecov.io/gh/will-wow/aframe-typescript-class-components)
[![David Dependency Status](https://david-dm.org/will-wow/aframe-typescript-class-components.svg)](https://david-dm.org/will-wow/aframe-typescript-class-components)

I love the simplicity of Aframe, but I hate looking at docs. TypeScript is great for its development experience, giving you type hints for what methods are available in a class. And Aframe components look _a lot_ like classes. But they're a little magical - data like `this.el` and `this.data` are injected into your components by Aframe at runtime, and there's not a good way to tell TypeScript about them.

So all this library does is provide a fake class deceleration (`BaseComponent`) that describes all the Aframe component methods and properties, without adding any real code to your build. That lets you make a component class that extends from `BaseComponent`, and then you can add whatever methods and instance properties you want.

The library also provides a `toComponent` function that does some prototype juggling to convert a Component class into the ComponentDescription object that Aframe is looking for.

## Installation

```bash
npm i aframe-typescript-class-components --save
# or
yarn add aframe-typescript-class-components
```

## Example Usage

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

  someProperty = true;
  someObject: Record<string, string> = {};
  initialized = false;

  init(): void {
    this.initialized = true;
  }

  events = {
    click: (): void => {
      const z = this.el.object3D.position.z;
      this.el.object3D.position.setZ(z - 1);
    },
  };

  tick(time: number, deltaTime: number): void {
    // do something on tick.
  }

  getSomeProperty(): boolean {
    return this.someProperty;
  }
}

AFRAME.registerComponent("sample", toComponent(SampleComponent));
```

Your class can initialize properties (like `someObject` in the sample) in the top of the class, like normal in TypeScript. At runtime, these will actually be initialized in the `init()` lifecycle method, and will be independent for every instance of the component, just like in an Aframe component.

Note that you should define an interface matching your `schema` (which enforces the type of `this.data`), and pass it as a type parameter to `BaseComponent`. If you do that, you'll get type hints on `this.data`, and compiler will check your `schema` declaration matches up with the interface. One weird thing is you'll need to add `as const` to the `type` field, or TypeScript will have trouble inferring the schema property type (see sample code).

### Warning on inheritance

Warning! While `toComponent` supports classes, it does _not_ support classes inheriting from other classes. It would probably be possible to do that by having `toComponent` walk the class hierarchy, but it's not a use case I need right now, so I didn't do it. The code is pretty simple, so if that would be useful to you, PRs are welcome!

## Contributing

```bash
yarn install
yarn test
yarn lint
yarn format
yarn build
```
