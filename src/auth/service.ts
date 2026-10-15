import type z from "zod";
import zxcvbn from "zxcvbn";
import * as argon2 from "argon2";
import type { createUserSchema } from "./types";
import drizzleOps from "../../utils/drizzle";
import { usersTable } from "../../lib/db/schema/auth";
import type { Logger } from "../../utils/logger";
import { Result } from "../../utils/result";

const usersTableCrud = drizzleOps.createCrud(usersTable, usersTable.id);

export async function createUser(
  values: z.infer<typeof createUserSchema>,
  log: Logger,
): Promise<Result<string, number>> {
  log.trace({ level: "service createUser", values });
  log.debug({ msg: "password strength" });
	const strength = zxcvbn(values.password)
	if (strength.score < 3) {
		return Result.error(403)
	}

	const hashedPassword = await Result.tryCatch({}, async() => await argon2.hash(values.password))
	if (!hashedPassword.value.success) {
		return Result.error(500)
	}

	log.debug({ msg: "db query" });
  return (
    await usersTableCrud.insert(
      { email: values.email, password: hashedPassword.value.data, name: values.name },
      log,
    )
  ).mapError((err) => {
    log.error({ error: err });
    return 500;
  }).mapOk(e => e.id);
}
