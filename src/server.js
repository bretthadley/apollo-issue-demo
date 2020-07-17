import 'isomorphic-unfetch';
import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToNodeStream } from 'react-dom/server';
import { initializeApollo } from './apolloClient';
import { ApolloProvider } from '@apollo/client';
import { getDataFromTree } from '@apollo/client/react/ssr';
import createEmotionServer from 'create-emotion-server';
import createCache from '@emotion/cache';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const cssCache = createCache();
const { renderStylesToNodeStream } = createEmotionServer(cssCache);

const server = express();

function getHeaderHtml() {
  return `
  <!doctype html>
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
        <div id="root">
  `
}

function getFooterHtml(apolloState) {
  return `</div>
    <script>
      window.__APOLLO_STATE__=${JSON.stringify(apolloState).replace(/</g, '\\u003c')};
    </script>
  </body>
</html>`
}

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

    res.status(200)
    res.set({
      'content-type': 'text/html'
    });

    // send bytes immediately e.g. this could include critical css
    res.write(getHeaderHtml())

    getDataFromTree(app)
      .then(() => {
        // interleave the react stream with the css chunks produced by emotion
        // this will produce something like :
        //  <-- component css --> 
        //  <-- component html -->
        //  <-- component css --> 
        //  <-- component html -->
        // etc so the browser can progressively render as the markup/styles are received

        const appStream = renderToNodeStream(app)
          .pipe(renderStylesToNodeStream());
        
        const apolloState = apolloClient.extract();

        appStream.pipe(res, { end: false });

        appStream.on('end', () => {
          res.write(getFooterHtml(apolloState))

          return res.end();
        })
      })
  });

export default server;
