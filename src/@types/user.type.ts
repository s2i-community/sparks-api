import { IUserDocument } from "../database/models";


/**
 * Represents a user in the system.
 */
export interface IUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  emailVerificationToken?: string;
  emailVerified?: boolean;
  emailVerificationTokenExpiresAt?: Date;
  deletedAt?: string;
}


/**
 * Represents the shape of user input data.
 */
export interface IUserInputDTO {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


/**
 * Represents the data transfer object for updating a user.
 */
export interface IUserUpdateDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}


/**
 * Query options for finding users.
 */
export interface IUserQueryOptions {
  limit?: number;
  skip?: number;
  sort?: string;
  select?: string;
  populate?: string;
}


/**
 * Represents the result of a query for user documents.
 */
export interface IUserQueryResult {
  docs: IUserDocument[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  meta?: any;
}