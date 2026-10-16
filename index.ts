import express, { type Express } from "express";
import cors from "cors";
import { router } from "./src";
import { env } from "./lib/env";

export const app: Express = express();

app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
	}),
);

app.use(express.json());
app.use(router);

app.listen(env.PORT, () => {
	console.log(`Server UP - PORT ${env.PORT}`);
});
