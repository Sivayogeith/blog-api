import axios, { type AxiosResponse } from "axios";
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

indexRouter.get("/commitsData", (req, res, next) => {
  const headers = {
    Authorization: "Bearer " + process.env.GITHUB_TOKEN,
  };
  Promise.all([
    axios.get(
      "https://api.github.com/repos/sivayogeith/blog/commits?sha=main&per_page=1&page=1",
      { headers },
    ),
    axios.get(
      "https://api.github.com/repos/sivayogeith/blog-api/commits?sha=main&per_page=1&page=1",
      { headers },
    ),
  ])
    .then(([blog, blogAPI]) => {
      const getCount = (res: any) =>
        parseInt(
          new URL(
            res.headers.get("Link").match(/<([^>]+)>;\s*rel="last"/)?.[1],
          ).searchParams.get("page")!,
        );

      return res.status(200).json({
        blog: { count: getCount(blog), last: blog.data[0] },
        blogAPI: { count: getCount(blogAPI), last: blogAPI.data[0] },
      });
    })
    .catch(next);
});
