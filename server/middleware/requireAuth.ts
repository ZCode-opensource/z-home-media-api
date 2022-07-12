import { Request, Response, NextFunction } from 'express';

function requireAuth (req: Request, res: Response, next: NextFunction) {
  // console.log(req.path);
  // console.log(req.session);

  if (req.path !== '/api/auth') {
    if (req.session.userId === undefined) {
      console.log('Bloqued request!');
      res.status(400).send('Invalid user');
      return;
    }
  }

  next()
}

export default requireAuth;