"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const index_1 = require("../../utils/index");
const index_2 = require("../../middleware/index");
const middleware_1 = require("../../middleware");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
const userServices = new user_service_1.default();
const routes = {
    sendFriendRequest: "/send-friend-request/:to",
    uploadProfilePicture: "/upload-profile-picture",
    uploadCoverImages: "/upload-cover-images",
    uploadFileWithPresignedUrl: "/upload-file-with-presigned-url",
    acceptFriendRequest: "/accept-friend-request/:from",
    deleteFriendRequest: "/delete-friend-request/:to",
    unfriend: "/unfriend/:friendId",
    blockUser: "/block-user/:userId",
    getFilesOrDownloadPreSignedUrl: "/pre-signed-url/uploads/*path",
    getFilesOrDownload: "/uploads/*path",
    deleteProfileImage: "/uploads/delete-profile-image/*path",
    deleteCoverImages: "/uploads/delete-cover-images/*path",
    updateUserBasicInfo: "/update-user-basic-info",
    getUserProfile: "/profile",
};
router.post(routes.sendFriendRequest, (0, index_2.auth)(), (0, middleware_1.validationMiddleware)(user_validation_1.sendFriendRequestSchema), userServices.sendFriendRequest);
router.patch(routes.acceptFriendRequest, (0, index_2.auth)(), (0, middleware_1.validationMiddleware)(user_validation_1.acceptFriendRequestSchema), userServices.acceptFriendRequest);
router.patch(routes.deleteFriendRequest, (0, index_2.auth)(), (0, middleware_1.validationMiddleware)(user_validation_1.deleteFriendRequestSchema), userServices.deleteFriendRequest);
router.patch(routes.unfriend, (0, index_2.auth)(), (0, middleware_1.validationMiddleware)(user_validation_1.unfriendSchema), userServices.unfriend);
router.patch(routes.blockUser, (0, index_2.auth)(), (0, middleware_1.validationMiddleware)(user_validation_1.blockUserSchema), userServices.blockUser);
router.patch(routes.uploadProfilePicture, (0, index_2.auth)(), (0, index_1.uploadFile)({}).single("profilePicture"), userServices.uploadProfilePicture);
router.patch(routes.uploadCoverImages, (0, index_2.auth)(), (0, index_1.uploadFile)({}).array("coverImages", 5), userServices.uploadCoverImages);
router.patch(routes.uploadFileWithPresignedUrl, (0, index_2.auth)(), userServices.uploadFileWithPreSignedUrl);
router.patch(routes.updateUserBasicInfo, (0, index_2.auth)(), userServices.updateUserBasicInfo);
router.get(routes.getFilesOrDownload, userServices.getFilesOrDownload);
router.get(routes.getFilesOrDownloadPreSignedUrl, userServices.getFilesOrDownloadPreSignedUrl);
router.get(routes.getUserProfile, (0, index_2.auth)(), userServices.getUserProfile);
router.delete(routes.deleteProfileImage, (0, index_2.auth)(), userServices.deleteProfileImage);
router.delete(routes.deleteCoverImages, (0, index_2.auth)(), userServices.deleteCoverImages);
exports.default = router;
