import z from "zod";

export const createUserSchema = z.object({
	email: z.email().meta({
		example: "john@doe.com",
		description: "The email address of the user",
	}),
	password: z
		.string()
		.meta({ example: "password123", description: "The password for the user" }),
	name: z
		.string()
		.min(2)
		.max(100)
		.meta({ example: "John Doe", description: "The name of the user" }),
});

export const createUser200 = z.strictObject({
	userId: z.cuid2().meta({
		example: "pqfvkrtaexdzyady5uwuk9js",
		description: "User id of the user",
	}),
	metaLogId: z.uuidv4().meta({
		example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
		description: "Logger ID for your request.",
	}),
});

export const createSessionSchema = z.object({
	email: z.email().meta({
		example: "john@doe.com",
		description: "The email address of the user",
	}),
	password: z
		.string()
		.meta({ example: "password123", description: "The password of the user" }),
});

export const createSessionHeaders = z.object({
	"user-agent": z.string().meta({
		example: "Internet Explorer",
		description: "User Agent of the request",
	}),
});

export const createSession200 = z.strictObject({
	sessionId: z.string().meta({
		example: "session-36b8f84d-df4e-4d49-b662-bcde71a8764f",
		description: "session id",
	}),
	metaLogId: z.uuidv4().meta({
		example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
		description: "Logger ID for your request.",
	}),
});

export const listSessionsCookies = z.object({
	sessionId: z.string().meta({
		example: "session-36b8f84d-df4e-4d49-b662-bcde71a8764f",
		description: "session id",
	}),
});

export const listSessions200 = z.strictObject({
	sessions: z.array(
		z.object({
			sessionId: z.string().meta({
				example: "session-36b8f84d-df4e-4d49-b662-bcde71a8764f",
				description: "Session Id",
			}),
			userAgent: z.string().meta({
				example: "Internet Explorer",
				description: "User Agent of the session",
			}),
			createdAt: z.coerce.string().meta({
				example: new Date().toISOString(),
				description: "Creation date of the session cookie",
			}),
			expiryDate: z.coerce.string().meta({
				example: new Date().toISOString(),
				description: "Expiration date of the session cookie",
			}),
		}),
	),
	metaLogId: z.uuidv4().meta({
		example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
		description: "Logger ID for your request.",
	}),
});
