const express = require("express");
const router = express.Router();
const pgp = require("pg-promise")();
const bcrypt = require("bcrypt");

require("dotenv").config();

const db = pgp(process.env.POSTGRES_ADDRESS);

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM admins WHERE username = $1", username)
    .then((admin) => {
      admin = admin[0];
      bcrypt.compare(password, admin.password, async (err, result) => {
        if (result) {
          req.session.username = username;
          req.session.adminId = admin.id;
          await req.session.save((err) => {
            if (err) {
              return res.status(500).send("Error saving session");
            }
            return res.status(200).send("Successfully logged in :D");
          });
        } else {
            return res.status(403).send("You are not an admin :(");
        }
      });
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.send("ERROR:", error);
    });
});

module.exports = router;
