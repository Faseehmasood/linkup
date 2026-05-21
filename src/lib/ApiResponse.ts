class ApiResponse {
  statusCode: number;
  message: string;
  data: unknown;
  success: boolean;

  constructor(
    statusCode: number,
    message: string = "Success",
    data: unknown = null
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;