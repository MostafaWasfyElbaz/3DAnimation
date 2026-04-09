import { Events } from "../../common/index";
import { EventEmitter } from "events";
import { sendEmail } from "./send.email";

class EmailEvents {
  constructor(private readonly emitter: EventEmitter) {}

  subscribe = (event: Events, listener: (payload: any) => void) => {
    this.emitter.on(event, listener);
  };

  publish = (event: Events, payload: any) => {
    this.emitter.emit(event, payload);
  };
}

export const emailEmitter = new EmailEvents(new EventEmitter());

emailEmitter.subscribe(
  Events.confirmEmail,
  ({ to, subject="Confirm Email", html }: { to: string; subject?: string; html: string }) => {
    sendEmail(to, subject, html);
  }
);

emailEmitter.subscribe(
  Events.resetPassword,
  ({ to, subject="Reset Password", html }: { to: string; subject?: string; html: string }) => {
    sendEmail(to, subject, html);
  }
);
emailEmitter.subscribe(
  Events.general,
  ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    sendEmail(to, subject, html);
  }
);
