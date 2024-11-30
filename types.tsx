import { z } from "zod";
import { specificDataForAAAASchema } from "./types/templateSpecificDataTypes/aaaaTypes";
import { specificDataForAAABSchema } from "./types/templateSpecificDataTypes/aaabTypes";
import { Endpoints } from "@octokit/types";

//keep linkedData same on all templates
// start linked data copy on templates //
export const testimonialSchema = z.array(z.object({
    name: z.string(),
    position: z.string(),
    photo: z.string(),
    text: z.string(),
    rating: z.number(),
    date: z.string(),
    links: z.array(z.string()),
    company: z.string(),
}))

export const linkedDataSchema = z.object({
    siteInfo: z.object({
        phone: z.string(),
        address: z.string(),
        websiteName: z.string().min(1),
        websiteTitle: z.string(),
        websiteDescription: z.string(),
        logo: z.string(),
        opengraphLogo: z.string(),
        email: z.string(),
        workingHours: z.array(z.string()),
        favicon: z.string(),
        copyrightInformation: z.string(),
    }),
    testimonials: testimonialSchema,
    team: z.array(z.object({
        name: z.string(),
        position: z.string(),
        photo: z.string(),
        bio: z.string(),
        links: z.array(z.string()),
        email: z.string(),
        phone: z.string(),
        skills: z.array(z.string()),
        achievements: z.array(z.string()),
    })),
    products: z.array(z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        images: z.array(z.string()),
        sku: z.string(),
        categories: z.array(z.string()),
        tags: z.array(z.string()),
        available: z.boolean(),
        featured: z.boolean(),
        discounts: z.string(),
        ratings: z.number(),
        productTestimonials: testimonialSchema,
    })),
    gallery: z.array(z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        categories: z.array(z.string()),
        tags: z.array(z.string()),
        featured: z.boolean(),
        date: z.string(),
        author: z.string(),
    })),
    services: z.array(z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        icon: z.string(),
        duration: z.string(),
        tags: z.array(z.string()),
        callToAction: z.string(),
        availability: z.string(),
        serviceTestimonials: testimonialSchema,
    })),
    socials: z.array(z.object({
        platform: z.string(),
        url: z.string(),
        icon: z.string(),
        description: z.string(),
    })),
})
export type linkedDataType = z.infer<typeof linkedDataSchema>
// end linked data copy on templates //





//keep specificData synced with respective template - go to specific type e.g specificDataForAAAA to copy the exact schema to the template
//allows specific data to change based on template
export const specificDataSwitchSchema = z.union([specificDataForAAAASchema, specificDataForAAABSchema])


//globalFormDataSchema
export const globalFormDataSchema = z.object({
    specificData: specificDataSwitchSchema,
    linkedData: linkedDataSchema,
})
export type globalFormDataType = z.infer<typeof globalFormDataSchema>





// other types
export type updateProjectsToTemplateFunctionType = { id: string, option: "linked", data: globalFormDataType["linkedData"] } | { id: string, option: "specific", data: globalFormDataType["specificData"] } | { id: string, option: "globalFormData", data: globalFormDataType }

export const userUploadedImagesSchema = z.array(z.string())
export type userUploadedImagesType = z.infer<typeof userUploadedImagesSchema>

export type websiteDownloadOptionType = "file" | "github"

export type githubRepo = Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"]
export type githubUser = Endpoints["GET /users/{username}"]["response"]["data"]
export type githubContentData = {
    type: "file" | "symlink" | "submodule" | "dir";
    size: number;
    name: string;
    path: string;
    content?: string | undefined;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
}

export const newGithubRepoSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    private: z.boolean(),
})
export type newGithubRepoType = z.infer<typeof newGithubRepoSchema> & {}





