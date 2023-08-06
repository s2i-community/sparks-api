import express from "express";
import { UserController } from "../../../controllers";
import { IUser } from "../../../@types/user";
import { authGuard } from "../../../middlewares";

export const usersRouter = express.Router();

usersRouter.route('/')
  .get(authGuard, UserController.getUsers)
  .post(UserController.createUser)
  .all((req, res, next) => {
    res.status(405).json({ message: 'Method not allowed' });
  });

usersRouter.route('/:id')
  .get<{ id: IUser['_id'] }>(authGuard, UserController.getUser)
  .put<{ id: IUser['_id'] }>(authGuard, UserController.updateUser)
  .delete<{ id: IUser['_id'] }>(authGuard, UserController.deleteUser);