import type z from "zod";
import type { createUserSchema } from "./types";
import { Result } from "../../utils/result";
import type { Logger } from "../../utils/logger";
import drizzleOps from "../../utils/drizzle";
import { usersTable } from "../../lib/db/schema";
import * as argon2 from "argon2";
import zxcvbn from "zxcvbn";

const usersTableCrud = drizzleOps.createCrud(usersTable, usersTable.id);

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

	log.debug({ op: "db query" });
	const q = await usersTableCrud.insert({ ...values }, log);
	if (!q.value.success) return Result.error(500);

	return Result.ok(q.value.data.id);
}

export const authService = {
	createUser,
};
