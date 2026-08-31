import express, {
  type NextFunction,
  type Response,
  type Request,
} from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import pgPromise from "pg-promise";
import pgSession from "connect-pg-simple";

import "dotenv/config";

import { postsRouter } from "./routes/posts.js";
import { indexRouter } from "./routes/index.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { commentsRouter } from "./routes/comments.js";
import { userRouter } from "./routes/user.js";
import { ownerRouter } from "./routes/owner.js";
import { AxiosError } from "axios";

const app = express();
const db = pgPromise()(process.env.POSTGRES_ADDRESS);

const DEFAULT_PFP =
  "https://cdn.hackclub.com/019fb16b-462b-7081-a1e7-9625eec46b95/icon-Capybara.png";

app.use(
  session({
    store: new (pgSession(session))({
      pgPromise: db,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    saveUninitialized: false,
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use("/", indexRouter);
app.use("/posts", postsRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/comments", commentsRouter);
app.use("/user", userRouter);
app.use("/owner", ownerRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("ERROR: ", err);
  return res.status(500).send(err instanceof AxiosError ? `ERROR - ${err.status}: ${JSON.stringify(err.response?.data)}` : "ERROR:" + err);
});

export default app;
export { db, DEFAULT_PFP };
