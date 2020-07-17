import 'isomorphic-unfetch';
import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { initializeApollo } from './apolloClient';
import { ApolloProvider } from '@apollo/client';
import { getDataFromTree } from '@apollo/client/react/ssr';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const apolloClient = initializeApollo();
    const context = {};
    const app = (
      <ApolloProvider client={apolloClient}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    );

    getDataFromTree(app)
    .then(() => {
      const markup = renderToString(app);
      const initialState = apolloClient.extract();

        if (context.url) {
          res.redirect(context.url);
        } else {
          res.status(200).send(
            `<!doctype html>
        <html lang="">
        <head>
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta charset="utf-8" />
            <title>Welcome to Razzle</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${
              assets.client.css
                ? `<link rel="stylesheet" href="${assets.client.css}">`
                : ''
            }
            ${
              process.env.NODE_ENV === 'production'
                ? `<script src="${assets.client.js}" defer></script>`
                : `<script src="${assets.client.js}" defer crossorigin></script>`
            }
        </head>
        <body>
            <div id="root">${markup}</div>
            <script>
              window.__APOLLO_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')};
            </script>
        </body>
    </html>`
          );
        }
    })
  });

export default server;
