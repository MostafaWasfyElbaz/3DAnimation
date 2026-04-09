export class ApplicationException extends Error {
  statusCode: number;
  constructor(msg: string, statusCode: number, options?: ErrorOptions) {
    super(msg, options);
    this.statusCode = statusCode;
  }
}

export class validationError extends ApplicationException {
  constructor(msg: string[], statusCode: number, options?: ErrorOptions) {
    super(msg.join("\n"), statusCode, options);
  }
}

export class internalServerError extends ApplicationException {
  constructor(msg: string = "Internal Server Error", statusCode: number = 500) {
    super(msg, statusCode);
  }
}

export class userExistError extends ApplicationException {
  constructor(msg: string = "User already exists", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class failedToCreateUser extends ApplicationException {
  constructor(msg: string = "Failed to create user", statusCode: number = 500) {
    super(msg, statusCode);
  }
}

export class failedToCreateProject extends ApplicationException {
  constructor(
    msg: string = "Failed to create project",
    statusCode: number = 500,
  ) {
    super(msg, statusCode);
  }
}

export class pageNotFoundError extends ApplicationException {
  constructor(msg: string = "Page Not Found", statusCode: number = 404) {
    super(msg, statusCode);
  }
}

export class notFoundError extends ApplicationException {
  constructor(msg: string = "Not Found", statusCode: number = 404) {
    super(msg, statusCode);
  }
}

export class userNotFound extends ApplicationException {
  constructor(msg: string = "User Not Found", statusCode: number = 404) {
    super(msg, statusCode);
  }
}

export class projectNotFound extends ApplicationException {
  constructor(msg: string = "Project Not Found", statusCode: number = 404) {
    super(msg, statusCode);
  }
}

export class projectCreationFailed extends ApplicationException {
  constructor(
    msg: string = "Failed to create project",
    statusCode: number = 500,
  ) {
    super(msg, statusCode);
  }
}

export class modelCreationFailed extends ApplicationException {
  constructor(
    msg: string = "Failed to create model",
    statusCode: number = 500,
  ) {
    super(msg, statusCode);
  }
}



export class failedToGenerateLink extends ApplicationException {
  constructor(
    msg: string = "Failed to generate link",
    statusCode: number = 500,
  ) {
    super(msg, statusCode);
  }
}

export class userAlreadyConfirmedError extends ApplicationException {
  constructor(
    msg: string = "User Already Confirmed",
    statusCode: number = 400,
  ) {
    super(msg, statusCode);
  }
}

export class otpExpiredError extends ApplicationException {
  constructor(msg: string = "OTP Expired", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class invalidCredentialsError extends ApplicationException {
  constructor(msg: string = "Invalid Credentials", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class otpNotExpiredError extends ApplicationException {
  constructor(msg: string = "OTP Not Expired yet", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class userNotConfirmedError extends ApplicationException {
  constructor(msg: string = "User Not Confirmed", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class invalidFileTypeError extends ApplicationException {
  constructor(msg: string = "Invalid File Type", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class fileSizeError extends ApplicationException {
  constructor(msg: string = "File Size Exceeded", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class failedToUpload extends ApplicationException {
  constructor(msg: string = "Upload Failed", statusCode: number = 500) {
    super(msg, statusCode);
  }
}

export class unauthorizedError extends ApplicationException {
  constructor(msg: string = "Unauthorized", statusCode: number = 401) {
    super(msg, statusCode);
  }
}

export class tryResendOtp extends ApplicationException {
  constructor(
    msg: string = "Please try to resend otp",
    statusCode: number = 400,
  ) {
    super(msg, statusCode);
  }
}

export class tooManyRequestsError extends ApplicationException {
  constructor(msg: string = "Too many requests", statusCode: number = 429) {
    super(msg, statusCode);
  }
}
