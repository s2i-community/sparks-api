import express from "express";
import { AuthController } from "../../../controllers";
import { HttpMethodNotAllowedError } from "../../../utils/errors";

export const authRouter = express.Router();


authRouter.route("/sign-in")
  .post(AuthController.signIn)
  .all((req, res, next) => {
    const { httpStatus, message } = new HttpMethodNotAllowedError();
    res.status(httpStatus).json({ message });
  });


authRouter.route("/sign-out")
  .post(AuthController.signOut)
  .all((req, res, next) => {
    const { httpStatus, message } = new HttpMethodNotAllowedError();
    res.status(httpStatus).json({ message });
  });