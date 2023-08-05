import { IUserDocument, UserModel } from '../database/models/user.model';
import { IUser, IUserInputDTO, IUserQueryOptions, IUserUpdateDTO } from '../@types/user.type';


/**
 * Creates a new user.
 * @param userInput - The user input data.
 * @returns The created user.
 * @async
 * @example
 * const user = await User.create({ ... });
 * user.save();
 * @example
 * const user = await User.create({ ... });
 * user.save();
 * @example
 * const user = await User.create({ ... });
 * user.save();
 */
export async function createUser(userInput: IUserInputDTO): Promise<IUserDocument> {
  const user = new UserModel(userInput);
  return await user.save({ validateBeforeSave: true });
}


/**
   * Retrieves all users from the database.
   * @param options - The query options.
   * @returns The query result.
   * @async
   * @example
   * const users = await User.findUsers();
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0 });
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0, sort: 'createdAt' });
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0, sort: 'createdAt', select: 'username' });
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0, sort: 'createdAt', select: 'username', populate: 'posts' });
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0, sort: 'createdAt', select: 'username', populate: { path: 'posts', select: 'title' } });
   * @example
   * const users = await User.findUsers({ limit: 10, skip: 0, sort: 'createdAt', select: 'username', populate: [{ path: 'posts', select: 'title' }, { path: 'comments', select: 'content' }] });
  */
export async function findUsers(options?: IUserQueryOptions): Promise<IUserDocument[]> {
  const query = UserModel.find({
    deletedAt: null,
  });

  if (options) {
    if (options.limit) {
      query.limit(options.limit);
    }
    if (options.skip) {
      query.skip(options.skip);
    }
    if (options.sort) {
      query.sort(options.sort);
    }
    if (options.select) {
      query.select(options.select);
    }
    if (options.populate) {
      query.populate(options.populate);
    }
  }

  return await query.exec();
}


/**
 * Retrieves a user from the database.
 * @param userId - The user id.
 * @param options - The query options.
 * @returns The query result.
 * @async
 * @example
 * const user = await User.findUser(1);
 * @example
 * const user = await User.findUser(1, { select: 'username' });
 * @example
 * const user = await User.findUser(1, { populate: { path: 'posts', select: 'title' } });
 * @example
 * const user = await User.findUser(1, { populate: [{ path: 'posts', select: 'title' }, { path: 'comments', select: 'content' }] });
 */
export async function findUser(userId: IUser['id'], options?: IUserQueryOptions): Promise<IUserDocument | null> {
  const query = UserModel.findOne({ _id: userId, deletedAt: null });

  if (options) {
    if (options.select) {
      query.select(options.select);
    }
    if (options.populate) {
      query.populate(options.populate);
    }
  }

  return await query.exec();
}


/**
 * Updates a user in the database.
 * @param userId - The user id.
 * @param userInput - The user input data.
 * @returns The updated user.
 * @async
 * @example
 * const user = await User.updateUser(1, { ... });
 * user.save();
 * @example
 * const user = await User.updateUser(1, { ... }, { select: 'username' });
 * user.save();
 * @example
 * const user = await User.updateUser(1, { ... }, { populate: { path: 'posts', select: 'title' } });
 * user.save();
 * @example
 * const user = await User.updateUser(1, { ... }, { populate: [{ path: 'posts', select: 'title' }, { path: 'comments', select: 'content' }] });
 * user.save();
 */
export async function updateUser(userId: IUser['id'], userInput: IUserUpdateDTO, options?: IUserQueryOptions): Promise<IUserDocument | null> {
  const query = UserModel.findByIdAndUpdate(userId, userInput, { new: true });

  if (options) {
    if (options.select) {
      query.select(options.select);
    }
    if (options.populate) {
      query.populate(options.populate);
    }
  }

  return await query.exec();
}


/**
 * Deletes a user from the database.
 * @param userId - The user id.
 * @returns The deleted user.
 * @async
 * @example
 * const user = await User.deleteUser(1);
 * user.save();
 * @example
 * const user = await User.deleteUser(1, { select: 'username' });
 * user.save();
 */
export async function deleteUser(userId: IUser['id'], options?: IUserQueryOptions): Promise<IUserDocument | null> {
  const query = UserModel.findByIdAndUpdate(userId, { deletedAt: new Date() }, { new: true });

  if (options) {
    if (options.select) {
      query.select(options.select);
    }
  }

  return await query.exec();
}