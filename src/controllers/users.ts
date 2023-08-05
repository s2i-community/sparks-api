import { RequestHandler } from "express";
import { UserService } from "../services";
import { IUser, IUserInputDTO, IUserQueryOptions, IUserUpdateDTO } from "../@types/user.type";
import { IUserDocument } from "../database/models";


/**
 * Retrieves all users from the database.
 * @param req - The request object.
 * @param res - The response object.
 */
export const getUsers: RequestHandler<{}, IUserDocument[], {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
  try {
    const users = await UserService.findUsers(req.query);
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
export const getUser: RequestHandler<{ id: IUser['id'] }, IUserDocument | null, {}, IUserQueryOptions> = async (req, res, next): Promise<void> => {
  try {
    const user = await UserService.findUser(req.params?.id, req.query);
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
    console.log('createUser', 'req.body', req.body);
    const user = await UserService.createUser(req.body);
    console.log('createUser', 'user', user);
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
export const updateUser: RequestHandler<{ id: IUser['id'] }, IUserDocument | null, IUserUpdateDTO> = async (req, res, next): Promise<void> => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
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
export const deleteUser: RequestHandler<{ id: IUser['id'] }> = async (req, res, next): Promise<void> => {
  try {
    await UserService.deleteUser(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}