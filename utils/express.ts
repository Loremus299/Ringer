import type { Response } from "express";
import type { Logger } from "./logger";
import z from "zod";

export async function expressResponse(
  res: Response,
  log: Logger,
  schema: z.ZodObject,
  status: number,
  data: Object,
) {
  await log.dump();
  const validity = schema.safeParse(data);
  if (!validity.success) {
    return res.status(520).json({
      error: "The API is now serverless, NOT IN A GOOD WAY (⊙_⊙)",
      metaLogId: log.id,
    });
  }

  return res.status(status).json({ ...data, metaLogId: log.id });
}

export const ExplosionsSchema = z.object({
  error: z.string().meta({
    description:
      "Oh this error is really bad! Please tell me on Github if you get 520 status code. This error is sign of developer failure, not your query or server even.",
    example: "The API is now serverless, NOT IN A GOOD WAY (⊙_⊙)",
  }),
});
