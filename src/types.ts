import z from "zod";

export const indexResponse = z.object({
  ping: z
    .string()
    .meta({ example: "pong", description: "returns pong if api is up" }),
});
