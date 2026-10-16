import type z from "zod";
import type {
	createSessionHeaders,
	createSessionSchema,
	createUserSchema,
} from "./types";
import { Result } from "../../utils/result";
import type { Logger } from "../../utils/logger";
import drizzleOps from "../../utils/drizzle";
import { userSessionsTable, usersTable } from "../../lib/db/schema";
import * as argon2 from "argon2";
import zxcvbn from "zxcvbn";
import { db } from "../../lib/db";
import { eq } from "drizzle-orm";

async function createUser(
	values: z.infer<typeof createUserSchema>,
	log: Logger,
): Promise<Result<string, 409 | 422 | 500>> {
	log.trace({ layer: "authService - create user" });
	log.data({ ...values, password: "" });

	log.debug({ op: "User exists" });
	const userExists = await drizzleOps.readTableUnique(
		usersTable,
		{ email: values.email },
		log,
	);
	if (userExists.value.success) return Result.error(409);

	log.debug({ op: "Password strength check" });
	const strength = zxcvbn(values.password);
	if (strength.score < 3) return Result.error(422);

	log.debug({ op: "Hashing password" });
	const hashedPassword = await Result.tryCatch(
		{},
		async () => await argon2.hash(values.password),
	);
	if (!hashedPassword.value.success) return Result.error(500);
	const hp = hashedPassword.value.data;

	log.debug({ op: "db query" });
	return (
		await Result.tryCatch(
			{},
			async () =>
				await db
					.insert(usersTable)
					.values({ ...values, password: hp })
					.returning(),
		)
	).match(
		(t) => Result.ok(t[0]!.id),
		() => Result.error(500),
	);
}

async function resolveUserId(
	values: { email: string; password: string },
	log: Logger,
): Promise<Result<string, 500 | 404>> {
	log.trace({ layer: "authService - resolve userid" });
	log.data({ ...values, password: "" });

	log.debug({ op: "db query" });
	const data = await Result.tryCatch({}, async () =>
		db.select().from(usersTable).where(eq(usersTable.email, values.email)),
	);
	if (!data.value.success) return Result.error(500);

	log.debug({ op: "finding user id" });
	const user = data.value.data[0];
	if (!user) return Result.error(404);

	const ok = await Result.tryCatch({}, async () =>
		argon2.verify(user.password, values.password),
	);
	if (!ok.value.success) return Result.error(404);

	return Result.ok(user.id);
}

async function createSession(
	values: z.infer<typeof createSessionSchema>,
	header: z.infer<typeof createSessionHeaders>,
	log: Logger,
): Promise<Result<string, 500 | 404>> {
	log.trace({ layer: "authService - create session" });
	log.data({ ...values, password: "" });

	log.debug({ op: "user id" });
	const userId = await resolveUserId(values, log);
	if (!userId.value.success) return Result.error(userId.value.error);
	const uid = userId.value.data;

	log.debug({ op: "create session query" });
	const query = await Result.tryCatch(
		{},
		async () =>
			await db
				.insert(userSessionsTable)
				.values({
					userId: uid,
					token: `session-${globalThis.crypto.randomUUID()}`,
					userAgent: header["user-agent"],
				})
				.returning(),
	);
	if (!query.value.success) return Result.error(500);

	return Result.ok(query.value.data[0]!.token);
}

export const authService = {
	createUser,
	resolveUserId,
	createSession,
};
