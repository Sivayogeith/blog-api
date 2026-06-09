const express = require("express");
const router = express.Router();
require("dotenv").config();
const pgp = require("pg-promise")();

const db = pgp(process.env.POSTGRES_ADDRESS);

router.get("/", async (req, res, next) => {
  db.query("SELECT * FROM posts")
    .then((posts) => {
      return res.json(posts);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.send("ERROR:", error)
    });
});

router.get("/:slug", async (req, res, next) => {
  db.query("SELECT * FROM posts WHERE slug = $1", req.params.slug)
    .then((post) => {
      return res.json(post[0]);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.send("ERROR:", error)
    });
});

module.exports = router;
