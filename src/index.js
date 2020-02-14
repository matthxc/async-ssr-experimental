import "@babel/polyfill";
import React from "react";
import express from "express";
import { matchRoutes } from "react-router-config";
import proxy from "express-http-proxy";
import Routes from "./client/Routes";
import createStore from "./helpers/createStore";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { renderRoutes } from "react-router-config";
import serialize from "serialize-javascript";
import compression from "compression";
import expressStaticGzip from "express-static-gzip";
import Helmet from "react-helmet";

const app = express();

let renderedTimes = 0;

const hideChunks = chunk => {
  if (chunk > 0) {
    return `
   <style>
    .chunk-${chunk} {
      display: none;
    }
   </style>
   `;
  }

  return "";
};

const renderApp = (res, req, context, store, isLast, isFirstTime = false) => {
  renderedTimes += 1;
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path} context={context}>
        <div>{renderRoutes(Routes)}</div>
      </StaticRouter>
    </Provider>
  );

  const app = `
      ${hideChunks(renderedTimes - 1)}
      <div class="chunk-${renderedTimes}" ${
    isLast ? 'id="root"' : ""
  }>${content}</div>
`;

  if (!isFirstTime) {
    res.write(Buffer.from(app));
    res.flush();
  }

  return app;
};

app.use(
  "/api",
  proxy("http://react-ssr-api.herokuapp.com", {
    proxyReqOptDecorator(opts) {
      opts.headers["x-forwarded-host"] = "localhost:3000";
      return opts;
    }
  })
);
app.use(expressStaticGzip("public", { index: false }));
app.use(compression());
app.get("*", (req, res) => {
  renderedTimes = 0;

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Transfer-Encoding": "chunked"
  });

  const store = createStore(req);
  const context = {};

  const initialApp = renderApp(res, req, context, store, false, true);
  const helmet = Helmet.renderStatic();

  const initialHTML = `
  <html ${helmet.htmlAttributes.toString()}>
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css" as="style" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">
        <style>
          @font-face {
            font-family: "Roboto", sans-serif;
            font-display: swap;
          }
        </style>
      </head>
      <body ${helmet.bodyAttributes.toString()}>
      <div class="progress pageLoader">
        <div class="indeterminate"></div>
      </div>
      <style>
      .pageLoader {
        display: none;
      }
   </style>
   ${initialApp}
  `;

  res.write(Buffer.from(initialHTML));
  res.flush();

  const promises2D = matchRoutes(Routes, req.path).map(({ route }) => {
    return route.loadData ? route.loadData(store) : null;
  });

  const promises = [].concat.apply([], promises2D);
  promises.map(promise => {
    if (promise) {
      return new Promise((resolve, reject) => {
        promise
          .then(() => {
            renderApp(res, req, context, store, false);
            resolve();
          })
          .catch(resolve);
      });
    }
  });

  Promise.all(promises).then(() => {
    if (context.url) {
      return res.redirect(301, context.url);
    }
    if (context.notFound) {
      res.status(404);
    }

    renderApp(res, req, context, store, true);

    const final = `
    <script>
          window.INITIAL_STATE = ${serialize(store.getState())}
        </script>
        <script src="bundle.js"></script>
      </body>
    </html>
    `;

    res.write(Buffer.from(final));
    res.end();
  });
});

app.listen(3000, () => {
  console.log("Listening on prot 3000");
});
