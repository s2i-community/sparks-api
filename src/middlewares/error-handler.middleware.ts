import { ErrorRequestHandler } from "express";
import { errorToRestStatus, formatErrorResponse } from "../utils/errors";
import { log } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = async function (err, req, res, next) {
  const { user } = res.locals;
  const sessionId = user?._id ? user._id.toString() : undefined;

  log.error(err, sessionId);

  const status = errorToRestStatus(err);
  const message: string =
    status !== 500 ? err.message : "Internal server error";

  res
    .status(status)
    .json(formatErrorResponse(message, err.details));
}