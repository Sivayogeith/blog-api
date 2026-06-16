import express from  "express";
import { db } from "../app";
import type { Post } from "../types";

export const adminRouter = express.Router();

adminRouter.post("/createPost", async (req, res, next) => { 
    if (!req.session.username) {
        return res.status(403).send("You aren't logged in :(")
    }

    if (!["title", "body", "slug"].every(key => Object.hasOwn(req.body, key))) {
        return res.status(404).send("Please enter all the needed fields!")
    }
    
    db.query<Post[]>("INSERT INTO posts (${this:name}) VALUES (${this:csv})", req.body).then((posts) => {
      return res.status(200).send("Successfully created post :D");
    })
    .catch((error) => {
      console.log("ERROR:", error);
      return res.status(500).send("ERROR:" + error)
    });

    return res.status(200).send("Post created :D")
})