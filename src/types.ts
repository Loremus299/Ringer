import z from "zod";

export const indexResponse = z.object({
  ping: z
    .string()
    .meta({ example: "pong", description: "returns pong if api is up" }),
  metaLogId: z.uuidv4().meta({
    example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    description:
      "Logger ID for your request. Send to developers over Github in case of errors :3",
  }),
});
