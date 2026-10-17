import express, { type Router, type Request, type Response } from "express";
import { Logger } from "../../utils/logger";
import {
	createSession200,
	createSessionHeaders,
	createSessionSchema,
	createUser200,
	createUserSchema,
	listSessions200,
	listSessionsCookies,
} from "./types";
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

docs.path("/auth/create-session", "post", {
	summary: "Create session",
	description:
		"Create session using login credentials for a user. Each session lasts 30 days or can be revoked manually using /auth/revoke-session endpoint",
	tags: ["AUTH"],
});
docs.headers("/auth/create-session", "post", createSessionHeaders);
docs.requestBody("/auth/create-session", "post", createSessionSchema);
docs.response(
	"/auth/create-session",
	"post",
	"200",
	"session id for the user session (embedded in cookies as well)",
	createSession200,
);
docs.response(
	"/auth/create-session",
	"post",
	"400",
	"Failed parsing request",
	genericError,
);
docs.response(
	"/auth/create-session",
	"post",
	"404",
	"User Credential Error",
	genericError,
);
docs.response(
	"/auth/create-session",
	"post",
	"500",
	"Internal Server Error",
	genericError,
);
docs.response(
	"/auth/create-session",
	"post",
	"599",
	"Blame the devs",
	explosionsSchema,
);
authRouter.post("/create-session", async (req: Request, res: Response) => {
	const log = new Logger();
	log.info({ route: "POST /auth/create-session" });

	const reqBody = createSessionSchema.safeParse(req.body);
	if (!reqBody.success)
		return await expressResponse(res, log, genericError, 400, {
			error: "Failed to parse request body",
		});
	log.data({ ...reqBody.data, password: "" });

	const reqHeaders = createSessionHeaders.safeParse(req.headers);
	if (!reqHeaders.success)
		return await expressResponse(res, log, genericError, 400, {
			error: "Failed to parse request headers",
		});
	log.data({ ...reqHeaders.data });

	return (
		await authService.createSession(reqBody.data, reqHeaders.data, log)
	).match(
		async (t) => {
			res.cookie("sessionId", t, {
				httpOnly: true,
				sameSite: "none",
				maxAge: 1000 * 60 * 60 * 24 * 30,
				path: "/",
			});
			return await expressResponse(res, log, createSession200, 200, {
				sessionId: t,
			});
		},
		async (e) => {
			if (e == 404)
				return await expressResponse(res, log, genericError, 404, {
					error: "Invalid user credentials or non existent user.",
				});
			if (e == 500)
				return await expressResponse(res, log, genericError, 500, {
					error: "Internal Server Error",
				});
		},
	);
});

docs.path("/auth/list-sessions", "get", {
	summary: "List sessions",
	description:
		"List active user sessions. SessionId in case you want to revoke. User Agent, Creation and Expiration date",
	tags: ["AUTH"],
});
docs.cookies("/auth/list-sessions", "get", listSessionsCookies);
docs.response(
	"/auth/list-sessions",
	"get",
	"200",
	"Array of active sessions",
	listSessions200,
);
docs.response(
	"/auth/list-sessions",
	"get",
	"400",
	"Failed parsing request",
	genericError,
);
docs.response(
	"/auth/list-sessions",
	"get",
	"404",
	"User Credential Error",
	genericError,
);
docs.response(
	"/auth/list-sessions",
	"get",
	"500",
	"Internal Server Error",
	genericError,
);
docs.response(
	"/auth/list-sessions",
	"get",
	"599",
	"Blame the devs",
	explosionsSchema,
);
authRouter.get("/list-sessions", async (req: Request, res: Response) => {
	const log = new Logger();
	log.info({ route: "GET /auth/list-sessions" });

	const reqCookies = listSessionsCookies.safeParse(req.cookies);
	if (!reqCookies.success)
		return await expressResponse(res, log, genericError, 400, {
			error: "Failed to parse request cookies",
		});

	return (await authService.listActiveSessions(reqCookies.data, log)).match(
		async (t) => {
			return await expressResponse(res, log, listSessions200, 200, {
				sessions: t,
			});
		},
		async (e) => {
			if (e == 404)
				return await expressResponse(res, log, genericError, 404, {
					error: "Invalid user credentials or non existent user.",
				});
			if (e == 500)
				return await expressResponse(res, log, genericError, 500, {
					error: "Internal Server Error",
				});
		},
	);
});
