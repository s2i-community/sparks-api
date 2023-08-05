import express from "express";
import * as Controllers from "../../../controllers";
import { IUser } from "../../../@types/user.type";

export const usersRouter = express.Router();

usersRouter.route('/')
  .get(Controllers.getUsers)
  .post(Controllers.createUser)
  .all((req, res, next) => {
    res.status(405).json({ message: 'Method not allowed' });
  });

usersRouter.route('/:id')
  .get<{ id: IUser['id'] }>(Controllers.getUser)
  .put<{ id: IUser['id'] }>(Controllers.updateUser)
  .delete<{ id: IUser['id'] }>(Controllers.deleteUser);