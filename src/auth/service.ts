import type z from "zod";
import type { createUserSchema } from "./types";
import drizzleOps from "../../utils/drizzle";
import { usersTable } from "../../lib/db/schema/auth";
import type { Logger } from "../../utils/logger";

const usersTableCrud = drizzleOps.createCrud(usersTable, usersTable.id);

export async function createUser(
  values: z.infer<typeof createUserSchema>,
  log: Logger,
) {
  log.trace({ level: "service createUser", values });
  return (await usersTableCrud.insert(
    { email: values.email, password: values.password, name: values.name },
    log,
  )).mapError((err) => {
    log.error({ error: err });
    return 500;
  })
}
