import axios from "axios";
import express, { response } from "express";

export const indexRouter = express.Router();

indexRouter.get("/", (req, res, next) => {
  res.send("ITS WORKING");
});

indexRouter.get("/totalTime", (req, res, next) => {
  axios
    .get(
      `https://hackatime.hackclub.com/api/v1/users/themeowingsage/projects/details?projects=blog,%20blog-api${req.query.start ? "&start=" + req.query.start : ""}`,
    )
    .then((response) => {
      const projects = response.data.projects;
      return res
        .status(response.status)
        .send(
          (projects[0].total_seconds + projects[1].total_seconds).toString(),
        );
    })
    .catch(next);
});

indexRouter.get("/macondoProject", (req, res, next) => {
  axios
    .get("https://macondo.hackclub.com/api/projects/7775")
    .then((response) => {
      return res.status(response.status).json(response.data);
    });
});
