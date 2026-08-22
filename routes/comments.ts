import express from "express";
import { db } from "../app.js";
import pgp from "pg-promise";
import type { Comment } from "../types.js";
import { authenticated } from "../middleware/authMiddleware.js";
import { limiter } from "../middleware/limiter.js";
import cookieParser from "cookie-parser";

export const commentsRouter = express.Router();
const { as } = pgp;

commentsRouter.use(limiter);

commentsRouter.post("/:id/edit", authenticated, async (req, res, next) => {
  if (!req.params.id) {
    return res.status(404).send("Please enter the id of the comment!");
  }

  const comment = await db.one<Comment>(
    "SELECT * FROM comments WHERE id = $1",
    req.params.id,
  );

  if (comment.from !== req.session.username) {
    return res.status(403).send("You aren't allowed to edit this comment!");
  }

  if (req.body.message.length < 10) {
    return res.status(400).send("The minimum comment length is 10 characters!");
  }

  const cs = new (pgp().helpers.ColumnSet)(["message"], { table: "comments" });
  const where = as.format("WHERE id = $1", req.params.id);
  const update = `${pgp().helpers.update(req.body, cs)} ${where}`;

  db.none(update)
    .then((_) => {
      return res.status(200).send("Successfully edited your comment :D");
    })
    .catch(next);
});

commentsRouter.delete("/:id/delete", authenticated, async (req, res, next) => {
  if (!req.params.id) {
    return res.status(404).send("Please enter the id of the comment!");
  }

  const comment = await db.one<Comment>(
    "SELECT * FROM comments WHERE id = $1",
    req.params.id,
  );

  if (comment.from !== req.session.username) {
    return res.status(403).send("You aren't allowed to delete this comment!");
  }

  db.none("DELETE FROM comments WHERE id = $1", req.params.id)
    .then(() => {
      return res.status(200).send("Successfully deleted your comment :D");
    })
    .catch(next);
});

commentsRouter.get("/:id/replies", async (req, res, next) => {
  db.query("SELECT * FROM comments WHERE parent = $1", req.params.id)
    .then((comments) => {
      return res.status(200).json(comments);
    })
    .catch(next);
});

commentsRouter.post("/:id/reply", authenticated, async (req, res, next) => {
  const { message } = req.body;
  db.query(
    `INSERT INTO comments ("from", "on", message, parent)
    SELECT $1, "on", $2, id
    FROM comments
    WHERE id = $3`,
    [req.session.username, message, req.params.id],
  )
    .then(() => res.status(200).send("Successfully replied!"))
    .catch(next);
});

commentsRouter.post("/:id/like", authenticated, async (req, res, next) => {
  db.query(
    "UPDATE comments SET dislikes = array_remove(dislikes, $1), likes = array_append(likes, $1) WHERE id = $2 AND $1 <> ALL (likes)",
    [req.session.username, req.params.id],
  )
    .then(() => res.status(200).send("Successfully liked the comment!"))
    .catch(next);
});

commentsRouter.post("/:id/dislike", authenticated, async (req, res, next) => {
  db.query(
    "UPDATE comments SET likes = array_remove(likes, $1), dislikes = array_append(dislikes, $1) WHERE id = $2 AND $1 <> ALL (dislikes)",
    [req.session.username, req.params.id],
  )
    .then(() => res.status(200).send("Successfully disliked the comment!"))
    .catch(next);
});

commentsRouter.post("/:id/report", authenticated, async (req, res, next) => {
  db.query("INSERT INTO reports (${this:name}) VALUES (${this:csv})", {
    type: "comment",
    on: req.params.id,
    user: req.session.username,
  })
    .then(() =>
      res
        .status(200)
        .send("Successfully reported comment, an Admin will have a look soon!"),
    )
    .catch(next);
});