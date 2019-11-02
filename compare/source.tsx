/*!
 * Copyright 2019 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2019-11-02 17:04:43
 */

import React from 'react';
import Loadable from 'react-loadable';

export const LazyFoo = Loadable({
  loader: () => import('./input/Foo'),
  loading: () => <span>Loading...</span>,
});

export const LazyMap = Loadable.Map({
  loader: {
    Foo: () => import('./input/Foo'),
    Bar: () => import('./input/Bar'),
  },
  loading: () => <span>Loading...</span>,
  render: () => null,
});

export const LazyMultiple = Loadable({
  loader: () => Promise.all([import('./input/Foo'), import('./input/Bar')]),
  loading: () => <span>Loading...</span>,
  render: () => null,
});
