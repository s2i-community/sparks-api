import { IAuthInputDTO } from "../@types/auth";
import { IUserInputDTO } from "../@types/user";
import { IUserDocument, UserModel } from "../database/models";
import { AuthenticationError, SemanticError } from "../utils/errors";

/**
 * Authenticates a user with the provided email and password.
 * @param authData - The email and password of the user to authenticate.
 * @returns The authenticated user document.
 * @throws An error if the user is not found or the password is invalid.
 */
export const signIn = async ({ email, password }: IAuthInputDTO): Promise<IUserDocument> => {
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) throw new AuthenticationError('User not found');
  const passwordMatched = await user.comparePassword(password);
  if (!passwordMatched) throw new AuthenticationError('Invalid password');
  delete user.password;
  return user;
}


/**
 * Logs out the currently authenticated user.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves with the user document.
 */
export const signOut = async (user: IUserDocument) => {
  return;
}


/**
 * Creates a new user in the database with the provided user input data.
 * @param userInputDTO The user input data to create the new user with.
 * @returns A Promise that resolves with the newly created user document.
 */
export const signUp = async (userInputDTO: IUserInputDTO): Promise<IUserDocument> => {
  try {
    const user = await UserModel.create(userInputDTO);
    return user;
  } catch (err: any) {
    // TODO: Return a more specific error type and message.
    throw new SemanticError(err.message);
  }
}


/**
 * Generates a JWT token for the given user.
 * @param user - The user document for which to generate the token.
 * @returns A Promise that resolves with the generated JWT token.
 * @throws If there was an error generating the token.
 */
export const generateJwtToken = async (user: IUserDocument): Promise<string> => {
  const token = await user.generateJWT();
  return token;
}


/**
 * Generates a new JWT token for the given user by refreshing their existing token.
 * @param user - The user document for which to generate a new JWT token.
 * @returns A Promise that resolves to the new JWT token.
 */
export const refreshJwtToken = async (user: IUserDocument): Promise<string> => {
  const token = await user.refreshJWT();
  return token;
}


export const validateJwtToken = async (token: string): Promise<IUserDocument> => {
  const user = await UserModel.verifyJWT(token);
  return user;
}


/**
 * Resets the password for a user with the given password reset token.
 * @param currentPassword The user's current password.
 * @param newPassword The new password to set.
 * @param passwordResetToken The password reset token associated with the user.
 * @throws {AuthenticationError} If the password reset token is invalid or the current password is incorrect.
 */
export const resetPassword = async (currentPassword: string, newPassword: string, passwordResetToken: string): Promise<void> => {
  const user = await UserModel.findOne({ passwordResetToken });
  if (!user) throw new AuthenticationError('Invalid password reset token');
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) throw new AuthenticationError('Invalid password');
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  return;
}