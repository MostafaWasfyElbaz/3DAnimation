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

export class userExistError extends ApplicationException {
  constructor(msg:string = "User already exists", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class failedToCreateUser extends ApplicationException {
  constructor(msg:string = "Failed to create user", statusCode: number = 500) {
    super(msg, statusCode);
  }
}

export class notFoundError extends ApplicationException {
  constructor(msg:string = "Not Found", statusCode: number = 404) {
    super(msg, statusCode);
  }
}

export class failedToGenerateLink extends ApplicationException {
    constructor(msg:string = "Failed to generate link", statusCode: number = 500) {
        super(msg, statusCode);
    }
}

export class userAlreadyConfirmedError extends ApplicationException {
  constructor(msg:string = "User Already Confirmed", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class otpExpiredError extends ApplicationException {
  constructor(msg:string = "OTP Expired", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class invalidCredentialsError extends ApplicationException {
  constructor(msg:string = "Invalid Credentials", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class otpNotExpiredError extends ApplicationException {
  constructor(msg:string = "OTP Not Expired yet", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class userNotConfirmedError extends ApplicationException {
  constructor(msg:string = "User Not Confirmed", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class invalidFileTypeError extends ApplicationException {
  constructor(msg:string = "Invalid File Type", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class fileSizeError extends ApplicationException {
  constructor(msg:string = "File Size Exceeded", statusCode: number = 400) {
    super(msg, statusCode);
  }
}

export class failedToUpload extends ApplicationException {
    constructor(msg:string = "Upload Failed", statusCode: number = 500) {
        super(msg, statusCode);
    }
}

export class unauthorizedError extends ApplicationException {
    constructor(msg:string = "Unauthorized", statusCode: number = 401) {
        super(msg, statusCode);
    }
}

export class invalidTagsError extends ApplicationException {
    constructor(invalidTags: string[] ,msg:string = `Invalid Tags [${invalidTags}]`,statusCode: number = 400) {
        super(msg, statusCode);
    }
}

export class faildToCreatePost extends ApplicationException {
    constructor(msg:string = "Failed to create post", statusCode: number = 500) {
        super(msg, statusCode);
    }
}

export class tryResendOtp extends ApplicationException {
    constructor(msg:string = "Please try to resend otp", statusCode: number = 400) {
        super(msg, statusCode);
    }
}

export class tooManyRequestsError extends ApplicationException {
    constructor(msg:string = "Too many requests", statusCode: number = 429) {
        super(msg, statusCode);
    }
}

export class failedToCreateComment extends ApplicationException {
    constructor(msg:string = "Failed to create comment", statusCode: number = 500) {
        super(msg, statusCode);
    }
}

export class unableToSetFriendRequest extends ApplicationException {
    constructor(msg:string = "Unable to set friend request", statusCode: number = 400) {
        super(msg, statusCode);
    }
}
