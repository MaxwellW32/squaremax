import { z } from "zod";
import { specificDataForAAAASchema } from "./templateSpecificDataTypes/aaaaTypes";
import { specificDataForAAABSchema } from "./templateSpecificDataTypes/aaabTypes";

//keep linked data same on all templates
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
        workingHours: z.string(),
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





//keep specific data for each template synced with respective template
//go to specific type e.g specificDataForAAAA to copy the exact schema to the template

//allow specific data to change based on template
export const specificDataSwitchSchema = z.union([specificDataForAAAASchema, specificDataForAAABSchema])


//govern both specific and shared data from template
export const globalFormDataSchema = z.object({
    specificData: specificDataSwitchSchema,
    linkedData: linkedDataSchema,
})
export type globalFormDataType = z.infer<typeof globalFormDataSchema>





export const userSchema = z.object({
    id: z.string().min(1),

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





export type updateProjectsToTemplateFunctionType = { id: string, option: "linked", data: globalFormDataType["linkedData"] } | { id: string, option: "specific", data: globalFormDataType["specificData"] } | { id: string, option: "globalFormData", data: globalFormDataType }