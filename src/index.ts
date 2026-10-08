import express, { type Router, type Request, type Response } from "express";
import { docs } from "../utils/openapi";
import { indexResponse } from "./types";
import { ExplosionsSchema, expressResponse } from "../utils/express";
import { Logger } from "../utils/logger";
import { apiReference } from "@scalar/express-api-reference";

export const router: Router = express.Router();

docs.path("/", "get", {
  summary: "Ping Pong",
  description: "Checking if the API is up.",
  tags: ["PING"],
});
docs.response("/", "get", "200", "OK Response", indexResponse);
docs.response("/", "get", "520", "Blame the devs", ExplosionsSchema);

router.get("/", (_req: Request, res: Response) => {
  const log = new Logger();

  return expressResponse(res, log, indexResponse, 200, { ping: "pong" });
});

router.use("/openapi", (_req: Request, res: Response) =>
  res.status(200).json(docs.export()),
);

router.use(
  "/docs",
  apiReference({
    spec: {
      url: "/openapi",
    },
    theme: "deepSpace",
  }),
);
