import express from "express";

import type { Comment, Post } from "../types";
import { db } from "../app";

export const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts")
    .then((posts) => {
      return res.status(200).json(posts);
    })
    .catch(next);
});

postsRouter.get("/:slug", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts WHERE slug = $1", req.params.slug)
    .then((post) => {
      if (post.length){
        return res.status(200).json(post[0]);
      }
      return res.status(404).send("Post not found :(")
    })
    .catch(next);
});

// Comments

postsRouter.get("/:id/comments", async (req, res, next) => {
  db.query<Comment[]>("SELECT * FROM comments WHERE on = $1", req.params.id)
    .then((comments) => {
      res.status(200).json(comments);
    })
    .catch(next);
});

postsRouter.post("/:id/comment", async (req, res, next) => {
  if (!req.session.username) {
    res.status(403).send("You aren't logged in :(");
  }

  const { from, message } = req.body;

  if (![from, req.params.id, message].every((v) => typeof v === "string" || "number")) {
    return res.status(400).send("Please enter all the needed fields!");
  }

  db.query<Comment[]>(
    "INSERT INTO comments (${this:name}) VALUES (${this:csv})",
    { from, on: req.params.id, message },
  )
    .then((_) => {
      return res.status(200).send("Successfully created comment :D");
    })
    .catch(next);
});
