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



export const templateInfoPostMessageSchema = z.object({
    fromTemplate: z.string().min(1),
    data: z.string().min(1),
})
export type templateInfoPostMessageType = z.infer<typeof templateInfoPostMessageSchema>

export const websiteCustomizationsSchema = z.object({
    projectName: z.string().min(1),
    customerGlobalFormData: z.string().min(1),
})
export type websiteCustomizationsType = z.infer<typeof websiteCustomizationsSchema>











































export type templatesInfoType = {
    [key: string]: {//id
        name: string,
        githubUrl: string,
        domain: string
    };
}

//different domain addresses in production vs dev
export const templatesInfo: templatesInfoType = {
    "aaaa": {
        name: "testwebsite1",
        githubUrl: "https://github.com/MaxwellW32/aaaa.git",
        domain: "http://localhost:3001"
        // domain: "https://onedaywebsite-templates-aaaa.vercel.app"
    }
}
