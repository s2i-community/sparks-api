import csrf from "csrf";
import { NextFunction, Request, Response } from "express";
import { csrfConfig } from "../configs/csrf.config";

const tokens = new csrf();
const secret = tokens.secretSync();

export function csrfMiddleware(
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) {
  const token = req.headers[csrfConfig.headerName] as string;
  const isValidToken = tokens.verify(secret, token);

  if (isValidToken) next();
  else res.status(403).json({ message: "Invalid CSRF token" });
}