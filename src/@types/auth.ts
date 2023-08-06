import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user";

/**
 * Represents the input data required for authenticating a user.
 */
export interface IAuthInputDTO extends Pick<IUser, "email"> {
  password: string;
}

/**
 * Represents the output data returned when authenticating a user.
 * Contains the user document.
 * @see IUser
 * @see IUserDocument
 */
export interface IAuthOutputDTO {
  user: IUser;
}

/**
 * Represents the JSON web token data.
 * @see https://tools.ietf.org/html/rfc7519
 */
export interface IAuthJWT extends JwtPayload {
  /**
   * The user's id
   */
  _id: string;
  /**
   * The timestamp when the token was issued.
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.6
   */
  iat: number;
  /**
   * The timestamp when the token expires.
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.4
   */
  exp: number;
}

/**
 * Represents the input data required to reset a user's password.
 */
export interface IAuthResetPasswordInputDTO {
  currentPassword: string;
  newPassword: string;
  passwordResetToken: string;
}