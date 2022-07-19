import 'dotenv/config';

export default {
  PORT: process.env.PORT || 8000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'must change this!!!',
  FFMPEG: process.env.FFMPEG || '/usr/bin/ffmpeg',
  FFPROBE: process.env.FFPROBE || '/usr/bin/ffprobe',
  STORAGE: process.env.STORAGE || '/mnt/storage',
};
