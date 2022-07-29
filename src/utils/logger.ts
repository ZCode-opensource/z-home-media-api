import logger from 'pino';
import {format} from 'date-fns';
import env from './env.js';

let log = logger();

if (env.DEVELOPMENT === 'true') {
  log = logger({
    base: {
      pid: false,
    },
    /**
     * @returns {string} Json formatted date string
     */
    timestamp: (): string => {
      return `,"time": "${format(new Date(), 'Y-MM-dd H:mm:ss')}"`;
    },
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });
}

export default log;
