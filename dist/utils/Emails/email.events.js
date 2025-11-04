"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEmitter = void 0;
const index_1 = require("../../common/index");
const events_1 = require("events");
const send_email_1 = require("./send.email");
class EmailEvents {
    emitter;
    constructor(emitter) {
        this.emitter = emitter;
    }
    subscribe = (event, listener) => {
        this.emitter.on(event, listener);
    };
    publish = (event, payload) => {
        this.emitter.emit(event, payload);
    };
}
exports.emailEmitter = new EmailEvents(new events_1.EventEmitter());
exports.emailEmitter.subscribe(index_1.Events.confirmEmail, ({ to, subject = "Confirm Email", html }) => {
    (0, send_email_1.sendEmail)(to, subject, html);
});
exports.emailEmitter.subscribe(index_1.Events.resetPassword, ({ to, subject = "Reset Password", html }) => {
    (0, send_email_1.sendEmail)(to, subject, html);
});
exports.emailEmitter.subscribe(index_1.Events.general, ({ to, subject, html }) => {
    (0, send_email_1.sendEmail)(to, subject, html);
});
