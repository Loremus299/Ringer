import z from "zod";

export const indexResponse = z.strictObject({
  ping: z
    .string()
    .meta({ example: "pong", description: "returns pong if api is up" }),
  metaLogId: z.uuidv4().meta({
    example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    description:
      "Logger ID for your request. Send to developers over Github in case of errors :3",
  }),
});

export const genericError = z.strictObject({
  error: z.string().meta({
    example: "Operation failed",
    description: "Error message for operations",
  }),
  metaLogId: z.uuidv4().meta({
    example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    description: "Logger ID for your request.",
  }),
});

export const genericOk = z.strictObject({
  msg: z.string().meta({
    example: "Operation successful",
    description: "Success message for operations",
  }),
  metaLogId: z.uuidv4().meta({
    example: "36b8f84d-df4e-4d49-b662-bcde71a8764f",
    description: "Logger ID for your request.",
  }),
});
