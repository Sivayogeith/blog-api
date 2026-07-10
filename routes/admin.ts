import express from "express";
import { db } from "../app.js";
import type { Post } from "../types.js";
import pgp from "pg-promise";
import { adminOnly } from "../middleware/authMiddleware.js";

export const adminRouter = express.Router();
const { as } = pgp;

adminRouter.use(adminOnly);

adminRouter.post("/createPost", async (req, res, next) => {
  const { title, body, slug } = req.body;

  if (![title, body, slug].every((v) => typeof v === "string")) {
    return res.status(400).send("Please enter all the needed fields!");
  }

  db.query<Post[]>("INSERT INTO posts (${this:name}) VALUES (${this:csv})", {
    title,
    body,
    slug,
  })
    .then((_) => {
      return res.status(200).send("Successfully created post :D");
    })
    .catch(next);
});

adminRouter.post("/editPost", async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send("Please enter the id of the post!");
  }

  const cs = new (pgp().helpers.ColumnSet)(["title", "body", "slug", "stats"], {
    table: "posts",
  });
  const where = as.format("WHERE id = $1", req.body.id);

  const update = `${pgp().helpers.update(req.body, cs)} ${where}`;

  db.none(update)
    .then((posts) => {
      return res.status(200).send("Successfully edited the post :D");
    })
    .catch(next);
});

adminRouter.delete("/deletePost", async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send("Please enter the id of the post!");
  }

  db.query("DELETE FROM posts WHERE id = $1", req.body.id)
    .then(() => {
      return res.status(200).send("Successfully deleted the post :D");
    })
    .catch(next);
});

adminRouter.get("/stats", async (req, res, next) => {
  db.query<{ stats: { readingTime: number; words: number } }[]>(
    "SELECT (stats) FROM posts",
  )
    .then((stats) => {
      let readingTime = 0,
        words = 0;
      for (let stat of stats) {
        readingTime += stat.stats.readingTime;
        words += stat.stats.words;
      }
      res.status(200).json({ readingTime, words });
    })
    .catch(next);
});
