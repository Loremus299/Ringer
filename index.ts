import express, { type Express } from "express";
import z from "zod";
import { router } from "./src";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
});

const envValidity = envSchema.safeParse(process.env);
if (!envValidity.success) throw new Error("");
export const env = envValidity.data;

export const app: Express = express();
app.use(router);

app.listen(env.PORT, () => {
  console.log(`Server UP - PORT ${env.PORT}`);
});
