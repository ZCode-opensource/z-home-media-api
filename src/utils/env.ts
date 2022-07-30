import 'dotenv/config';

export default {
  DEVELOPMENT: process.env.DEVELOPMENT || 'false',
  PORT: process.env.PORT || 8000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'must change this!!!',
  FFMPEG: process.env.FFMPEG || '/usr/bin/ffmpeg',
  FFPROBE: process.env.FFPROBE || '/usr/bin/ffprobe',
  REDIS_SERVER: process.env.REDIS_SERVER || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  MONGO_HOST: process.env.MONGO_HOST || '127.0.0.1',
  MONGO_PORT: process.env.MONGO_POST || 27017,
  MONGO_USER: process.env.MONGO_USER || 'root',
  MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'must change this!!!',
  MONGO_DATA_DIR: process.env.MONGO_DATA_DIR || './data',
  STORAGE: process.env.STORAGE || './storage',
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
};
