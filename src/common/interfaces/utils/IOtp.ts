export interface IOtp {
  otp: string;
  expiresAt: Date;
  attempts?: {
    count: number;
    banExp?: Date | undefined;
  };
  request?: {
    count: number;
    banExp?: Date | undefined;
  };
}
