import express from "express";
import bcrypt from "bcrypt";

import type { User, Session } from "../types";
import { db } from "../app";

import pgp, { as } from "pg-promise";
import { adminOnly, authenticated } from "../middleware/authMiddleware";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(403).send("Please enter username and password!");
  }

  db.query<User[]>("SELECT * FROM users WHERE username = $1", username)
    .then((users) => {
      const user = users[0];
      if (!user) {
        return res.status(403).send("You aren't :(");
      }
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          req.session.username = username;
          req.session.userId = user.id;
          req.session.isAdmin = user.isAdmin
          return res.status(200).send("Successfully logged in :D");
        } else {
          return res.status(403).send("Wrong password :(");
        }
      });
    })
    .catch(next);
});

authRouter.get("/me", async (req, res, next) => {
  if (!req.sessionID) {
    return res.status(403).send("You don't have a session!");
  }

  db.query<Session[]>("SELECT * FROM session WHERE sid = $1", req.sessionID)
    .then((sessions) => {
      const session = sessions[0];
      return res.status(200).json({
        username: session?.sess.username,
        userId: session?.sess.userId,
        isAdmin: session?.sess.isAdmin
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

authRouter.post("/edit", adminOnly, async (req, res, next) => {
  const cs = new (pgp().helpers.ColumnSet)(["username"], {
    table: "users"
  });
  const where = as.format("WHERE id = $1", req.session.userId);
  const update = `${pgp().helpers.update(req.body, cs)} ${where}`
  db.none(update).then(() => {
    req.session.username = req.body.username
    return res.status(200).send("Successfully edited your information :D")
  }).catch(next);
});
