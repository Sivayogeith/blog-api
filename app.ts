import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import pgPromise from "pg-promise";
import pgSession from "connect-pg-simple";

import "dotenv/config";

import { postsRouter } from "./routes/posts";
import { indexRouter } from "./routes";
import { authRouter } from "./routes/auth";

export const app = express();
export const db = pgPromise()(process.env.POSTGRES_ADDRESS);

app.use(
  session({
    store: new (pgSession(session))({
      pgPromise: db,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    saveUninitialized: true
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use("/", indexRouter);
app.use("/posts", postsRouter);
app.use("/auth", authRouter);