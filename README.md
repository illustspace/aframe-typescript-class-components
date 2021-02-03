# Aframe-Typescript-Class-Components

A simple tool for writing [Aframe](https://aframe.io/docs) components as TypeScript classes.

[![npm package](https://img.shields.io/npm/v/aframe-typescript-class-components.svg)](https://www.npmjs.com/package/aframe-typescript-class-components)
[![codecov](https://codecov.io/gh/will-wow/pipeout/branch/master/graph/badge.svg)](https://codecov.io/gh/will-wow/pipeout)
[![David Dependency Status](https://david-dm.org/will-wow/pipeout.svg)](https://david-dm.org/will-wow/pipeout)

It's like `pipe` from lodash and Ramda, but with partial application for better type safety. It also includes an asynchronous pipe function for dealing with promises.

## Installation

```bash
npm i pipeout --save
# or
yarn add pipeout
```

```typescript
import { pipe, pipeA } from "pipeout";
```

## Examples

For these examples, we'll imagine we're building a set of functions for counting and filtering marbles. For the full example, see [readme.test.ts](./src/readme.test.ts).

### Synchronous

`pipe` and `pipe` work with synchronous data (which is not wrapped in a promise).

Here's an example trying to find how many red marbles are in a list.

#### `pipe`

`pipe` is a basic pipe, like `|>` in Haskell or Elixir. The first value passed in is a value to transform. After that you can pass a series of transformer functions by using the `thru` method. Each one will transform the value returned from the previous function, and return an object you can call `.thru` on again to pipe again, or call `.value()` on to get the transformed value.

```typescript
import { pipe } from "pipeout";

const redCount = pipe(marbles).thru(filterReds).thru(getLength).value();
```

**Note**

Since `pipe` is a pretty common function name in libraries
([like RxJS](https://rxjs-dev.firebaseapp.com/api/index/function/pipe)),
`pipe` is aliased as `pip` for convenience.

```javascript
import { pip } from "pipeout";`
```

#### Point-free `pipe.thru`

`pipe` in Lodash or Ramda works a little differently. Instead of passing in the value to transform immediately, it just takes a list of functions, and returns a function that will run the transformations when called. In functional programming this is called a "point-free function", and is good for situations where you're defining a function that will be run later.

If you want the same thing in `pipeout`, then instead of calling `pipe()`, call `pipe.thru`. You still chain together functions with `.thru`, but now calling the resulting function will run the pipeline.

```typescript
import { pipe } from "pipeout";

const redCounter = pipe.thru(filterReds).thru(getLength);
const redCount = redCounter(marbles);
```

**Immutable pipes**

Calling `.thru` returns a _new_ function, so if you have a reference to a pipe, calling `.thru` on it won't mutate the original function.

```typescript
import { pipe } from "pipeout";

const getSmallReds = pipe.thru(onlyRed).thru(onlySmall);
const smallRedCounter = getSmallReds.thru(getLength);

const smallReds = getSmallReds(marbles);
const smallRedCount = smallRedCounter(marbles);
```

### Asynchronous

There are also asynchronous variants, `pipeA` and `pipeA.thru`.
These will always result in a promise, and will work whether your values and functions are synchronous or asynchronous.

All transformer functions should take a value, and can return a value OR a promise.

The starting value can be a promise or a value.

For this example, we'll imagine that getting the user's marbles and getting the user's favorite color are asynchronous API operations.

#### `pipeA`

```typescript
import { pipeA } from "pipeout";

const redCount = await pipeA(user)
  .thru(fetchMarbles)
  .thru(filterForFavoriteColor)
  .thru(getLength)
  .value();
```

#### `pipeA.thru`

```typescript
import { pipeA } from "pipeout";

const redCounter = pipeA
  .thru(fetchMarbles)
  .thru(filterForFavoriteColor)
  .thru(getLength);

const redCount = await redCounter(user);
```

#### Error Handling

Because `pipeA` chains together promises, you can handle promise errors as normal.

You can `.catch` errors:

```javascript
const redCounter = pipeA
  .thru(fetchMarbles)
  .thru(filterForFavoriteColor)
  .thru(getLength);

const redCount = await redCounter(Promise.resolve(user));
```

Or handle them with async/await and try/catch:

```javascript
const redCounter = pipeA
  .thru(fetchMarblesWillFail)
  .thru(filterForFavoriteColor)
  .thru(getLength);

try {
  await redCounter(Promise.resolve(user));
} catch (error) {
  expect(error).toBe("you've lost your marbles!");
}
```

To handle errors in a more type-safe way, check out [result-async](https://github.com/will-wow/result-async). It's designed to work with asynchronous `pipe` functions like Pipeout's, and is built around promises that always resolve to a `Result` type.

## Why another pipe function?

In JavaScript, the traditional `pipe` function in a variadic function that takes any number of unary transformer functions, and returns a function that pipes a value through each transformer.

It usually looks a little like this:

```javascript
pipe(a, b, c)(value);
```

That works pretty well! But creating TypeScript typings for it is a pain, as you have to declare a separate overload for every possible arity, like these [Ramda types](https://github.com/Saul-Mirone/DefinitelyTyped/blob/e99d2d4e482b4a1f10523b7f6201dd413b33bcad/types/ramda/index.d.ts#L2183):

```typescript
pipe<T1>(fn0: () => T1): () => T1;
pipe<V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
pipe<V0, V1, T1>(fn0: (x0: V0, x1: V1) => T1): (x0: V0, x1: V1) => T1;
pipe<V0, V1, V2, T1>(fn0: (x0: V0, x1: V1, x2: V2) => T1): (x0: V0, x1: V1, x2: V2) => T1;
...
```

What a pain to maintain! Pipeout takes a different approach. `pipe` is mostly useful for curried functions - so why not curry `pipe` itself? `pipeout.pipe.thru` is essentially a recursive curried function. It takes a single function, and returns a version of `pipe` that already has the first function in memory. So you can keep calling `.thru`, passing in more transformers. When you're done setting up functions, you call `.run` with an argument, and it passing your value through all the functions.

That means we can write the same thing like this:

```javascript
pipe.thru(a).thru(b).thru(c)(value);
```

It's type-safe, no matter how many functions you add in. And the type is nice and simple, instead of the long overloaded type from Ramda. Every call to `pipe.thru` just returns this same recursive type:

```typescript
export interface Piper<T, U> {
  (value: T): U;
  thru: <V>(transformer: Unary<U, V>) => Piper<T, V>;
}
```

It describes how you can call the function to transform `T` to `U`, or call `.thru` to get a `T` to `V` pipeline instead. All the intermediate transformations aren't relevant, so they don't have to show up in the type. Simple!

## Contributing

```bash
yarn install
yarn test
yarn lint
yarn format
yarn build
```

## Thanks

Thanks to [Ramda](https://ramdajs.com) for their `pipe` function, and mostly thanks to [@sidke](sidkey) for coming up with the original idea for Pipeout, and working through the types with me.
