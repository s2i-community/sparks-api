import express from "express";
import { authGuard } from "../../../middlewares";
import { usersRouter } from "./users.routes";
import { authRouter } from "./auth.routes";
import { NotFoundError } from "../../../utils/errors";

export const v1Router = express.Router();


// Authentication routes
v1Router.use("/auth", authRouter);


// User routes
v1Router.use("/users", authGuard, usersRouter);


// Catch all other routes
v1Router.all("*", (req, res, next) => {
  const notFoundError = new NotFoundError();
  res.status(notFoundError.httpStatus).json({ message: notFoundError.message });
});