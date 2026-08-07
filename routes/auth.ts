import express from "express";
import bcrypt from "bcrypt";

import type { User, Session } from "../types.js";
import { db, DEFAULT_PFP } from "../app.js";
import { limiter } from "../middleware/limiter.js";

import pgp from "pg-promise";
import { authenticated } from "../middleware/authMiddleware.js";
import session from "express-session";

export const authRouter = express.Router();
const { as } = pgp;

authRouter.get("/me", async (req, res, next) => {
  if (!req.sessionID) {
    return res.status(403).send("You don't have a session!");
  }

  db.query<Session[]>("SELECT * FROM session WHERE sid = $1", req.sessionID)
    .then((sessions) => {
      const session = sessions[0];
      return res.status(200).json({
        username: session?.sess.username,
        name: session?.sess.name,
        userId: session?.sess.userId,
        isAdmin: session?.sess.isAdmin,
        isOwner: session?.sess.isOwner,
      });
    })
    .catch(next);
});

authRouter.use(limiter);

authRouter.post("/register", async (req, res, next) => {
  let { username, name, password, image } = req.body;

  if (
    username.length < 4 ||
    username.length > 15 ||
    name.length < 4 ||
    name.length > 15 ||
    password.length < 8
  ) {
    return res
      .status(400)
      .send(
        "Username must be at least 4 chars long and maximum 15 chars, Name must be at least 4 chars long and maximum 15 chars and Password must be at least 8 chars long",
      );
  }

  const doesUserExist = await db.query<User[]>(
    "SELECT * FROM users WHERE username = $1",
    username,
  );
  if (doesUserExist.length) {
    return res.status(409).send("Username is already in use :(");
  }

  if (image && image !== "") {
    image = DEFAULT_PFP;
  }

  bcrypt.hash(password, 10, (err, hashedPass) =>
    err
      ? next(err)
      : db
          .one<{ id: number }>(
            "INSERT INTO users (${this:name}) VALUES (${this:csv}) RETURNING id",
            { username, password: hashedPass, name, image },
          )
          .then(({ id }) => {
            req.session.name = name;
            req.session.username = username;
            req.session.userId = id;
            req.session.isAdmin = false;
            req.session.isOwner = false;
            return res.status(200).send("Successfully registered user :D");
          })
          .catch(next),
  );
});

authRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(403).send("Please enter username and password!");
  }

  db.query<User[]>("SELECT * FROM users WHERE username = $1", username)
    .then((users) => {
      const user = users[0];
      if (!user) {
        return res.status(403).send("You aren't a real person :(");
      }
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          req.session.username = username;
          req.session.name = user.name;
          req.session.userId = user.id;
          req.session.isAdmin = user.isAdmin;
          req.session.isOwner = user.isOwner;

          return res.status(200).send("Successfully logged in :D");
        } else {
          return res.status(403).send("Wrong password :(");
        }
      });
    })
    .catch(next);
});

authRouter.get("/logout", authenticated, async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send("Successfully logged out :D");
  });
});

authRouter.post("/edit", authenticated, async (req, res, next) => {
  if (req.body.image == "") {
    req.body.image = DEFAULT_PFP
  }
  const cs = new (pgp().helpers.ColumnSet)(["username", "name", "image"], {
    table: "users",
  });
  const where = as.format("WHERE id = $1", req.session.userId);
  const update = `${pgp().helpers.update(req.body, cs)} ${where}`;
  db.none(update)
    .then(() => {
      req.session.username = req.body.username;
      return res.status(200).send("Successfully edited your information :D");
    })
    .catch(next);
});
