import express from "express";
import { ownerOnly } from "../middleware/authMiddleware.js";
import { db } from "../app.js";

export const ownerRouter = express.Router();
ownerRouter.use(ownerOnly);

ownerRouter.post("/addAdmin", (req, res, next) => {
  const { username } = req.body;
  db.none(`UPDATE users SET "isAdmin" = true WHERE username = $1`, username)
    .then((_) => res.status(200).send(`Successfully made ${username} a Admin!`))
    .catch(next);
});

ownerRouter.delete("/removeAdmin", (req, res, next) => {
  const { username } = req.body;
  db.none(`UPDATE users SET "isAdmi" = false WHERE username = $1`, username)
    .then((_) =>
      res.status(200).send(`Successfully removed ${username} from Admins!`),
    )
    .catch(next);
});
