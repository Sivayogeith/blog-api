const express = require("express");
const router = express.Router();
require("dotenv").config();
const pgp = require("pg-promise")();

const db = pgp(process.env.POSTGRES_ADDRESS);

router.get("/", async (req, res, next) => {
  db.query("SELECT * FROM posts")
    .then((posts) => {
      console.log(posts);
      return res.json(posts);
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.send("ERROR:", error)
    });
});

module.exports = router;
