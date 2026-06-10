import express from "express";
import bcrypt from "bcrypt";

import type { Admin } from "../types";
import { db } from "../app";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
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
          req.session.save((err) => {
            if (err) {
              return res.status(500).send("Error saving session :(");
            }
            return res.status(200).send("Successfully logged in :D");
          });
        } else {
          return res.status(403).send("Wrong password :(");
        }
      });
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.send("ERROR:" + error);
    });
});
