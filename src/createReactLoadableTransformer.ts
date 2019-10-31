/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:19:08
 */

import ts from 'typescript';
import { State } from './State';
import { ReactLoadableTransformerOptions } from './types';

function processLoadableCall(
  state: State,
  call: ts.CallExpression,
  config: ts.ObjectLiteralExpression,
) {
  return call;
}

export function createReactLoadableTransformer(
  program: ts.Program,
  options: Partial<ReactLoadableTransformerOptions>,
): ts.TransformerFactory<ts.SourceFile> {
  const state = new State(options);
  return (context) => {
    return (source) => {
      const visitor: ts.Visitor = (node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          state.identifiers.has(node.expression.escapedText as string)
        ) {
          const config = node.arguments[0];
          if (ts.isObjectLiteralExpression(config)) {
            node = processLoadableCall(state, node, config);
          }
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(source, visitor);
    };
  };
}
