import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { hydrate } from 'react-dom';
import { initializeApollo } from './apolloClient';
import { ApolloProvider } from '@apollo/client';

const apolloClient = initializeApollo(window.__APOLLO_STATE__);

hydrate(
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
