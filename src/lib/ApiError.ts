class ApiError extends Error {
  statusCode: number;
  errors: string[];
  success: boolean;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

export default ApiError;
