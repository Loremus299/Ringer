import z from "zod";

export const createUserSchema = z.object({
	email: z.email().meta({ example: "john@doe.com", description: "The email address of the user" }),
	password: z.string().meta({ example: "password123", description: "The password for the user" }),
	name: z.string().min(2).max(100).meta({ example: "John Doe", description: "The name of the user" })		
})

