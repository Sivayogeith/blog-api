# Sage's Blog API

**This is the backend of my Blog, you can find the frontend [here](https://github.com/Sivayogeith/blog)!**

This project is a fullstack blog with a bunch of awesome features, this was mainly made for [Macondo](https://macondo.hackclub.com/) by Hackclub!

### Features
- Blog Posts from the DB
- User register and login
- Admin users can Create/Edit/Delete Blog Posts
- Dark/Light mode
- Markdown editor for post creation and editing
- Uploading Images to HackClub CDN for blog post covers and profile pictures
- User page for each user which showcases their comments, blog posts and if they are admin/owner
- Profile page where you can edit your account
- Linking to Hack Club Auth to comment on blog posts
- Owner Users page where every user is displayed and can be invited to/revoked from admins
- About page which calls Hackatime and Macondo APIs to display stats about this project! (and awesome Macbook Air progress bar!)
- Invite page for when a admin gets invited and where the user can accept/reject it
- Comments with Like, Dislike, Reply, Report and Edit/Delete for the authors
- Opengraph for user and blog pages with details about the user/blog
- Latest commits from both repos displayed on footer

### API
- `/posts`
  - `/`: Gets all posts
  - `/:slug`: Gets the post with the given slug
  - `/:slug/comment`: Adds comment to the given post from the given user
  - `/:slug/comments`: Gets all comments on the given post
- `/admin`
  - `/createPost`: Creates a Post with the given fields
  - `/editPost`: Edits a given post with the given fields
  - `/deletePost`: Deletes a given post
  - `/stats`: Gets total reading time and total words of all posts
  - `/upload`: Upload API to HackClub CDN for blog post covers
  - `/checkInvite`: Checks if current user got invited to join the Admins
  - `/respondInvite`: Responds to an invite to join the Admins (accept/reject)
- `/auth`
  - `/register`: Registers a new user with the given details and sets session
  - `/login`: Logins a new user with the given details and sets session
  - `/me`: Gets current session
  - `/logout`: Destroys current session
  - `/edit`: Edits user with given details
  - `/setSlackId`: Takes code from HCA and does the HCA process to get the users slackId and sets it in the database
- `/comments`
  - `/:id/edit`: Edits a given comment with given details
  - `/:id/delete`: Deletes a given comment
  - `/:id/replies`: Gets all replies of a given comment
  - `/:id/reply`: Reply to a comment with the given message
  - `/:id/like`: Like a given comment
  - `/:id/dislike`: Dislike a given comment
  - `/:id/removeOpinion`: Removes current users dislike/like from a given comment
  - `/:id/report`: Reports a given comment (this adds the comment to a reports table which admins review)
- `/owner`
  - `/getUsers`: Owner API which gets all users data
  - `/inviteAdmin`: Owner API to invite an user to be a Admin
  - `/removeAdmin`: Owner API to remove someone from Admins
- `/user`
  - `/:username`: Gets a given users data
  - `/:username/stats`: Gets a given users stats - post and comments count
  - `/:username/posts`: Gets all posts made by a given user
  - `/:username/comments`: Gets all comments made by a give user
  - `/upload`: Upload API to HackClub CDN for profile pictures (uses my personal API key)
- `/`
  - `/totalTime`: Gets total time spent on this blog from Hackatime API
  - `/macondoProject`: Gets the Macondo Project from Macondo API
  - `/commitsData`: Gets latest commits data and total commits count from Github API

### Images
<img width="1906" height="1013" alt="blog post" src="https://github.com/user-attachments/assets/42628d02-92a6-488e-ba21-99a1b1d536ad" />

<details>
  <summary>More Images..</summary>
  <br/>
  <img width="1906" height="1014" alt="create post" src="https://github.com/user-attachments/assets/ce1a71e3-ebaa-447e-839d-62fc9934c742" />
  <img width="1907" height="1014" alt="dashboard" src="https://github.com/user-attachments/assets/38456088-c9f1-41cd-9fd4-926c4f4108dc" />
  <img width="1905" height="1013" alt="profile page" src="https://github.com/user-attachments/assets/d4f00259-7c1e-4d9f-a58b-d7ffcc63ac9f" />
  <img width="1907" height="1012" alt="main blog page" src="https://github.com/user-attachments/assets/9bbcd54a-806e-44c2-994c-5564e907bc79" />
</details>

### Development
#### Clone the Github repo!
```bash
git clone https://github.com/Sivayogeith/blog-api
```

#### Running a local server!
```bash
cd blog-api
bun dev
```
Now go to localhost:5480 to test the API!

### Built on
- Next JS
- Express JS
- Postgres (Supabase)