import { z } from "zod";

//send shared data to templates
//send specific data to templates on load

//from template save the specific data





// start can copy on templates //
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

export const sharedDataSchema = z.object({
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
export type sharedDataType = z.infer<typeof sharedDataSchema>
// end can copy on templates //


export const specificDataSchema = z.object({}).passthrough()
export type specificDataType = z.infer<typeof specificDataSchema>




//info received from templates -- save data
export const dataFromTemplateSchema = z.object({
    fromTemplate: z.string().min(1),
    specificData: specificDataSchema
})
export type dataFromTemplateType = z.infer<typeof dataFromTemplateSchema>


//info sent to templates -- write data
export const sharedDataToTemplateSchema = z.object({
    sharedData: sharedDataSchema.nullable(),
})
export type sharedDataToTemplateType = z.infer<typeof sharedDataToTemplateSchema>

//info sent to templates -- write data
export const specificDataToTemplateSchema = z.object({
    specificData: specificDataSchema.nullable()
})
export type specificDataToTemplateType = z.infer<typeof specificDataToTemplateSchema>


//info sent when downloading template
export const templateGlobalFormDataSchema = z.object({
    sharedData: sharedDataSchema,
    specificData: specificDataSchema
})
export type templateGlobalFormDataType = z.infer<typeof templateGlobalFormDataSchema>







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

    sharedData: sharedDataSchema.nullable()
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




export const categoriesSchema = z.object({
    name: z.string().min(1),
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

    specificData: specificDataSchema.nullable()
})
export type projectsToTemplate = z.infer<typeof projectsToTemplatesSchema> & {
    project?: project
    template?: template,
}

export type projectToTemplatePlusType = projectsToTemplate & {
    confirmDelete: boolean,
    saveState: "saved" | "saving" | null,
    active: boolean,
    connected: boolean
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










