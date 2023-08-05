import express from "express";
import { usersRouter } from "./users";

export const v1Router = express.Router();

v1Router.use("/users", usersRouter);