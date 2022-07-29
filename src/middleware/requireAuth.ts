import {Request, Response, NextFunction} from 'express';
import logger from '../utils/logger.js';

/**
 *
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next NextFunction
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path !== '/api/auth') {
    if (req.session === undefined || req.session.userId === undefined) {
      logger.info('Bloqued request:' + req.ip);
      res.status(400).send('Invalid user');
      return;
    }
  }

  next();
}

export default requireAuth;
