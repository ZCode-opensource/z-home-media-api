import express from 'express';
import cors from 'cors';
import connectRedis from 'connect-redis';
import {createClient} from 'redis';
import session from 'express-session';
import env from './utils/env.js';
import cookieParser from 'cookie-parser';
import fileupload from 'express-fileupload';
import auth from './endpoints/auth.js';
import video from './endpoints/video.js';
import videos from './endpoints/videos.js';
import image from './endpoints/image.js';
import requireAuth from './middleware/requireAuth.js';
import logger from './utils/logger.js';

let isDevelopment = false;

const app = express();

const allowedOrigins = ['http://localhost', 'http://localhost:8080'];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const RedisStore = connectRedis(session);
const redisClient = createClient({
  legacyMode: true,
  url: `redis://${env.REDIS_SERVER}:${env.REDIS_PORT}`,
});

if (env.DEVELOPMENT === 'true') {
  isDevelopment = true;
  logger.info('Development mode');
}

redisClient.connect().then(() => {
  logger.info('Successfully connected to redis.');
}).catch((_error:any) => {
  logger.error('Failed to connect to redis, server not running');
  process.exitCode = 1;
  process.exit();
});

app.use(cors(options));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({client: redisClient, unref: true}),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isDevelopment ? false : true,
    httpOnly: true,
  },
}));
app.use(requireAuth);
app.use(express.json());
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

app.use('/api/auth', auth);
app.use('/api/video', video);
app.use('/api/videos', videos);
app.use('/api/image', image);

export default app;
export {redisClient};
