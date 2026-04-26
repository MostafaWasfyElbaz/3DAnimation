# 3DAnimation Backend

Node.js + Express + TypeScript backend for authenticated user/project management and 3D model workflows.

It supports:

- Auth and account flows (signup, login, email confirmation, password reset, profile)
- Project CRUD
- 3D model creation from exactly 5 images
- 3D model creation from text prompt
- Direct GLB upload to a project
- AWS S3 storage + pre-signed model URLs

## Tech Stack

- Runtime: Node.js (CommonJS)
- API: Express 5
- Language: TypeScript
- DB: MongoDB (Mongoose)
- Validation: Zod
- Auth: JWT
- Storage: AWS S3 (AWS SDK v3)
- Mail: Gmail API via `googleapis`
- AI integration:
  - Node backend currently calls hosted endpoints on Hugging Face Space:
    - `POST https://mostafa-wasfy-elbaz-3danimationai.hf.space/predict-img`
    - `POST https://mostafa-wasfy-elbaz-3danimationai.hf.space/predict-text`
  - Local FastAPI code exists in `AI-Model/` (images -> GLB endpoint at `/predict`)

## Project Layout

```text
src/
  app.controller.ts        # app bootstrap + middleware + error handling
  routes.ts                # mounts /auth and /project
  modules/
    authModule/
      auth.controller.ts
      auth.service.ts
      auth.validation.ts
    projectModule/
      project.controller.ts
      project.service.ts
      project.validation.ts
  DB/
    DBConnection.ts
    Repository/
    models/
  middleware/
    auth.middleware.ts
    validation.middleware.ts
  utils/
    jwt.ts
    hash.ts
    generateModel.ts
    success.handler.ts
    AWS S3/
      s3.services.ts
      s3Config.ts
    Emails/
      send.email.ts
      generate.otp.ts
      generate.html.ts
AI-Model/
  main.py
  inference.py
  model_architecture.py
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance
- AWS S3 bucket + credentials
- Gmail OAuth credentials (for email flows)

## Install

```bash
npm install
```

## Environment Configuration

The app loads env vars from:

- `src/config/.env`

Create/update that file with values for the keys used by the codebase:

```env
PORT=3000

# App / auth
APP_NAME=...
BEARER_KEY=Bearer
ACCESS_SIGNITURE=...
REFRESH_SIGNITURE=...
TEMP_SIGNITURE=...
SALT_ROUNDS=...

# Database
MONGO_URL=...
# or URI=...

# OTP / limits
OTP_EXPIRATION=...
OTP_ALPAHBET=...
OTP_SIZE=...
ATTEMPTS_EXP=...

# AWS S3
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...

# Gmail OAuth
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OAUTH_REFRESH_TOKEN=...
EMAIL_USER=...
```

Notes:

- `MONGO_URL` is preferred; `URI` is used as fallback.

## Build and Run

Build once:

```bash
npm run build
```

Run production build:

```bash
npm start
```

Development workflow (two terminals):

```bash
npm run build:dev
```

```bash
npm run start:dev
```

Default server URL:

- `http://localhost:3000`

Base API prefix:

- `/api/v1`

## Global Middleware / Behavior

- `helmet()` enabled
- Global rate limit: 100 requests / 15 minutes / IP
- `cors()` enabled
- JSON body parser enabled
- Error response shape (from global error handler):

```json
{
  "message": "...",
  "status": 400,
  "stack": "..."
}
```

## Success Response Shape

Most successful endpoints return:

```json
{
  "status": 200,
  "message": "...",
  "data": {}
}
```

(Produced by `src/utils/success.handler.ts`.)

## Authentication

For protected routes send:

```http
Authorization: <BEARER_KEY> <token>
```

Usually this is:

