import type { RequestHandler } from "express";

export const adminOnly: RequestHandler = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("You are not an admin :(");
  }
  return next();
};

export const authenticated: RequestHandler = (req, res, next) => {
  if (!req.session.username) {
    return res.status(403).send("You aren't logged in :(")
  }

  return next()
}

export const ownerOnly: RequestHandler = (req, res, next) => {
  if (!req.session.isOwner) {
    return res.status(403).send("You are not the OWNER! (sage :3)")
  }

  return next()
}