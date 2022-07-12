declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      SALT_ROUNDS: string;
      SESSION_SECRET: string;
    }
  }
}

export {}