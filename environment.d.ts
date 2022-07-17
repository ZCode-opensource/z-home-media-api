declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      PORT: string;
      SALT_ROUNDS: string;
      SESSION_SECRET: string;
      FFMPEG: string;
      STORAGE: string;
    }
  }
}

export {};
