import express from "express";
import { db } from "../app.js";
import pgp from "pg-promise";
import type { Comment } from "../types.js";
import { adminOnly } from "../middleware/authMiddleware.js";

export const commentsRouter = express.Router();
const { as } = pgp;

commentsRouter.post("/:id/edit", adminOnly, async (req, res, next) => {
  if (!req.params.id) {
    return res.status(404).send("Please enter the id of the comment!");
  }

  const comment = await db.one<Comment>("SELECT * FROM comments WHERE id = $1", req.params.id)

  if (comment.from !== req.session.username) {
    return res.status(403).send("You aren't allowed to edit this comment!")
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

commentsRouter.delete("/:id/delete", adminOnly, async (req, res, next) => {
    if (!req.params.id) {
        return res.status(404).send("Please enter the id of the comment!")
    }
    
    const comment = await db.one<Comment>("SELECT * FROM comments WHERE id = $1", req.params.id)

    if (comment.from !== req.session.username) {
        return res.status(403).send("You aren't allowed to edit this comment!")
    }
    
    db.none("DELETE FROM comments WHERE id = $1", req.params.id).then(() => {
        return res.status(200).send("Successfully deleted your comment :D");
    }).catch(next)
})