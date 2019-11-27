/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:20:27
 */

import * as path from 'path';
import ts from 'typescript';
import { ReactLoadableTransformerOptions } from './types';

export class State {
  getWebpackChunkName: (request: string, context: string) => string;
  webpackChunkName: boolean;
  moduleKind: 'userRequest' | 'webpackChunkName' | 'webpackModuleId';
  identifiers: Set<string>;
  webpack: boolean;
  modules: boolean;
  transformContext!: ts.TransformationContext;
  sourceFile!: ts.SourceFile;
  sourceContext!: string;

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
    this.webpack = options.webpack !== false;
    this.modules = options.modules !== false;
    this.webpackChunkName =
      options.webpackChunkName !== false ||
      this.moduleKind === 'webpackChunkName';
  }

  setSourceFile(source: ts.SourceFile) {
    this.sourceFile = source;
    this.sourceContext = path.dirname(source.fileName);
  }
}
