import express from  "express";

import type { Post } from "../types";
import { db } from "../app";

export const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts")
    .then((posts) => {
      return res.status(200).json(posts);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.status(500).send("ERROR:" + error)
    });
});

postsRouter.get("/:slug", async (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts WHERE slug = $1", req.params.slug)
    .then((post) => {
      return res.status(200).json(post[0]);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.status(500).send("ERROR:" + error)
    });
});