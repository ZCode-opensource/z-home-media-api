import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToServer } from './db/mongo';
import cookieParser from 'cookie-parser';
import auth from './endpoints/auth';
import video from './endpoints/video';
import videos from './endpoints/videos';
import image from './endpoints/image';
import requireAuth from './middleware/requireAuth';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import session from 'express-session';

const RedisStore = connectRedis(session);
const redisClient = createClient({ legacyMode: true });
redisClient
  .connect()
  .then(() => {
    console.log('redis connected');
  })
  .catch(console.error);

dotenv.config();

const app = express();
const port = process.env.PORT;
const allowedOrigins = ['http://localhost', 'http://localhost:8080'];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,  // Change in production
      httpOnly: true,
    },
  })
);
app.use(cors(options));
app.use(cookieParser());
app.use(requireAuth);
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/video', video);
app.use('/api/videos', videos);
app.use('/api/image', image);

connectToServer(function (error: any) {
  if (error) {
    console.log(error);
    process.exit();
  }

  app.listen(port, function () {
    console.log(`[server]: Server is running on port ${port}`);
  });
});
