import z from "zod";

export const indexGetResponse = z.object({
  ping: z
    .string()
    .meta({ example: "pong", description: "returns pong if api is up" }),
});
