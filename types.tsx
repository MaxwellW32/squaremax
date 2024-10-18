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





















export type sharedFormInfoType = {
    testimonials: string;
    address: string;
    phoneNumber: string;
}

export const sharedFormInfo: sharedFormInfoType = {
    testimonials: "",
    address: "",
    phoneNumber: "",
}




export type templatesInfoType = {
    [key: string]: {//id
        name: string,
        githubUrl: string,
        domain: string
    };
}

export const templatesInfo: templatesInfoType = {
    "aaaa": {
        name: "testwebsite1",
        githubUrl: "https://github.com/MaxwellW32/aaaa.git",
        domain: "https://onedaywebsite-templates-aaaa.vercel.app"
    }
}