```http
Authorization: Bearer <token>
```

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Path                       | Auth                        | Body                                                      |
| ------ | -------------------------- | --------------------------- | --------------------------------------------------------- |
| POST   | `/signup`                  | No                          | `firstName`, `lastName`, `email`, `password`, `approved?` |
| PATCH  | `/confirm-email`           | No                          | `email`, `otp`                                            |
| PATCH  | `/resend-email-otp`        | No                          | `email`                                                   |
| POST   | `/login`                   | No                          | `email`, `password`                                       |
| POST   | `/refresh-token`           | Header with refresh token   | none                                                      |
| PATCH  | `/forgot-password`         | No                          | `email`                                                   |
| PATCH  | `/reset-password`          | No                          | `email`, `otp`, `password`                                |
| PATCH  | `/update-email`            | Access token                | `email`                                                   |
| PATCH  | `/confirm-email-change`    | Access token                | `oldOtp`, `newOtp`                                        |
| PATCH  | `/resend-update-email-otp` | No validation body required | `{}`                                                      |
| GET    | `/me`                      | Access token                | none                                                      |
| POST   | `/logout`                  | Access token                | none                                                      |

Validation highlights:

- name length: 3..15
- password min length: 8
- otp min length: 6

### Project (`/api/v1/project`)

| Method | Path                      | Auth         | Request                                        |
| ------ | ------------------------- | ------------ | ---------------------------------------------- |
| POST   | `/`                       | Access token | JSON: `name`                                   |
| GET    | `/`                       | Access token | none                                           |
| GET    | `/:projectId`             | Access token | path param `projectId`                         |
| PATCH  | `/:projectId`             | Access token | JSON: `projectName?`, `geometries?`, `models?` |
| DELETE | `/:projectId`             | Access token | path param `projectId`                         |
| POST   | `/image2model/:projectId` | Access token | multipart form-data `images` (exactly 5 files) |
| POST   | `/text2model/:projectId`  | Access token | JSON: `prompt` (1..500 chars)                  |
| POST   | `/upload-glb/:projectId`  | Access token | multipart form-data `model` (exactly 1 file)   |

Model/file validation details:

- Image accepted mime types: `image/png`, `image/jpg`, `image/jpeg`
- GLB accepted mime types by schema: `model/gltf-binary`, `model/gltf+json`
- Multer hard limit in code: max 50MB per file, max 5 files (`src/utils/AWS S3/multer.ts`)
- Additional Zod file size rule exists (50MB), but multer 50MB limit is enforced first

## 3D Generation Flow

### Image to Model

1. Client uploads exactly 5 images to `/api/v1/project/image2model/:projectId`
2. Backend sends images to hosted AI endpoint `/predict-img`
3. AI returns GLB bytes
4. Backend uploads model + source images to S3
5. Backend stores model reference in MongoDB
6. Response includes model id and a pre-signed model URL

### Text to Model

1. Client sends prompt to `/api/v1/project/text2model/:projectId`
2. Backend sends prompt to hosted AI endpoint `/predict-text`
3. AI returns GLB bytes
4. Backend uploads model to S3
5. Backend stores model reference in MongoDB
6. Response includes model id and a pre-signed model URL

### Upload GLB

1. Client uploads one model file to `/api/v1/project/upload-glb/:projectId`
2. Backend uploads to S3
3. Backend stores model reference in MongoDB
4. Response: success message (`Model uploaded successfully`)

## Important Runtime Notes

- `image2model` currently requires exactly 5 images in both validation and service logic.
- `upload-glb` controller passes `mimeType` to upload middleware, but current middleware implementation does not filter by that argument; validation catches mime type.
- For not-approved users, some project delete/update flows attempt to delete S3 assets.
- `getProjectById` replaces stored model keys with pre-signed URLs in response.

## Local AI Service (Optional)

The `AI-Model/` folder contains a FastAPI app that serves:

- `POST /predict` with exactly 5 images -> returns `model/gltf-binary`

Run example:

```bash
cd AI-Model
python main.py
```

Current Node backend is configured to call hosted Hugging Face endpoints in `src/utils/generateModel.ts`.
To use local AI instead, update that file accordingly.

## Scripts

From `package.json`:

- `npm run build` -> `tsc`
- `npm run start` -> `node ./dist/index.js`
- `npm run build:dev` -> `tsc --watch`
- `npm run start:dev` -> `node --watch ./dist/index.js`

## License

ISC
