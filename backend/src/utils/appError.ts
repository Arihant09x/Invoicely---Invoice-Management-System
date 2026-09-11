import { httpStatus } from "./httpStatus";

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = httpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
