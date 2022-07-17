import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectRedis from 'connect-redis';
import {createClient} from 'redis';
import session from 'express-session';
import fileupload from 'express-fileupload';
import fs from 'fs';
import {connectToServer} from './db/mongo.js';
import auth from './endpoints/auth.js';
import video from './endpoints/video.js';
import videos from './endpoints/videos.js';
import image from './endpoints/image.js';
import requireAuth from './middleware/requireAuth.js';

if (!fs.existsSync(process.env.STORAGE as string)) {
  console.log('Storage not found, server not running.');
  process.exitCode = 1;
} else {
  const RedisStore = connectRedis(session);
  const redisClient = createClient({legacyMode: true});
  redisClient
      .connect()
      .then(() => {
        console.log('redis connected');
      })
      .catch(console.error);

  const app = express();
  const port = process.env.PORT;
  const allowedOrigins = ['http://localhost', 'http://localhost:8080'];

  const options: cors.CorsOptions = {
    origin: allowedOrigins,
    credentials: true,
  };

  app.use(
      session({
        store: new RedisStore({client: redisClient}),
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Change in production
          httpOnly: true,
        },
      }),
  );
  app.use(cors(options));
  app.use(cookieParser());
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

  connectToServer(function(error: any) {
    if (error) {
      console.log(error);
      process.exit();
    }

    app.listen(port, function() {
      console.log(`[server]: Server is running on port ${port}`);
    });
  });
}
