# Sage's Blog API

**This is the backend of my Blog, you can find the frontend [here](https://github.com/Sivayogeith/blog)!**

This project is a fullstack blog with a bunch of awesome features, this was mainly made for [Macondo](https://macondo.hackclub.com/) by Hackclub!

### API

- `/posts`
  - `/`: Gets all posts
  - `/:slug`: Gets the post with the given slug
  - `/:id/comment`: Adds comment to the given post from the given user
  - `/:id/comments`: Gets all comments on the given post
- `/admin`
  - `/createPost`: Creates a Post with the given fields
  - `/editPost`: Edits a given post with the given fields
  - `/deletePost`: Deletes a given post
  - `/stats`: Gets total reading time and total words of all posts
- `/auth`
  - `/register`: Registers a new user with the given details and sets session
  - `/login`: Logins a new user with the given details and sets session
  - `/me`: Gets current session
  - `/logout`: Destroys current session
  - `/edit`: Edits user with given details
- `/comments`
  - `/:id/edit`: Edits a given comment with given details
  - `/:id/delete`: Deletes a given comment

### Built on

- Next JS
- Express JS
- Postgres (Supabase)
