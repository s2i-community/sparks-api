import { RequestHandler } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { UserService } from "../services";
import { IAuthJWT } from "../@types/auth";
import { IDefaultResponseBody } from "../@types/utils";

/**
 * Middleware that checks if the request has a valid JWT token in the Authorization header.
 * If the token is valid, it sets the user object in the response locals and calls the next middleware.
 * If the token is invalid or expired, it sends an error response.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authGuard: RequestHandler<{}, IDefaultResponseBody> = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, process.env['JWT_SECRET']!) as IAuthJWT;
    res.locals['user'] = await UserService.findUser(decodedToken._id);
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next(err);
  }
}