/**
 * Base class for operation errors.
 * This class should not be thrown directly.
 * Instead, throw one of the subclasses of this class.
 * @extends Error
 * @status 500
 * @see AuthenticationError
 * @see AuthorizationError
 * @see NotFoundError
 * @see ValidationError
 * @see ConflictError
 * @see InternalError
 * @see DatabaseError
 * @see SemanticError
 * @see HttpMethodNotAllowedError
 */
export class OperationError extends Error {
  /**
   * The name of the error.
   */
  override readonly name: string;
  /**
   * The error message associated with this error.
   */
  override readonly message: string;
  /**
   * The HTTP status code associated with this error.
   * Defaults to 500.
   */
  readonly httpStatus: number;

  /**
   * Creates a new instance of the OperationError class.
   * @param message The error message associated with this error.
   * @param httpStatus The HTTP status code associated with this error. Defaults to 500.
   */
  constructor(message: string = "Operation error", httpStatus = 500) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.httpStatus = httpStatus;
  }
}




/**
 * Represents an error that occurs when authentication fails.
 * This error should be thrown when a user is not authenticated.
 * This error should not be thrown when a user is authenticated but not authorized to perform an operation.
 * @extends OperationError
 * @status 401
 * @see AuthorizationError
 */
export class AuthenticationError extends OperationError {
  override readonly name: string;

  constructor(message: string = "Not authenticated") {
    super(message, 401);
    this.name = this.constructor.name;
  }
}




/**
 * Represents an error that occurs when a user is not authorized to perform an operation.
 * This error should be thrown when a user is authenticated but not authorized to perform an operation.
 * This error should not be thrown when a user is not authenticated.
 * @extends OperationError
 * @status 404
 * @see AuthenticationError
 */
export class AuthorizationError extends OperationError {
  override readonly name: string;

  constructor(message: string = "Not authorized") {
    super(message, 403);
    this.name = this.constructor.name;
  }
}




/**
 * Represents an error that occurs when there is a problem with the database.
 * This error should be thrown when a database operation fails.
 * This error should not be thrown when a database operation succeeds but the result is semantically incorrect.
 * @extends OperationError
 * @status 500
 * @see SemanticError
 */
export class DatabaseError extends OperationError {
  override name: string;

  constructor(message: string = "Database error") {
    super(message);
    this.name = this.constructor.name;
  }
}




/**
 * Represents an error that occurs when input validation fails.
 * This error should be thrown when input validation fails.
 * This error should not be thrown when input validation succeeds but the input is semantically incorrect.
 * @extends OperationError
 * @status 400
 * @see SemanticError
 */
export class ValidationError extends OperationError {
  override name: string;

  constructor(message: string = "Validation error") {
    super(message, 400);
    this.name = this.constructor.name;
  }
}




/**
 * Represents an error that occurs when a semantic rule is violated.
 * This error should be thrown when input validation succeeds but the input is semantically incorrect.
 * This error should not be thrown when input validation fails.
 * @extends OperationError
 * @status 400
 * @see ValidationError
 */
export class SemanticError extends OperationError {
  override name: string;

  constructor(message: string = "Semantic error") {
    super(message, 400);
    this.name = this.constructor.name;
  }
}




/**
 * Error thrown when a requested resource is not found.
 * This error should not be thrown when a requested resource is found but the user is not authorized to access it.
 * @extends OperationError
 * @status 404
 * @see AuthorizationError
 */
export class NotFoundError extends OperationError {
  override name: string;

  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = this.constructor.name;
  }
}




/**
 * Represents a conflict error that occurs when a request conflicts with the current state of the server.
 * This error should be thrown when a request conflicts with the current state of the server.
 * This error should not be thrown when a request conflicts with the current state of the database.
 * @extends OperationError
 * @status 409
 * @see DatabaseError
 */
export class ConflictError extends OperationError {
  override name: string;

  constructor(message: string = "Conflict error") {
    super(message, 409);
    this.name = this.constructor.name;
  }
}




/**
 * Represents an error that occurred during an operation due to an internal server error.
 * This error should be thrown when an internal server error occurs.
 * This error should not be thrown when a database operation fails.
 * @extends OperationError
 * @status 500
 * @see DatabaseError
 */
export class InternalError extends OperationError {
  override name: string;

  constructor(message: string = "Internal error") {
    super(message, 500);
    this.name = this.constructor.name;
  }
}



/**
 * Error thrown when an HTTP method is not allowed for a particular resource.
 * This error should be thrown when an HTTP method is not allowed for a particular resource.
 * This error should not be thrown when an HTTP method is not allowed for a particular user.
 * @extends OperationError
 * @status 405
 * @see AuthorizationError
 */
export class HttpMethodNotAllowedError extends OperationError {
  override name: string;

  constructor(message: string = "Method not allowed") {
    super(message, 405);
    this.name = this.constructor.name;
  }
}