//form validation types
export type formInputInputType = {
    label?: string,
    placeHolder?: string,
    type?: "text" | "number",
    required?: boolean,

    inputType: "input"
}
export type formInputTextareaType = {
    label?: string,
    placeHolder?: string,
    required?: boolean,
    inputType: "textarea"
}
export type formInputImageType = {
    label?: string,
    placeHolder?: string,
    required?: boolean,

    inputType: "image"
}
export type formInputType = formInputInputType | formInputTextareaType | formInputImageType

export type makeLinkedDataTypeFormInputs<Type> = {
    [key in keyof Type]: Type[key] extends (infer U)[] // Check if it's an array
    ? U extends object // If array item is an object
    ? [{ [SubKey in keyof U]: formInputType }] // Apply formInputType recursively for each object in the array
    : formInputType[] // If array items are not objects, just apply formInputType[]
    : Type[key] extends object // If it's an object
    ? makeLinkedDataTypeFormInputs<Type[key]> // Recurse into the object
    : formInputType; // Otherwise, just apply formInputType to the value
};
export type moreFormInfoType = makeLinkedDataTypeFormInputs<linkedDataType>
export type formErrorsType = { [key: string]: string }











//database types
export const userSchema = z.object({
    id: z.string().min(1),
    userGithubTokens: z.array(z.object({
        id: z.string().min(1),
        username: z.string().min(1),
        token: z.string().min(1),
        active: z.boolean(),
    })),

    role: z.enum(["admin", "normal"]).nullable(), //keep synced with database enum
    name: z.string().nullable(),
    image: z.string().min(1).nullable(),
    email: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
})
export type user = z.infer<typeof userSchema> & {
    projects?: project[]
}
export type newUser = {
}





export const projectsSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    userId: z.string().min(1),

    userUploadedImages: userUploadedImagesSchema.nullable()
})
export type project = z.infer<typeof projectsSchema> & {
    fromUser?: user,
    projectsToTemplates?: projectsToTemplate[]
}
export const newProjectsSchema = projectsSchema.pick({ name: true })
export type newProject = z.infer<typeof newProjectsSchema>





export const templatesSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    github: z.string().min(1),
    url: z.string().min(1),
})
export type template = z.infer<typeof templatesSchema> & {
    templatesToCategories?: templatesToCategory[]
    templatesToStyles?: templatesToStyle[],
    projectsToTemplates?: projectsToTemplate[],
}
export const newTemplatesSchema = templatesSchema.omit({})
export type newTemplate = z.infer<typeof newTemplatesSchema>


// "selfCare", "portfolio", "ownService", "educational", "hospitality", "media" add later
export const categoryNameSchema = z.enum(["food", "ecommerce"])
export type categoryName = z.infer<typeof categoryNameSchema>

export const categoriesSchema = z.object({
    name: categoryNameSchema,
})
export type category = z.infer<typeof categoriesSchema> & {
    templatesToCategories?: templatesToCategory[]
}





export const stylesSchema = z.object({
    name: z.string().min(1),
})
export type style = z.infer<typeof stylesSchema> & {
    templatesToStyles?: templatesToStyle[]
}





export const projectsToTemplatesSchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    templateId: z.string().min(1),
    globalFormData: globalFormDataSchema.nullable()
})
export type projectsToTemplate = z.infer<typeof projectsToTemplatesSchema> & {
    project?: project
    template?: template,
}
export type projectToTemplatePlusType = projectsToTemplate & {
    moreInfo: {
        confirmDelete: boolean,
        saveState: "saved" | "saving" | null,
        active: boolean,
        connected: boolean,
        showingMoreInfo: boolean
    }
}





export const templatesToCategoriesSchema = z.object({
    templateId: z.string().min(1),
    categoryName: z.string().min(1),
})
export type templatesToCategory = z.infer<typeof templatesToCategoriesSchema> & {
    template?: template,
    category?: category
}





export const templatesToStylesSchema = z.object({
    templateId: z.string().min(1),
    styleName: z.string().min(1),
})
export type templatesToStyle = z.infer<typeof templatesToStylesSchema> & {
    template?: template,
    style?: style
}