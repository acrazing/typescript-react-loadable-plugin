/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:38:46
 *
 * TODO: add unit test
 */

import ts from 'typescript';
import { createReactLoadableTransformer } from './createReactLoadableTransformer';

describe('createReactLoadableTransformer', () => {
  it('should transform as expected', () => {
    const result = ts.transpileModule(
      `
      Loadable.Map({
        loader: {
          Foo: () => [import(
          /* webpackChunkName: "1" */
          './Foo'
        ), import('./Bar')]
        },
        loading: () => null,
      })
      `,
      {
        transformers: {
          before: [
            createReactLoadableTransformer(void 0, {
              moduleKind: 'webpackModuleId',
            }),
          ],
        },
      },
    );
    console.log(result.outputText);
  });
});
