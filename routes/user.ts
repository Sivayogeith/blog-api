import express from "express";
import { db } from "../app.js";
import type { Comment, Post } from "../types.js";
import axios from "axios";
import multer, { memoryStorage } from "multer";
import { limiter } from "../middleware/limiter.js";

const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const userRouter = express.Router();

userRouter.get("/:username", (req, res, next) => {
  db.oneOrNone(
    `SELECT username, image, name, "isAdmin", "isOwner" FROM users WHERE username = $1`,
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

userRouter.get("/:username/posts", (req, res, next) => {
  db.query<Post[]>("SELECT * FROM posts WHERE author = $1", req.params.username).then(posts => {
    res.status(200).json(posts)
  }).catch(next)
})

userRouter.get("/:username/comments", (req, res, next) => {
  db.query<Comment[]>(`SELECT * FROM comments WHERE "from" = $1`, req.params.username).then(comments => {
    res.status(200).json(comments)
  }).catch(next)
})

userRouter.use(limiter)

userRouter.post("/upload", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    console.log(req.files);
    return res.status(404).json({ error: "Please upload a file!" });
  }
  const formData = new FormData();
  const blob = new Blob([Buffer.from(req.file.buffer)], {
    type: req.file?.mimetype,
  });
  formData.append("file", blob, req.file.originalname);
  axios
    .post("https://cdn.hackclub.com/api/v4/upload", formData, {
      headers: {
        Authorization: `Bearer ${process.env.CDN_API_KEY}`,
      },
      validateStatus: () => true,
    })
    .then((response) => res.status(response.status).json(response.data))
    .catch(next);
});
