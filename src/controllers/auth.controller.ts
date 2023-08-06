import { RequestHandler } from "express";
import { IAuthInputDTO, IAuthResetPasswordInputDTO } from "../@types/auth";
import { AuthService } from "../services";
import { AuthenticationError } from "../utils/errors";
import { IUserInputDTO } from "../@types/user";
import { IUserDocument } from "../database/models";

/**
 * Signs in a user with the provided authentication input data and generates a JWT token for them.
 * @function
 * @async
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next function.
 * @throws {AuthenticationError} If the provided authentication input data is invalid.
 * @throws {Error} If an error occurs while signing in the user or generating the JWT token.
 * @returns A Promise that resolves when the user is signed in and the JWT token is generated.
 */
export const signIn: RequestHandler<{}, {}, IAuthInputDTO> = async function (req, res, next) {
  try {
    const { body: authInputDTO } = req;
    const user = await AuthService.signIn(authInputDTO);
    const jwtToken = await AuthService.generateJwtToken(user);

    res.status(200);
    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    res.json({ message: 'Successfully signed in' });
  } catch (err: any) {
    if (err instanceof AuthenticationError) {
      res.status(401).end();
    } else {
      next(err);
    }
  }
}


/**
 * Logs out the currently authenticated user.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves with the user document.
 */
export const signOut: RequestHandler = async function (req, res, next) {
  try {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Successfully logged out' });
  } catch (err) {
    next(err);
  }
}


/**
 * Handles the user sign up request.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The newly created user object and a JWT token in a cookie.
 * @throws {AuthenticationError} If the user authentication fails.
 */
export const signUp: RequestHandler<{}, {}, IUserInputDTO> = async function (req, res, next) {
  try {
    const { body: userInputDTO } = req;
    const user = await AuthService.signUp(userInputDTO);
    const jwtToken = await AuthService.generateJwtToken(user);

    res.status(200);
    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    res.json({ message: 'Successfully signed up' });
  } catch (err: any) {
    if (err instanceof AuthenticationError) {
      res.status(401).end();
    } else {
      next(err);
    }
  }
}


/**
 * Refreshes the JWT token for the authenticated user.
 * @function
 * @async
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<void>} - A Promise that resolves when the JWT token has been refreshed.
 */
export const refreshJwtToken: RequestHandler<{}, {}, {}, {}, { user: IUserDocument }> = async function (req, res, next) {
  try {
    const { user } = res.locals;
    const jwtToken = await AuthService.refreshJwtToken(user);

    res.status(200);
    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    res.json({ message: 'Successfully refreshed JWT token' });
  } catch (err) {
    next(err);
  }
}



/**
 * Reset the password of the authenticated user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the password was successfully reset.
 */
export const resetPassword: RequestHandler<{}, {}, IAuthResetPasswordInputDTO, {}, {user: IUserDocument}> = async function (req, res, next) {
  try {
    const { currentPassword, newPassword, passwordResetToken } = req.body;
    await AuthService.resetPassword(currentPassword, newPassword, passwordResetToken);

    res.status(200).json({ message: 'Successfully reset password' });
  } catch (err) {
    next(err);
  }
}