import mongoose, { Schema, CallbackWithoutResultAndOptionalError } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import passwordValidator from "password-validator";
import { IUser } from "../../@types/user.type";

const passwordSchema = new passwordValidator();
passwordSchema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().not().spaces();

/**
 * Represents a user document in the database.
 */
export interface IUserDocument extends IUser, Omit<Document, 'id'> {
  /**
   * Checks if the password is valid.
   * @param password - The password to check.
   * @returns A boolean indicating if the password is valid.
   * @async
   */
  isPasswordValid(password: string): Promise<boolean>;

  /**
   * Checks if a field has been modified.
   * @param field - The field to check.
   * @returns A boolean indicating if the field has been modified.
   * @async
   */
  isModified(field: string): boolean;

  /**
   * Hashes the password.
   * @param password - The password to hash.
   * @returns The hashed password.
   * @async
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Generates a JSON web token.
   * @returns The generated JSON web token.
   * @async
   * @example
   * const token = await user.generateJWT();
   */
  generateJWT(): Promise<string>;

  /**
   * Generates a password reset token.
   * @returns The generated password reset token.
   * @async
   * @example
   * const token = await user.generatePasswordResetToken();
   * user.passwordResetToken = token;
   * user.passwordResetExpires = Date.now() + 3600000;
   * user.save();
   */
  generatePasswordResetToken(): Promise<string>;

  /**
   * Generates an email verification token.
   * @returns The generated email verification token.
   * @async
   * @example
   * const token = await user.generateEmailVerificationToken();
   * user.emailVerificationToken = token;
   * user.save();
   */
  generateEmailVerificationToken(): Promise<string>;

  /**
   * Generates a password reset email.
   * @returns The generated password reset email.
   * @async
   * @example
   * const email = await user.generatePasswordResetEmail();
   * await sendEmail(email);
   */
  generatePasswordResetEmail(): Promise<string>;

  /**
   * Generates an email verification email.
   * @returns The generated email verification email.
   * @async
   * @example
   * const email = await user.generateEmailVerificationEmail();
   * await sendEmail(email);
   */
  generateEmailVerificationEmail(): Promise<string>;
}


const userSchema = new Schema<IUserDocument>({
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
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
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
      validator: (value: string) => {
        return passwordSchema.validate(value);
      },
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
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false,
  },
  passwordResetTokenExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
  deletedAt: {
    type: Date,
    default: null,
    select: false,
  },
});


userSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

userSchema.index({ email: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });

userSchema.index({ username: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });

userSchema.index({ emailVerificationToken: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });

userSchema.index({ passwordResetToken: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $type: "null" } } });

userSchema.index({ deletedAt: 1 });

userSchema.virtual("fullName").get(function (this: IUserDocument) {
  return `${this.firstName} ${this.lastName}`;
});


// Hash the password before saving the user.
userSchema.pre<IUserDocument>("save", hashPassword);
userSchema.pre<IUserDocument>("updateOne", hashPassword);

// Generate a password reset token.
userSchema.methods["generatePasswordResetToken"] = generatePasswordResetToken;

// Check if the password is valid.
userSchema.methods["isPasswordValid"] = isPasswordValid;

// Generate an email verification token.
userSchema.methods["generateEmailVerificationToken"] = generateEmailVerificationToken;

// Generate a JSON web token.
userSchema.methods["generateJWT"] = generateJWT;

// Generate a password reset email.
userSchema.methods["generatePasswordResetEmail"] = generatePasswordResetEmail;

// Generate an email verification email.
userSchema.methods["generateEmailVerificationEmail"] = generateEmailVerificationEmail;

export const UserModel = mongoose.model<IUserDocument>("user", userSchema);



/**
 * Hashes the user's password before saving it to the database.
 * @param next - The callback function to be called after the password is hashed.
 */
async function hashPassword(this: IUserDocument, next: CallbackWithoutResultAndOptionalError): Promise<void> {
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
function generatePasswordResetToken(this: IUserDocument): string {
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
function generateJWT(this: IUserDocument): string {
  const token = jwt.sign(
    { id: this.id },
    process.env['JWT_SECRET'] as string,
    { expiresIn: "1d" }
  );
  return token;
}


/**
 * Generates a random email verification token and sets it on the user document.
 * @returns The generated token.
 */
function generateEmailVerificationToken(this: IUserDocument): string {
  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = Date.now() + 3600000;
  this['emailVerificationToken'] = token;
  this['emailVerificationTokenExpiresAt'] = new Date(expiresAt);
  return token;
};


/**
 * Checks if a given password matches the user's password hash.
 * @param password - The password to check.
 * @returns A Promise that resolves to a boolean indicating whether the password is valid.
 */
function isPasswordValid(this: IUserDocument, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password as string);
}


/**
 * Generates an email containing a password reset link for the user.
 * @returns A Promise that resolves to a string representing the email.
 */
function generatePasswordResetEmail(this: IUserDocument): Promise<string> {
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
function generateEmailVerificationEmail(this: IUserDocument): Promise<string> {
  const token = this['generateEmailVerificationToken']();
  const email = `
    <h1>Verify your email address</h1>
    <p>Click the link below to verify your email address.</p>
    <a href="http://localhost:3000/verify-email/${token}">Verify Email</a>
  `;
  return Promise.resolve(email);
}