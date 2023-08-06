import { RequestHandler } from "express";
import { AuthService, UserService } from "../services";
import { IUser, IUserInputDTO, IUserQueryOptions, IUserUpdateDTO } from "../@types/user";
import { IUserDocument } from "../database/models";
import { IDefaultResponseBody } from "../@types/utils";


/**
 * Retrieves all users from the database.
 * @param req - The request object.
 * @param res - The response object.
 */
export const getUsers: RequestHandler<{}, IUserDocument[] | IDefaultResponseBody, {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
  try {
    const { query: options } = req;
    const users = await UserService.findUsers(options);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};


/**
 * Retrieves a user from the database.
 * @param req - The request object.
 * @param res - The response object.
 */
export const getUser: RequestHandler<{ id: IUser['_id'] }, IUserDocument | IDefaultResponseBody | null, {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
  try {
    const { id: userId } = req.params;
    const { query: options } = req;
    const user = await UserService.findUser(userId, options);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};


/**
 * Creates a new user.
 * @param req - The request object.
 * @param res - The response object.
 */
export const createUser: RequestHandler<{}, IDefaultResponseBody, IUserInputDTO> = async (req, res, next): Promise<void> => {
  try {
    const { body: userInputDTO } = req;
    const user = await UserService.createUser(userInputDTO);
    const jwt = await AuthService.generateJWT(user);

    res.status(200);
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    res.json({ message: 'Successfully created user' });
  } catch (err: any) {
    next(err);
  }
};


/**
 * Updates a user's information.
 * @param req - The request object.
 * @param res - The response object.
 */
export const updateUser: RequestHandler<{ id: IUser['_id'] }, IUserDocument | IDefaultResponseBody | null, IUserUpdateDTO> = async (req, res, next): Promise<void> => {
  try {
    const { id: userId } = req.params;
    const { body: userUpdateDTO } = req;
    const user = await UserService.updateUser(userId, userUpdateDTO);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}


/**
 * Deletes a user.
 * @param req - The request object.
 * @param res - The response object.
 */
export const deleteUser: RequestHandler<{ id: IUser['_id'] }, IDefaultResponseBody> = async (req, res, next): Promise<void> => {
  try {
    const { id: userId } = req.params;
    await UserService.deleteUser(userId);
    res.sendStatus(200).json({ message: 'Successfully deleted user' });
  } catch (err) {
    next(err);
  }
}