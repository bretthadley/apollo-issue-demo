import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { hydrate } from 'react-dom';
import { initializeApollo } from './apolloClient';
import { ApolloProvider } from '@apollo/client';
import { CacheProvider } from '@emotion/core';

import createCache from '@emotion/cache';

const apolloClient = initializeApollo(window.__APOLLO_STATE__);

const cache = createCache();

hydrate(
  <CacheProvider value={cache}>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </CacheProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
