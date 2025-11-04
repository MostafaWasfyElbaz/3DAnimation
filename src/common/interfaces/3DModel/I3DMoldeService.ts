import { Request, Response } from "express";

export interface I3DMoldeService {
  uploadModel(req: Request, res: Response): Promise<Response>;
}
