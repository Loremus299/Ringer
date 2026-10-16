import express, { type Router, type Request, type Response } from "express";
import { Logger } from "../../utils/logger";
import { createUser200, createUserSchema } from "./types";
import { explosionsSchema, expressResponse } from "../../utils/express";
import { genericError } from "../types";
import { authService } from "./service";
import { docs } from "../../utils/openapi";

export const authRouter: Router = express.Router();

docs.path("/auth/create-user", "post", {
	summary: "Create user",
	description:
		"Create new user using name, email address and password. One account per email address.",
	tags: ["AUTH"],
});
docs.requestBody(
	"/auth/create-user",
	"post",
	createUserSchema,
	"Name, email and password",
);
docs.response(
	"/auth/create-user",
	"post",
	"200",
	"UserID for created account",
	createUser200,
);
docs.response(
	"/auth/create-user",
	"post",
	"400",
	"Failed parsing request body",
	genericError,
);
docs.response(
	"/auth/create-user",
	"post",
	"409",
	"User already exists",
	genericError,
);
docs.response(
	"/auth/create-user",
	"post",
	"422",
	"Weak password strength",
	genericError,
);
docs.response(
	"/auth/create-user",
	"post",
	"500",
	"Internal Server Error",
	genericError,
);
docs.response(
	"/auth/create-user",
	"post",
	"599",
	"Blame the devs",
	explosionsSchema,
);

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
