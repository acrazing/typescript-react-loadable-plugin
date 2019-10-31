/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:20:27
 */

import * as path from 'path';
import { ReactLoadableTransformerOptions } from './types';

export class State {
  getWebpackChunkName: (request: string, context: string) => string;
  moduleKind: 'userRequest' | 'webpackChunkName' | 'webpackModuleId';
  identifiers: Set<string>;

  constructor(options: Partial<ReactLoadableTransformerOptions>) {
    this.getWebpackChunkName =
      options.getWebpackChunkName ||
      ((request, context) => {
        return (
          path
            .basename(request)
            .split('.')
            .filter((s) => !!s)[0] ||
          path.basename(path.dirname(request)) ||
          path.dirname(context)
        );
      });
    this.moduleKind = options.moduleKind || 'userRequest';
    this.identifiers = new Set(options.identifiers || ['Loadable']);
  }
}