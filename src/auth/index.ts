import express, { type Router, type Request, type Response } from "express";
import { Logger } from "../../utils/logger";
import { createUser200, createUserSchema } from "./types";
import { expressResponse } from "../../utils/express";
import { genericError } from "../types";
import { authService } from "./service";

export const authRouter: Router = express.Router();

authRouter.post("/create-user", async (req: Request, res: Response) => {
	const log = new Logger();
	log.info({ route: "POST /auth/create-user" });

	const reqBody = createUserSchema.safeParse(req.body);
	if (!reqBody.success)
		return await expressResponse(res, log, genericError, 400, {
			error: "Failed to parse request body",
		});
	log.data({ ...reqBody.data, password: "" });

	return (await authService.createUser(reqBody.data, log)).match(
		async (t) => {
			return await expressResponse(res, log, createUser200, 200, { userId: t });
		},
		async (e) => {
			if (e == 409)
				return await expressResponse(res, log, genericError, 409, {
					error: "User already exists",
				});

			if (e == 422)
				return await expressResponse(res, log, genericError, 422, {
					error: "Password is too weak to be used",
				});

			if (e == 500)
				return await expressResponse(res, log, genericError, 500, {
					error: "Internal Server Error",
				});
		},
	);
});
