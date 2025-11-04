"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unableToSetFriendRequest = exports.failedToCreateComment = exports.tooManyRequestsError = exports.tryResendOtp = exports.faildToCreatePost = exports.invalidTagsError = exports.unauthorizedError = exports.failedToUpload = exports.fileSizeError = exports.invalidFileTypeError = exports.userNotConfirmedError = exports.otpNotExpiredError = exports.invalidCredentialsError = exports.otpExpiredError = exports.userAlreadyConfirmedError = exports.failedToGenerateLink = exports.notFoundError = exports.failedToCreateUser = exports.userExistError = exports.validationError = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(msg, statusCode, options) {
        super(msg, options);
        this.statusCode = statusCode;
    }
}
exports.ApplicationException = ApplicationException;
class validationError extends ApplicationException {
    constructor(msg, statusCode, options) {
        super(msg.join("\n"), statusCode, options);
    }
}
exports.validationError = validationError;
class userExistError extends ApplicationException {
    constructor(msg = "User already exists", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.userExistError = userExistError;
class failedToCreateUser extends ApplicationException {
    constructor(msg = "Failed to create user", statusCode = 500) {
        super(msg, statusCode);
    }
}
exports.failedToCreateUser = failedToCreateUser;
class notFoundError extends ApplicationException {
    constructor(msg = "Not Found", statusCode = 404) {
        super(msg, statusCode);
    }
}
exports.notFoundError = notFoundError;
class failedToGenerateLink extends ApplicationException {
    constructor(msg = "Failed to generate link", statusCode = 500) {
        super(msg, statusCode);
    }
}
exports.failedToGenerateLink = failedToGenerateLink;
class userAlreadyConfirmedError extends ApplicationException {
    constructor(msg = "User Already Confirmed", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.userAlreadyConfirmedError = userAlreadyConfirmedError;
class otpExpiredError extends ApplicationException {
    constructor(msg = "OTP Expired", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.otpExpiredError = otpExpiredError;
class invalidCredentialsError extends ApplicationException {
    constructor(msg = "Invalid Credentials", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.invalidCredentialsError = invalidCredentialsError;
class otpNotExpiredError extends ApplicationException {
    constructor(msg = "OTP Not Expired yet", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.otpNotExpiredError = otpNotExpiredError;
class userNotConfirmedError extends ApplicationException {
    constructor(msg = "User Not Confirmed", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.userNotConfirmedError = userNotConfirmedError;
class invalidFileTypeError extends ApplicationException {
    constructor(msg = "Invalid File Type", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.invalidFileTypeError = invalidFileTypeError;
class fileSizeError extends ApplicationException {
    constructor(msg = "File Size Exceeded", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.fileSizeError = fileSizeError;
class failedToUpload extends ApplicationException {
    constructor(msg = "Upload Failed", statusCode = 500) {
        super(msg, statusCode);
    }
}
exports.failedToUpload = failedToUpload;
class unauthorizedError extends ApplicationException {
    constructor(msg = "Unauthorized", statusCode = 401) {
        super(msg, statusCode);
    }
}
exports.unauthorizedError = unauthorizedError;
class invalidTagsError extends ApplicationException {
    constructor(invalidTags, msg = `Invalid Tags [${invalidTags}]`, statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.invalidTagsError = invalidTagsError;
class faildToCreatePost extends ApplicationException {
    constructor(msg = "Failed to create post", statusCode = 500) {
        super(msg, statusCode);
    }
}
exports.faildToCreatePost = faildToCreatePost;
class tryResendOtp extends ApplicationException {
    constructor(msg = "Please try to resend otp", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.tryResendOtp = tryResendOtp;
class tooManyRequestsError extends ApplicationException {
    constructor(msg = "Too many requests", statusCode = 429) {
        super(msg, statusCode);
    }
}
exports.tooManyRequestsError = tooManyRequestsError;
class failedToCreateComment extends ApplicationException {
    constructor(msg = "Failed to create comment", statusCode = 500) {
        super(msg, statusCode);
    }
}
exports.failedToCreateComment = failedToCreateComment;
class unableToSetFriendRequest extends ApplicationException {
    constructor(msg = "Unable to set friend request", statusCode = 400) {
        super(msg, statusCode);
    }
}
exports.unableToSetFriendRequest = unableToSetFriendRequest;
