import app, {redisClient} from '../app';
import supertest from 'supertest';
import * as mongodb from '../db/mongo.js';
import fs from 'fs';

let cookies: string;
let videoId: string;

beforeAll(async () => {
  await mongodb.connect();

  const response = await supertest(app)
      .post('/api/auth')
      .send({
        user: 'admin',
        password: 'admin',
      });

  expect(response.headers).toHaveProperty('set-cookie');
  cookies = response.headers['set-cookie'].pop().split(';')[0];
});

describe('Test upload video without session', () => {
  it('should return a 400 status code with error message', async () => {
    const response = await supertest(app)
        .post('/api/video/upload')
        .expect(400);
    expect((response.error as any).text).toEqual('Invalid user');
  });
});

describe('Test upload video without attachment', () => {
  it('should return a 400 status code with error message', async () => {
    const response = await supertest(app)
        .post('/api/video/upload')
        .set('Cookie', [cookies])
        .expect(400);
    expect((response.error as any).text).toEqual('No attachments found');
  });
});

describe('Test upload video with wrong attachment', () => {
  it('should return a 400 status with error message', async () => {
    const response = await supertest(app)
        .post('/api/video/upload')
        .set('Cookie', [cookies])
        .set('content-type', 'multipart/form-data')
        .attach(
            'myFile',
            fs.readFileSync(
                `${__dirname}/../../tests_resources/test.txt`,
            ),
            'test_video.mkv',
        ).expect(400);
    expect((response.error as any).text).toEqual('File not supported.');
  });
});

describe('Test upload video with correct attachment', () => {
  it('should return a 200 status with a json response', async () => {
    const response = await supertest(app)
        .post('/api/video/upload')
        .set('Cookie', [cookies])
        .set('content-type', 'multipart/form-data')
        .attach(
            'myFile',
            fs.readFileSync(
                `${__dirname}/../../tests_resources/test_video.mkv`,
            ),
            'test_video.mkv',
        ).expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body).toEqual(
        {
          'status': true,
          'videoId': expect.any(String),
          'message': 'File was uploaded',
        },
    );

    videoId = response.body.videoId;
  });
});

describe('Test get video info', () => {
  it('should return a 200 status with a json response', async () => {
    const response = await supertest(app)
        .get(`/api/video/${videoId}/info`)
        .set('Cookie', [cookies])
        .expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body).toEqual(
        {
          '_id': expect.any(String),
          'name': expect.any(String),
          'path': expect.any(String),
          'ts': expect.any(String),
          'width': expect.any(Number),
          'height': expect.any(Number),
          'fps': expect.any(String),
          'duration': null,
          'bitrate': null,
          'status': 2,
        },
    );
  });
});

describe('Test get video without range header', () => {
  it('should return a 400 status with error message', async () => {
    const response = await supertest(app)
        .get(`/api/video/${videoId}`)
        .set('Cookie', [cookies])
        .expect(400);
    expect((response.error as any).text).toEqual('Requires Range header');
  });
});


describe('Test get video', () => {
  it('should return a 206 status with partial content', async () => {
    const response = await supertest(app)
        .get(`/api/video/${videoId}`)
        .set('Cookie', [cookies])
        .set('Range', 'bytes=0-')
        .expect(206);
    expect(response.body).toEqual(expect.any(Buffer));
  });
});

afterAll(async () => {
  await mongodb.disconnect();
  await redisClient.disconnect();
});
