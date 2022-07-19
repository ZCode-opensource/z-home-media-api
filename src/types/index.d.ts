// eslint-disable-next-line no-unused-vars
import {SessionData} from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    user?: string;
    profile?: number;
  }
}
