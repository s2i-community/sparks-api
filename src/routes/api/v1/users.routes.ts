import express from "express";
import { UserController } from "../../../controllers";
import { IUser } from "../../../@types/user";

export const usersRouter = express.Router();

usersRouter.route('/')
  .get(UserController.getUsers)
  .post(UserController.createUser)
  .all((req, res, next) => {
    res.status(405).json({ message: 'Method not allowed' });
  });

usersRouter.route('/:id')
  .get<{ id: IUser['_id'] }>(UserController.getUser)
  .put<{ id: IUser['_id'] }>(UserController.updateUser)
  .delete<{ id: IUser['_id'] }>(UserController.deleteUser);