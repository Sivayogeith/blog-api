import express from  "express";

export const adminRouter = express.Router();

adminRouter.post("/createPost", async (req, res, next) => { 
    if (!req.session.username) {
        return res.status(403).send("You aren't logged in :(")
    }

    if ([""].every(key => Object.hasOwn(req.body, key)))

    return res.status(200).send("Post created :D")
})