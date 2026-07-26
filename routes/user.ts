import express from "express";
import { db } from "../app.js";

export const userRouter = express.Router();

userRouter.get("/:username", (req, res, next) => {
  db.oneOrNone(
    `SELECT username, image, name, "isAdmin" FROM users WHERE username = $1`,
    req.params.username,
  )
    .then((user) => {
      if (!user) {
        res.status(404).send("User does not exist!");
      }
      res.status(200).json(user);
    })
    .catch(next);
});