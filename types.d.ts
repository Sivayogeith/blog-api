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
    adminId: number;
  }
}

export interface Post {
  id: number;
  title: string;
  body: string;
  created_at: string;
  slug: string;
}

export interface Admin {
  id: number;
  username: string;
  password: string;
}

export interface Session {
  sid: string;
  sess: SessionData;
  expire: string;4
}
