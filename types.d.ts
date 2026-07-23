import type { SessionData } from "express-session";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_ADDRESS: string;
      SESSION_SECRET: string;
    }
  }
}

declare module "express-session" {
  export interface SessionData {
    username: string;
    userId: number;
    isAdmin: boolean;
  }
}

export interface Post {
  id: number;
  title: string;
  body: string;
  created_at: string;
  slug: string;
  stats: {
    readingTime: number;
    words: number;
  }
  cover?: {
    type: string;
    src: string;
    caption: string;
  }
}

export interface User {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
  cdnAPIKey?: string;
}

export interface Session {
  sid: string;
  sess: SessionData;
  expire: string;
}

export interface Comment {
  id: number;
  created_at: string;
  from: string; // username from users
  on: number; // id from posts
  message: string;
}