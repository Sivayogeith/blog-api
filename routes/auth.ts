import express from "express";
import bcrypt from "bcrypt";

import type { Admin, Session } from "../types";
import { db } from "../app";

import pgp, { as } from "pg-promise";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(403).send("Please enter username and password!");
  }
  db.query<Admin[]>("SELECT * FROM admins WHERE username = $1", username)
    .then((admins) => {
      const admin = admins[0];
      if (!admin) {
        return res.status(403).send("You are not an admin :(");
      }
      bcrypt.compare(password, admin.password, async (err, result) => {
        if (result) {
          req.session.username = username;
          req.session.adminId = admin.id;
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
        adminId: session?.sess.adminId,
      });
    })
    .catch(next);
});

authRouter.get("/logout", async (req, res, next) => {
  if (!req.sessionID) {
    return res.status(403).send("You are already logged out!");
  }
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send("Successfully logged out :D");
  });
});

authRouter.post("/edit", async (req, res, next) => {
  if (!req.sessionID) {
    return res.status(403).send("You aren't logged in!");
  }
  const cs = new (pgp().helpers.ColumnSet)(["username"], {
    table: "admins"
  });
  const where = as.format("WHERE id = $1", req.session.adminId);
  const update = `${pgp().helpers.update(req.body, cs)} ${where}`
  db.none(update).then(() => {
    req.session.username = req.body.username
    return res.status(200).send("Successfully edited your information :D")
  }).catch(next);
});
