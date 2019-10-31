/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:19:08
 */

export interface ReactLoadableTransformerOptions {
  getWebpackChunkName: (request: string, context: string) => string;
  moduleKind: 'userRequest' | 'webpackChunkName' | 'webpackModuleId';
  identifiers: string[];
  webpack: boolean;
  modules: boolean;
}
