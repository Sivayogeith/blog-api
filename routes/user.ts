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

userRouter.get("/:username/stats", (req, res, next) => {
  Promise.all([
    db.one("SELECT count(*) FROM posts WHERE author = $1", req.params.username),
    db.one(`SELECT count(*) FROM comments WHERE "from" = $1`, req.params.username),
  ])
    .then(([posts, comments]) => {
      res.status(200).json({
        posts: +posts.count,
        comments: +comments.count,
      });
    })
    .catch(next);
});
