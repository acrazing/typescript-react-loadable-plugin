/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-11-02 17:04:43
 */
import React from 'react';
import Loadable from 'react-loadable';
export const LazyFoo = Loadable({
  loader: () => import('./input/Foo'),
  modules: ['./input/Foo'],
  webpack: () => [require.resolveWeak('./input/Foo')],
  loading: () => React.createElement('span', null, 'Loading...'),
});
export const LazyMap = Loadable.Map({
  loader: {
    Foo: () => import('./input/Foo'),
    Bar: () => import('./input/Bar'),
  },
  modules: ['./input/Foo', './input/Bar'],
  webpack: () => [
    require.resolveWeak('./input/Foo'),
    require.resolveWeak('./input/Bar'),
  ],
  loading: () => React.createElement('span', null, 'Loading...'),
  render: () => null,
});
export const LazyMultiple = Loadable({
  loader: () => Promise.all([import('./input/Foo'), import('./input/Bar')]),
  modules: ['./input/Foo', './input/Bar'],
  webpack: () => [
    require.resolveWeak('./input/Foo'),
    require.resolveWeak('./input/Bar'),
  ],
  loading: () => React.createElement('span', null, 'Loading...'),
  render: () => null,
});
