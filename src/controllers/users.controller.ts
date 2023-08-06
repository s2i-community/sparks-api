import { RequestHandler } from "express";
import { UserService } from "../services";
import { IUser, IUserInputDTO, IUserQueryOptions, IUserUpdateDTO } from "../@types/user";
import { IUserDocument } from "../database/models";


/**
 * Retrieves all users from the database.
 * @param req - The request object.
 * @param res - The response object.
 */
export const getUsers: RequestHandler<{}, IUserDocument[], {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
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
export const getUser: RequestHandler<{ id: IUser['_id'] }, IUserDocument | null, {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
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
export const createUser: RequestHandler<{}, IUserDocument, IUserInputDTO> = async (req, res, next): Promise<void> => {
  try {
    const { body: userInputDTO } = req;
    const user = await UserService.createUser(userInputDTO);
    res.status(200).json(user);
  } catch (err) {
    console.log('createUser', 'error', err);
    next(err);
  }
};


/**
 * Updates a user's information.
 * @param req - The request object.
 * @param res - The response object.
 */
export const updateUser: RequestHandler<{ id: IUser['_id'] }, IUserDocument | null, IUserUpdateDTO> = async (req, res, next): Promise<void> => {
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
export const deleteUser: RequestHandler<{ id: IUser['_id'] }> = async (req, res, next): Promise<void> => {
  try {
    const { id: userId } = req.params;
    await UserService.deleteUser(userId);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}


export const getMe: RequestHandler<{}, IUserDocument | null, {}, IUserQueryOptions, {user: IUserDocument}> = async (req, res, next): Promise<void> => {
  try {
    const { user } = res.locals;
    const { query: options } = req;
    const me = await UserService.findUser(user._id as string, options);
    res.status(200).json(me);
  } catch (err) {
    next(err);
  }
}