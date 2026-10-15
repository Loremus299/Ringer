import express, { type Router, type Request, type Response } from "express";
import { docs } from "../../utils/openapi";
import { createUser200, createUserSchema } from "./types";
import { Logger } from "../../utils/logger";
import { expressResponse } from "../../utils/express";
import { genericError, genericOk } from "../types";
import { createUser } from "./service";

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
  log.info({ route: "POST /auth/create-user" });

  const bodyValidation = createUserSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    log.error({ error: bodyValidation.error.message });
    return await expressResponse(res, log, genericError, 400, {
      error: bodyValidation.error.message,
    });
  }

  log.data({ body: bodyValidation.data });

  const service = (
    await createUser(bodyValidation.data, log.nest("Service Call"))
  ).mapError((e) => {
    if (e == 500) {
      return [500, "Internal Server Error"];
    }
    if (e == 403) {
      return [403, "Password not strong enough"];
    }
    return [500, ""];
  });

  if (!service.value.success) {
		return await expressResponse(res, log, genericError, service.value.error[0] as number, {error: service.value.error[1] as string})
  }
	return await expressResponse(res, log, createUser200, 200, {
      userId: service.value.data,
    });
});
