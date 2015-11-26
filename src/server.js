'use strict';
import express from 'express';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RoutingContext } from 'react-router';
import routes from './routes';

const app = express();

app.set('views', path.join(__dirname, '..', 'src', 'views'));
app.set('view engine', 'jade');

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  match({ routes, location: req.originalUrl }, (err, redirectLocation, renderProps) => {
    if (err) {
      next(err);
    } else if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const markup = renderToString(<RoutingContext {...renderProps} />);
      res.render('app', { markup });
    } else {
      next();
    }
  });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message });
});

app.listen(process.env.PORT || 5000);
