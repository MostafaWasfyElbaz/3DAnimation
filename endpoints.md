# API Endpoints Documentation

## Authentication Endpoints (`/auth`)

### Registration & Login

#### `POST http://localhost:3000/auth/signup`

- **Purpose**: Register new user
- **Validation**: Yes (signupSchema)
- **Authentication**: Not required

#### `POST http://localhost:3000/auth/login`

- **Purpose**: User login
- **Validation**: Yes (loginSchema)
- **Authentication**: Not required

#### `POST http://localhost:3000/auth/2fa`

- **Purpose**: Two-factor authentication verification
- **Requires**: Temporary token
- **Headers**: `Authorization: Bearer <temp_token>`
- **Validation**: Yes (\_2FASchema)

### Token Management

#### `POST http://localhost:3000/auth/refresh-token`

- **Purpose**: Get new access token
- **Authentication**: Not required (uses refresh token in body)

### Email Verification

#### `PATCH http://localhost:3000/auth/confirm-email`

- **Purpose**: Confirm email address
- **Validation**: Yes (confirmEmailSchema)
- **Authentication**: Not required

#### `PATCH http://localhost:3000/auth/resend-email-otp`

- **Purpose**: Resend email verification OTP
- **Validation**: Yes (resendEmailOtpSchema)
- **Authentication**: Not required

### Email Management

#### `PATCH http://localhost:3000/auth/update-email`

- **Purpose**: Request email change
- **Requires**: Authentication
- **Headers**: `Authorization: Bearer <token>`
- **Validation**: Yes (updateEmailSchema)

#### `PATCH http://localhost:3000/auth/confirm-email-change`

- **Purpose**: Confirm email change
- **Requires**: Authentication
- **Headers**: `Authorization: Bearer <token>`
- **Validation**: Yes (confirmEmailChangeSchema)

#### `PATCH http://localhost:3000/auth/resend-update-email-otp`

- **Purpose**: Resend email change OTP
- **Validation**: Yes (resendUpdateEmailOtpSchema)
- **Authentication**: Not required

### Password Management

#### `PATCH http://localhost:3000/auth/forgot-password`

- **Purpose**: Initiate password reset
- **Validation**: Yes (forgotPasswordSchema)
- **Authentication**: Not required

#### `PATCH http://localhost:3000/auth/reset-password`

- **Purpose**: Reset password
- **Validation**: Yes (resetPasswordSchema)
- **Authentication**: Not required

#### `PATCH http://localhost:3000/auth/resend-password-otp`

- **Purpose**: Resend password reset OTP
- **Authentication**: Not required

```
