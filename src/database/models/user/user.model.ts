import mongoose, { Model, Schema, Document } from "mongoose";
import { IUser } from "../../../@types/user";
import { SignOptions } from "jsonwebtoken";
import {
  hashPassword,
  generatePasswordResetToken,
  generateJWT,
  refreshJWT,
  verifyJWT,
  isPasswordValid,
  comparePassword,
  generateEmailVerificationToken,
  generatePasswordResetEmail,
  generateEmailVerificationEmail
} from "./helpers";


/**
 * Represents a document interface for a user in the database.
 * @interface
 * @extends {Omit<IUser, "_id">}
 * @extends {Document<string, any, IUser>}
 */
export interface IUserDocument extends Omit<IUser, "_id">, Document<string, any, IUser> {
  /**
   * Compares the provided password with the hashed password.
   * @param {string} password - The password to compare.
   * @returns {Promise<boolean>} A boolean indicating if the provided password matches the hashed password.
   * @async
   */
  comparePassword(password: string): Promise<boolean>;

  /**
   * Checks if a field has been modified.
   * @param {string} field - The field to check.
   * @returns {boolean} A boolean indicating if the field has been modified.
   * @async
   */
  isModified(field: string): boolean;

  /**
   * Hashes the provided password.
   * @param {string} password - The password to hash.
   * @returns {Promise<string>} The hashed password.
   * @async
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Generates a JSON web token for the user.
   * @param {SignOptions['expiresIn']} expiresIn - The expiration time for the token.
   * @returns {Promise<string>} The generated JSON web token.
   * @async
   * @example
   * const token = await user.generateJWT();
   */
  generateJWT(expiresIn?: SignOptions['expiresIn']): Promise<string>;

  /**
   * Refreshes the JSON web token for the user.
   * @param {SignOptions['expiresIn']} expiresIn - The expiration time for the token.
   * @returns {Promise<string>} The refreshed JSON web token.
   * @async
   * @example
   * const token = await user.refreshJWT();
   */
  refreshJWT(expiresIn?: SignOptions['expiresIn']): Promise<string>;

  /**
   * Verifies the provided JSON web token for the user.
   * @param {string} token - The JSON web token to verify.
   * @returns {Promise<IUserDocument>} The verified user document.
   * @async
   */
  verifyJWT(token: string): Promise<IUserDocument>;

  /**
   * Generates a password reset token for the user.
   * @returns {Promise<string>} The generated password reset token.
   * @async
   * @example
   * const token = await user.generatePasswordResetToken();
   * user.passwordResetToken = token;
   * user.passwordResetExpires = Date.now() + 3600000;
   * user.save();
   */
  generatePasswordResetToken(): Promise<string>;

  /**
   * Generates an email verification token for the user.
   * @returns {Promise<string>} The generated email verification token.
   * @async
   * @example
   * const token = await user.generateEmailVerificationToken();
   * user.emailVerificationToken = token;
   * user.save();
   */
  generateEmailVerificationToken(): Promise<string>;

  /**
   * Generates a password reset email for the user.
   * @returns {Promise<string>} The generated password reset email.
   * @async
   * @example
   * const email = await user.generatePasswordResetEmail();
   * await sendEmail(email);
   */
  generatePasswordResetEmail(): Promise<string>;

  /**
   * Generates an email verification email for the user.
   * @returns {Promise<string>} The generated email verification email.
   * @async
   * @example
   * const email = await user.generateEmailVerificationEmail();
   * await sendEmail(email);
   */
  generateEmailVerificationEmail(): Promise<string>;
}


/**
 * Represents the User model interface.
 * Extends the Mongoose Model interface with the `verifyJWT` method.
 */
export interface IUserModel extends Model<IUserDocument> {
  /**
   * Verifies a JSON Web Token (JWT) and returns the corresponding user document.
   * @param token - The JWT to verify.
   * @returns A Promise that resolves with the corresponding user document if the JWT is valid, or rejects with an error if the JWT is invalid or expired.
   */
  verifyJWT(token: string): Promise<IUserDocument>;

  /**
   * Checks if the password is valid.
   * @param {string} password - The password to check.
   * @returns {Promise<boolean>} A boolean indicating if the password is valid.
   * @async
   */
  isPasswordValid(password: string): boolean;
}


const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    max: 50,
  },
  lastName: {
    type: String,
    required: true,
    max: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: Buffer,
    default: null,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
    select: false,
    validate: {
      validator: (value: string) => {
        // email regex
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);
      },
      message: (props: any) => `${props.value} is not a valid email address!`,
    }
  },
  password: {
    type: String,
    required: true,
    select: false,
    validate: {
      validator: isPasswordValid,
      message: () => `This password is not strong enough!`
    }
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    select: false,
  },
  emailVerificationTokenExpiresAt: {
    type: Date,
    default: null,
    select: false,
    required: false,
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false,
    required: false,
  },
  passwordResetTokenExpiresAt: {
    type: Date,
    default: null,
    select: false,
    required: false,
  },
  deletedAt: {
    type: Date,
    default: null,
    select: false,
  },
},
  {
    methods: {
      generatePasswordResetToken,
      generateEmailVerificationToken,
      generatePasswordResetEmail,
      generateEmailVerificationEmail,
      comparePassword,
      hashPassword,
      generateJWT,
      refreshJWT,
    },
    statics: {
      verifyJWT,
      isPasswordValid,
    },
    timestamps: true,
  });

// Virtuals
userSchema.set("toJSON", { transform: (doc: any, ret: any) => { delete ret.__v; }});

// Virtual for user's full name
userSchema.virtual("fullName").get(function (this: IUserDocument) { return `${this.firstName} ${this.lastName}`; });

// Indexes
userSchema.index({ email: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });
userSchema.index({ username: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });
userSchema.index({ emailVerificationToken: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });
userSchema.index({ passwordResetToken: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });
userSchema.index({ deletedAt: 1 });

// Hash the password before saving the user.
userSchema.pre<IUserDocument>("save", hashPassword);
userSchema.pre<IUserDocument>("updateOne", hashPassword);

export const UserModel = mongoose.model<IUserDocument, IUserModel>("user", userSchema);