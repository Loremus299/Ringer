import express, { type Router, type Request, type Response } from "express";
import { docs } from "../../utils/openapi";
import { createUserSchema } from "./types";
import { Logger } from "../../utils/logger";
import { expressResponse } from "../../utils/express";
import { genericError } from "../types";

export const authRouter: Router = express.Router();

docs.path("/auth/create-user", "post", {
  summary: "Create User",
  description: "Creates a new user using email and password",
  tags: ["AUTH"],
});
docs.requestBody(
  "/auth/create-user",
  "post",
  createUserSchema,
  "Email, password and name to register for user",
);
docs.response(
  "/auth/create-user",
  "post",
  "400",
  "Invalid Request Body",
  genericError,
);

authRouter.post("/create-user", async (req: Request, res: Response) => {
  const log = new Logger();
  log.info({ route: "POST /auth/create-user", body: req.body });

  const bodyValidation = createUserSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    log.error({ route: "POST /auth/create-user", error: bodyValidation.error });
    return expressResponse(res, log, genericError, 400, {
      error: bodyValidation.error,
      metaLogId: log.id,
    });
  }
});
