import { CallbackWithoutResultAndOptionalError, Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { SignOptions, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import passwordValidator from "password-validator";
import { IUserDocument, IUserModel } from "../user.model";
import { NotFoundError, ValidationError } from "../../../../utils/errors";
import { IAuthJWT } from "../../../../@types/auth";


/**
 * Hashes the user's password before saving it to the database.
 * @param next - The callback function to be called after the password is hashed.
 */
export async function hashPassword(this: IUserDocument, next: CallbackWithoutResultAndOptionalError): Promise<void> {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password = this.password as string;
    this['password'] = await bcrypt.hash(password, salt);
    return next();
  } catch (error: any) {
    return next(error);
  }
}

/**
 * Generates a password reset token for the user.
 * @returns The generated password reset token.
 */
export function generatePasswordResetToken(this: IUserDocument): string {
  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = Date.now() + 3600000;
  this['passwordResetToken'] = token;
  this['passwordResetTokenExpiresAt'] = new Date(expiresAt);
  return token;
}

/**
 * Generates a JSON web token for the user.
 * @returns The generated JSON web token.
 * @async
 */
export function generateJWT(this: IUserDocument, expiresIn: SignOptions['expiresIn'] = "1d"): string {
  const token = jwt.sign(
    { _id: this._id },
    process.env['JWT_SECRET'] as string,
    { expiresIn }
  );
  return token;
}


/**
 * Generates a new JSON Web Token (JWT) for the user with a 1 day expiration time.
 * @returns The newly generated JWT.
 */
export function refreshJWT(this: IUserDocument, expiresIn: SignOptions['expiresIn'] = "1d"): string {
  const token = jwt.sign(
    { _id: this._id },
    process.env['JWT_SECRET'] as string,
    { expiresIn }
  );
  return token;
}


/**
 * Verifies a JSON Web Token (JWT) and returns the decoded payload.
 * @param token - The JWT to verify.
 */
export async function verifyJWT(this: Model<IUserDocument, IUserModel>, token: string): Promise<IUserDocument> {
  try {
    const decoded: IAuthJWT = jwt.verify(token, process.env['JWT_SECRET'] as string) as unknown as IAuthJWT;
    console.log('decoded: ', decoded);
    const user = await this.findOne({ _id: decoded._id, deletedAt: { $type: "null" } });

    if (!user) { throw new NotFoundError("User not found!"); }

    return user;
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      throw new ValidationError("Token expired!");
    }
    if (err instanceof JsonWebTokenError) {
      throw new ValidationError("Invalid token!");
    }

    throw err;
  }
}


/**
 * Generates a random email verification token and sets it on the user document.
 * @returns The generated token.
 */
export function generateEmailVerificationToken(this: IUserDocument): string {
  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = Date.now() + 3600000;
  this['emailVerificationToken'] = token;
  this['emailVerificationTokenExpiresAt'] = new Date(expiresAt);
  return token;
};


/**
 * Checks if a given password is valid according to the password schema.
 * @param password - The password to validate.
 * @returns True if the password is valid, false otherwise.
 */
export function isPasswordValid(password: string): boolean {
  const passwordSchema = new passwordValidator();
  passwordSchema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().not().spaces();
  return passwordSchema.validate(password, { list: false }) as boolean;
}


/**
 * Generates an email containing a password reset link for the user.
 * @returns A Promise that resolves to a string representing the email.
 */
export function generatePasswordResetEmail(this: IUserDocument): Promise<string> {
  const token = this['generatePasswordResetToken']();
  const email = `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password.</p>
    <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
  `;
  return Promise.resolve(email);
}


/**
 * Generates an email verification email with a verification link for the user.
 * @returns A Promise that resolves to the email content as a string.
 */
export function generateEmailVerificationEmail(this: IUserDocument): Promise<string> {
  const token = this['generateEmailVerificationToken']();
  const email = `
    <h1>Verify your email address</h1>
    <p>Click the link below to verify your email address.</p>
    <a href="http://localhost:3000/verify-email/${token}">Verify Email</a>
  `;
  return Promise.resolve(email);
}


/**
 * Compares a given password with the user's hashed password.
 * @param password - The password to compare with the user's hashed password.
 * @returns A Promise that resolves to a boolean indicating whether the password matches the user's hashed password.
 */
export async function comparePassword(this: IUserDocument, password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password as string);
}