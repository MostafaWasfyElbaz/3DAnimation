"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_service_1 = require("./comment.service");
const middleware_1 = require("../../middleware");
const index_1 = require("../../middleware/index");
const comment_validation_1 = require("./comment.validation");
const router = (0, express_1.Router)();
const commentsService = new comment_service_1.CommentService();
const routes = {
    createComment: "/",
    getCommentById: "/get-comment/:commentId",
    deleteComment: "/delete-comment/:commentId",
    freezeComment: "/freeze-comment/:commentId",
    activateComment: "/activate-comment/:commentId",
    updateComment: "/update-comment/:commentId",
};
router.get(routes.getCommentById, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.checkPostIdSchema), commentsService.getCommentById);
router.post(routes.createComment, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.createCommentSchema), commentsService.createComment);
router.patch(routes.freezeComment, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.checkPostIdSchema), commentsService.freezeComment);
router.patch(routes.activateComment, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.checkPostIdSchema), commentsService.activateComment);
router.patch(routes.updateComment, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.updateCommentSchema), commentsService.updateComment);
router.delete(routes.deleteComment, (0, middleware_1.auth)(), (0, index_1.validationMiddleware)(comment_validation_1.checkPostIdSchema), commentsService.deleteComment);
exports.default = router;
