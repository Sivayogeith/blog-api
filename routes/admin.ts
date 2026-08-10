import express from "express";
import { db } from "../app.js";
import type { Post, User } from "../types.js";
import pgp from "pg-promise";
import { adminOnly, authenticated } from "../middleware/authMiddleware.js";
import axios from "axios";
import multer, { memoryStorage } from "multer";
import { limiter } from "../middleware/limiter.js";

export const adminRouter = express.Router();
const { as } = pgp;

const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

adminRouter.post("/respondInvite", authenticated, (req, res, next) => {
  const { accept } = req.body;
  if (typeof accept !== "boolean") {
    return res.status(400).send("accept has to be a boolean!");
  }

  db.oneOrNone(
    `UPDATE users SET "isAdmin" = $1, "isInvitedAdmin" = false WHERE username = $2 AND "isInvitedAdmin" = true RETURNING username`,
    [accept, req.session.username],
  )
    .then((username) => {
      if (!username) {
        return res.status(403).send("You are not invited to Admins!");
      }
      return res
        .status(200)
        .send(
          accept
            ? "Congrats! You are an Admin now :D"
            : "Sorry, successfully rejected your Admin invite :(",
        );
    })
    .catch(next);
});

adminRouter.use(adminOnly);

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

adminRouter.use(limiter);

adminRouter.post("/createPost", async (req, res, next) => {
  const { title, body, slug, stats, cover } = req.body;
  if (
    ![
      title,
      body,
      slug,
      stats?.readingTime,
      stats?.words,
      cover?.src,
      cover?.type,
    ].every((v) => typeof v === "string" || "number")
  ) {
    return res.status(400).send("Please enter all the needed fields!");
  }

  db.query<Post[]>("INSERT INTO posts (${this:name}) VALUES (${this:csv})", {
    title,
    body,
    slug,
    stats,
    cover,
    author: req.session.username,
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

  const cs = new (pgp().helpers.ColumnSet)(
    ["title", "body", "slug", "stats", "cover"],
    {
      table: "posts",
    },
  );
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

adminRouter.post("/upload", upload.single("file"), async (req, res, next) => {
  db.one<User>("SELECT * FROM users WHERE id = $1", req.session.userId)
    .then((user) => {
      if (!req.file) {
        console.log(req.files);
        return res.status(404).json({ error: "Please upload a file!" });
      }
      if (!user.cdnAPIKey) {
        return res
          .status(403)
          .json({ error: "Please enter a API key for Hackclub CDN!" });
      }
      const formData = new FormData();
      const blob = new Blob([Buffer.from(req.file.buffer)], {
        type: req.file?.mimetype,
      });
      formData.append("file", blob, req.file.originalname);
      axios
        .post("https://cdn.hackclub.com/api/v4/upload", formData, {
          headers: {
            Authorization: `Bearer ${user.cdnAPIKey}`,
          },
          validateStatus: () => true,
        })
        .then((response) => res.status(response.status).json(response.data))
        .catch(next);
    })
    .catch(next);
});
