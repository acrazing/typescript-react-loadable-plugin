/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-10-31 19:19:08
 */

import ts from 'typescript';
import vm from 'vm';
import { State } from './State';
import {
  ReactLoadableTransformerOptions,
  WebpackCommentOptions,
} from './types';

const webpackCommentRegExp = new RegExp(/(^|\W)webpack[A-Z]+[A-Za-z]+:/);

function createResolveWeak(id: string) {
  return ts.createCall(
    ts.createPropertyAccess(ts.createIdentifier('require'), 'resolveWeak'),
    void 0,
    [ts.createStringLiteral(id)],
  );
}

// TODO: parse require.ensure
function parseLoader(
  state: State,
  loader: ts.ObjectLiteralElementLike,
): [ts.ObjectLiteralElementLike, Set<string>, Set<string>] {
  const moduleIds = new Set<string>();
  const webpackIds = new Set<string>();
  const visitor: ts.Visitor = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const arg0 = node.arguments[0];
      if (ts.isStringLiteral(arg0)) {
        webpackIds.add(arg0.text);
        let chunkName = '';
        if (state.webpackChunkName) {
          const commentRanges =
            ts.getLeadingCommentRanges(state.sourceFile.text, arg0.pos) || [];
          for (const range of commentRanges) {
            let comment = state.sourceFile.text.substring(range.pos, range.end);
            if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
              comment = comment.substr(2);
            } else {
              comment = comment.substr(2, comment.length - 4);
            }
            if (webpackCommentRegExp.test(comment)) {
              try {
                const commentValue: WebpackCommentOptions = vm.runInNewContext(
                  `({ ${comment} })`,
                );
                if (typeof commentValue.webpackChunkName === 'string') {
                  chunkName = commentValue.webpackChunkName;
                  break;
                }
              } catch (e) {
                throw new Error(
                  `${e} while parse webpack comment chunk: ${comment}`,
                );
              }
            }
          }
          if (!chunkName) {
            chunkName = state.getWebpackChunkName(
              arg0.text,
              state.sourceContext,
            );
            ts.addSyntheticLeadingComment(
              arg0,
              ts.SyntaxKind.MultiLineCommentTrivia,
              ` webpackChunkName: ${JSON.stringify(chunkName)} `,
              false,
            );
          }
        }
        if (state.moduleKind === 'webpackChunkName') {
          moduleIds.add(chunkName);
        } else {
          moduleIds.add(arg0.text);
        }
      }
    }
    return ts.visitEachChild(node, visitor, state.transformContext);
  };
  return [ts.visitNode(loader, visitor), moduleIds, webpackIds];
}

function transformReactLoadable(
  state: State,
  config: ts.ObjectLiteralExpression,
) {
  let loader: ts.ObjectLiteralElementLike | undefined = void 0;
  let modules: ts.ObjectLiteralElementLike | undefined = void 0;
  let webpack: ts.ObjectLiteralElementLike | undefined = void 0;
  const properties = config.properties.slice();
  properties.forEach((node) => {
    if (node.name) {
      const name = ts.isIdentifier(node.name)
        ? node.name.escapedText
        : ts.isStringLiteral(node.name)
        ? node.name.text
        : void 0;
      switch (name) {
        case 'loader':
          loader = node;
          break;
        case 'modules':
          modules = node;
          break;
        case 'webpack':
          webpack = node;
          break;
      }
    }
  });
  if (!loader) {
    return config;
  }
  if ((modules || !state.modules) && (webpack || !state.webpack)) {
    return config;
  }
  const [, moduleIds, webpackIds] = parseLoader(state, loader);
  if (!modules && state.modules) {
    properties.push(
      ts.createPropertyAssignment(
        'modules',
        ts.createArrayLiteral(
          state.moduleKind === 'webpackModuleId'
            ? Array.from(moduleIds, createResolveWeak)
            : Array.from(moduleIds, (id) => ts.createStringLiteral(id)),
        ),
      ),
    );
  }
  if (!webpack && state.webpack) {
    properties.push(
      ts.createPropertyAssignment(
        'webpack',
        ts.createArrowFunction(
          void 0,
          void 0,
          [],
          void 0,
          void 0,
          ts.createArrayLiteral(Array.from(webpackIds, createResolveWeak)),
        ),
      ),
    );
  }
  return ts.createObjectLiteral(properties, true);
}

export function getRealExpression(node: ts.Node): ts.Node {
  return ts.isParenthesizedExpression(node)
    ? getRealExpression(node.expression)
    : ts.isAsExpression(node)
    ? getRealExpression(node.expression)
    : node;
}

function visitReactLoadable(state: State, node: ts.Node): ts.Node {
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return node;
  }
  const config = getRealExpression(node.arguments[0]);
  if (!ts.isObjectLiteralExpression(config)) {
    return node;
  }
  let identifier = getRealExpression(node.expression);
  if (
    ts.isPropertyAccessExpression(identifier) &&
    identifier.name.escapedText === 'Map'
  ) {
    identifier = getRealExpression(identifier.expression);
  }
  if (
    !ts.isIdentifier(identifier) ||
    !state.identifiers.has(identifier.escapedText as string)
  ) {
    return node;
  }
  return ts.createCall(node.expression, node.typeArguments, [
    transformReactLoadable(state, config),
  ]);
}

export function createReactLoadableTransformer(
  program: ts.Program | undefined,
  options: Partial<ReactLoadableTransformerOptions>,
): ts.TransformerFactory<ts.SourceFile> {
  const state = new State(options);
  return (context) => {
    state.transformContext = context;
    return (source) => {
      state.setSourceFile(source);
      const visitor: ts.Visitor = (node) => {
        node = visitReactLoadable(state, node);
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(source, visitor);
    };
  };
}
