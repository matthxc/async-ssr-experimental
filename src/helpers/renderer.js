import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import serialize from 'serialize-javascript';
import { Helmet } from 'react-helmet';
import Routes from '../client/Routes';

export default async (res, req, store, context) => {
  const helmet = Helmet.renderStatic();
  
  const initialHTML = `
  <html>
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">
      <script>
        window.INITIAL_STATE = ${serialize(store.getState())}
      </script>
      </head>
      <body>
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
  `;

  res.write(Buffer.from(initialHTML));

  res.flush();

  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 2000)
  })

  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path} context={context}>
        <div>{renderRoutes(Routes)}</div>
      </StaticRouter>
    </Provider>
  );

  const app = `
        <div id="root">${content}</div>
        <script src="bundle.js"></script>
      </body>
    </html>
  `;

  res.write(Buffer.from(app));

  res.flush();
};
