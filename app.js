const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const pgp = require("pg-promise")();
const logger = require('morgan');
const session = require('express-session');

require('dotenv').config()

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');

const app = express();
const db = pgp(process.env.POSTGRES_ADDRESS);

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pgPromise: db
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);

module.exports = app;
