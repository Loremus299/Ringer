import express, { type Express } from "express";
import { router } from "./src";
import { env } from "./lib/env";

export const app: Express = express();
app.use(express.json())
app.use(router);

app.listen(env.PORT, () => {
  console.log(`Server UP - PORT ${env.PORT}`);
});
