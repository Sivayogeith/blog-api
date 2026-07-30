import express from "express";

import type { Comment, Post } from "../types.js";
import { db } from "../app.js";
import { authenticated } from "../middleware/authMiddleware.js";
import { limiter } from "../middleware/limiter.js";

export const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts ORDER BY created_at DESC")
    .then((posts) => {
      return res.status(200).json(posts);
    })
    .catch(next);
});

postsRouter.get("/:slug", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts WHERE slug = $1", req.params.slug)
    .then((post) => {
      if (post.length) {
        return res.status(200).json(post[0]);
      }
      return res.status(404).send("Post not found :(");
    })
    .catch(next);
});

// Comments

postsRouter.get("/:slug/comments", async (req, res, next) => {
  db.query<Comment & { image: string }[]>(
    `SELECT c."from", c.message, c.created_at, c.id, u.image FROM comments c INNER JOIN users u ON c."from" = u.username WHERE c."on" = $1`,
    req.params.slug,
  )
    .then((comments) => {
      res.status(200).json(comments);
    })
    .catch(next);
});

postsRouter.use(limiter);

postsRouter.post("/:slug/comment", authenticated, async (req, res, next) => {
  const { message } = req.body;

  if (
    ![req.params.slug, message].every((v) => typeof v === "string" || "number")
  ) {
    return res.status(400).send("Please enter all the needed fields!");
  }

  db.query<Comment[]>(
    "INSERT INTO comments (${this:name}) VALUES (${this:csv})",
    { from: req.session.username, on: req.params.slug, message },
  )
    .then((_) => {
      return res.status(200).send("Successfully created comment :D");
    })
    .catch(next);
});
