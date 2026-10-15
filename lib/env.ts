import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.coerce.string().default("postgresql://postgres:postgres@localhost:5432/postgres"),
});

const envValidity = envSchema.safeParse(process.env);
if (!envValidity.success) throw new Error("");

export const env = envValidity.data;