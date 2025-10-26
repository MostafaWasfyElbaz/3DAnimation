"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../utils/index");
const index_2 = require("../../middleware/index");
const post_validation_1 = require("./post.validation");
const index_3 = require("../../middleware/index");
const post_service_1 = require("./post.service");
const router = (0, express_1.Router)();
const postServices = new post_service_1.PostServices();
const routes = {
    createPost: "/",
    likeUnlikePost: "/like-unlike",
    getPostById: "/get-post-by-id/:postId",
    freezePost: "/freeze-post/:postId",
    activatePost: "/activate-post/:postId",
    deletePost: "/delete-post/:postId",
    updatePost: "/update-post/:postId",
};
router.get(routes.getPostById, (0, index_2.auth)(), (0, index_3.validationMiddleware)(post_validation_1.checkPostIdSchema), postServices.getPostById);
router.post(routes.createPost, (0, index_2.auth)(), (0, index_1.uploadFile)({}).array("attachments", 5), (0, index_3.validationMiddleware)(post_validation_1.createPostSchema), postServices.createPost);
router.patch(routes.likeUnlikePost, (0, index_2.auth)(), (0, index_3.validationMiddleware)(post_validation_1.likeUnlikePostSchema), postServices.likeUnlikePost);
router.patch(routes.freezePost, (0, index_2.auth)(), (0, index_3.validationMiddleware)(post_validation_1.checkPostIdSchema), postServices.freezePost);
router.patch(routes.activatePost, (0, index_2.auth)(), (0, index_3.validationMiddleware)(post_validation_1.checkPostIdSchema), postServices.activatePost);
router.patch(routes.updatePost, (0, index_2.auth)(), (0, index_1.uploadFile)({}).array("attachments", 5), (0, index_3.validationMiddleware)(post_validation_1.updatePostSchema), postServices.updatePost);
router.delete(routes.deletePost, (0, index_2.auth)(), (0, index_3.validationMiddleware)(post_validation_1.checkPostIdSchema), postServices.deletePost);
exports.default = router;
