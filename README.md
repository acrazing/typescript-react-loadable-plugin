# typescript-react-loadable-plugin

A react-loadable plugin to add modules & webpack for typescript

This transformer helps you to transform code like:

```typescript jsx
import Loadable from 'react-loadable';

const LazyFoo = Loadable({
  loader: () => import('./Foo'),
});
```

to the following format:

```typescript jsx
import Loadable from 'react-loadable';

const LazyFoo = Loadable({
  loader: () => import('./Foo'),

  modules: ['./Foo'],
  webpack: () => [require.resolveWeak('./Foo')],
});
```

## Install

```bash
yarn add typescript-react-loadable-plugin -D

# or npm
npm install typescript-react-loadable-plugin -D
```

## Usage

### with `ttypescript`

you just need add `typescript--plugin` to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "typescript-react-loadable-plugin",
        "moduleKind": "userRequest"
      }
    ]
  }
}
```

### with `webpack` and `ts-loader`

you need to add the following options to your loader:

```js
import { createReactLoadableTransformer } from 'typescript-react-loadable-plugin';
export default {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader', // or awesome-typescript-loader
        options: {
          getCustomTransformers: (program) => ({
            before: [
              createReactLoadableTransformer(program, {
                moduleKind: 'userRequest',
              }),
            ],
          }),
        },
      },
    ],
  },
};
```

## Options

- `moduleKind`: `string`, the module id kind, supports:

  - `"webpackModuleId"`: use `require.resolveWeak("imported module")`
  - `"webpackChunkName"`: use webpack chunk name, if there is no webpackChunkName specified, will
    insert it automatically, for example:

    ```typescript jsx
    import Loadable from 'react-loadable';

    Loadable({
      loader: () => import('./bar'),
      loading: () => null,
    });
    ```

    will be transformed to:

    ```typescript jsx
    import Loadable from 'react-loadable';

    Loadable({
      loader: () => import(/* webpackChunkName: 'bar' */ './bar'),
      loading: () => null,
      modules: ['bar'],
      webpack: () => [require.resolveWeak('./bar')],
    });
    ```

  - `"userRequest"`: use raw imported module name, this is the default mode

- `getWebpackChunkName`: `(userRequest: string, context: string) => string`, set custom `webpackChunkName`,
  default is the basename of requested module.
- `identifiers`: `string[]`, the identifiers to treat as `react-loadable`, default is `["Loadable"]`
- `webpack`: `boolean`, set webpack field or not, default is true
- `modules`: `boolean`, set modules field or not, default is true

## Notes

**Supported call formats**:

1. single loadable: `Loadable({ loader: () => { ... } })`
2. map loadable: `Loadable.Map({ loader: { ... } })`

**Supported import expressions**:

1. ES dynamic import: `import(...)`
2. Webpack ensure: `require.ensure([...], callback)`

## LICENSE

MIT

    The MIT License (MIT)

    Copyright (c) 2019 acrazing

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
