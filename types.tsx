import { z } from "zod";

export const userSchema = z.object({
    id: z.string().min(1),
    completedUserSetup: z.boolean(),

    name: z.string().nullable(),
    image: z.string().min(1).nullable(),
    email: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
})

export type user = z.infer<typeof userSchema> & {
}
export type newUser = Omit<user, "id" | "name" | "image" | "email" | "emailVerified"> & {
}


// this is what each template send to the main site
export const templateInfoPostMessageSchema = z.object({
    fromTemplate: z.string().min(1),
    data: z.string().min(1),
})
export type templateInfoPostMessageType = z.infer<typeof templateInfoPostMessageSchema>

// this is what's written to each website template
export const websiteCustomizationsSchema = z.object({
    projectName: z.string().min(1),
    customerGlobalFormData: z.string().min(1),
})
export type websiteCustomizationsType = z.infer<typeof websiteCustomizationsSchema>











































