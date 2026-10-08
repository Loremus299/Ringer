import express, { type Router, type Request, type Response } from "express";
import { docs } from "../utils/openapi";
import { indexGetResponse } from "./types";
import { ExplosionsSchema, expressResponse } from "../utils/express";
import { Logger } from "../utils/logger";

export const router: Router = express.Router();

docs.path("/", "get", {
  summary: "Ping Pong",
  description: "Checking if the API is up.",
  tags: ["PING-PONG"],
});
docs.response("/", "get", "200", "OK Response", indexGetResponse);
docs.response("/", "get", "520", "Blame the devs", ExplosionsSchema);

router.get("/", (_req: Request, res: Response) => {
  const log = new Logger();

  return expressResponse(res, log, indexGetResponse, 200, { ping: "pong" });
});
