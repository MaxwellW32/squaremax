import { z } from "zod";

//the data type for all templates globalFormData obj
const templateGlobalFormDataSchema = z.object({
    siteInfo: z.object({
        name: z.string().min(1),
        fonts: z.string().array(),
    }).passthrough()
}).passthrough()
export type templateGlobalFormDataType = z.infer<typeof templateGlobalFormDataSchema>



// this is what each template sends to the main site
export const postMessageSchemaTemplateInfo = z.object({
    fromTemplate: z.string().min(1),
    globalFormData: templateGlobalFormDataSchema
})
export type postMessageSchemaTemplateInfoType = z.infer<typeof postMessageSchemaTemplateInfo>





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

    templateId: z.string().min(1).nullable(),
    templateData: templateGlobalFormDataSchema.nullable()
})
export type project = z.infer<typeof projectsSchema> & {
    fromUser?: user,
    template?: template | null
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
    templatesToCategories?: templatesToCategories[]
    templatesToStyles?: templatesToStyles[]
}
export const newTemplatesSchema = templatesSchema.omit({})
export type newTemplate = z.infer<typeof newTemplatesSchema>




export const categoriesSchema = z.object({
    name: z.string().min(1),
})
export type category = z.infer<typeof categoriesSchema> & {
    templatesToCategories?: templatesToCategories[]
}






export const stylesSchema = z.object({
    name: z.string().min(1),
})
export type style = z.infer<typeof stylesSchema> & {
    templatesToStyles?: templatesToStyles[]
}




export const templatesToCategoriesSchema = z.object({
    templateId: z.string().min(1),
    categoryName: z.string().min(1),
})
export type templatesToCategories = z.infer<typeof templatesToCategoriesSchema> & {
    template?: template,
    category?: category
}





export const templatesToStylesSchema = z.object({
    templateId: z.string().min(1),
    styleName: z.string().min(1),
})
export type templatesToStyles = z.infer<typeof templatesToStylesSchema> & {
    template?: template,
    style?: style
}










