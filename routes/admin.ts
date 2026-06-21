import express from "express";
import { db } from "../app";
import type { Post } from "../types";
import pgp, { as } from "pg-promise";

export const adminRouter = express.Router();

adminRouter.post("/createPost", async (req, res, next) => {
  if (!req.session.username) {
    return res.status(403).send("You aren't logged in :(");
  }

  const { title, body, slug } = req.body;

  if (![title, body, slug].every((value) => typeof value === "string")) {
    return res.status(400).send("Please enter all the needed fields!");
  }

  db.query<Post[]>("INSERT INTO posts (${this:name}) VALUES (${this:csv})", {
    title,
    body,
    slug,
  })
    .then((posts) => {
      return res.status(200).send("Successfully created post :D");
    })
    .catch(next);
});

adminRouter.post("/editPost", async (req, res, next) => {
  if (!req.session.username) {
    return res.status(403).send("You aren't logged in :(");
  }

  if (!req.body.id) {
    return res.status(404).send("Please enter the id of the post!");
  }

  const cs = new (pgp().helpers.ColumnSet)(["title", "body", "slug"], {
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
  if (!req.session.username) {
    return res.status(403).send("You aren't logged in :(");
  }
  if (!req.body.id) {
    return res.status(404).send("Please enter the id of the post!");
  }

  db.query("DELETE FROM posts WHERE id = $1", req.body.id)
    .then(() => {
      return res.status(200).send("Successfully deleted the post :D");
    })
    .catch(next);
});