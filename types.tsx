import { z } from "zod";
import { Endpoints } from "@octokit/types";



//category data type start copy here
const htmlAttributesSchema = z.object({
    style: z.record(z.string()).optional(),
    className: z.string().optional(),
    id: z.string().optional(),
});
export type htmlAttributesType = z.infer<typeof htmlAttributesSchema>


const navSubMenuItem = z.object({
    label: z.string(),
    link: z.string(),
})
const navMenuItem = z.object({
    label: z.string(),
    link: z.string(),
    subMenu: z.array(navSubMenuItem).optional()
})
export const navBarsSchema = z.object({
    category: z.literal("navbars"),
    mainElProps: htmlAttributesSchema,
    styleId: z.string(),

    menu: z.array(navMenuItem),
})
export type navBarsType = z.infer<typeof navBarsSchema>





export const herosSchema = z.object({
    category: z.literal("heros"),
    mainElProps: htmlAttributesSchema,
    styleId: z.string(),

})
export type herosType = z.infer<typeof herosSchema>





export const containersSchema = z.object({
    category: z.literal("containers"),
    mainElProps: htmlAttributesSchema,
    styleId: z.string(),

    children: z.array(z.any()),
})
export type containersType = z.infer<typeof containersSchema>





export const textElementsSchema = z.object({
    mainElProps: htmlAttributesSchema,
    styleId: z.string(),

    category: z.literal("textElements"),
})
export type textElementsType = z.infer<typeof textElementsSchema>





export const componentDataSchema = z.union([navBarsSchema, herosSchema, containersSchema, textElementsSchema])
export type componentDataType = z.infer<typeof componentDataSchema>
//category data type end copy here





// regular types
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

export const fontsSchema = z.array(z.enum(["poppins", "arial"]))
export type fontsType = z.infer<typeof fontsSchema>

export type sizeOptionType = {
    name: string,
    width: number,
    height: number,
    active: boolean,
    icon: JSX.Element
}

const collectionSchema = z.object({
    relativePath: z.string().min(1),
    content: z.string().min(1),
})
export type collection = z.infer<typeof collectionSchema>




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



//database types
//keep synced with db schema
export const userRoleSchema = z.enum(["admin"])

export const userSchema = z.object({
    id: z.string().min(1),
    userGithubTokens: z.array(z.object({
        id: z.string().min(1),
        username: z.string().min(1),
        token: z.string().min(1),
        active: z.boolean(),
    })),
    role: userRoleSchema.nullable(),
    name: z.string().nullable(),
    image: z.string().min(1).nullable(),
    email: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
})
export type user = z.infer<typeof userSchema> & {
    websites?: website[]
}
export type newUser = {
}





export const websiteSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    fonts: fontsSchema,
    globalCss: z.string(),

    userUploadedImages: userUploadedImagesSchema,
})
export type website = z.infer<typeof websiteSchema> & {
    fromUser?: user,
    pages?: page[]
}
export const newWebsiteSchema = websiteSchema.pick({ name: true })
export type newWebsite = z.infer<typeof newWebsiteSchema>





export const pageSchema = z.object({
    id: z.string().min(1),
    websiteId: z.string().min(1),
    name: z.string().min(1),
})
export type page = z.infer<typeof pageSchema> & {
    fromWebsite?: website,
    pagesToComponents?: pagesToComponent[]
}
export const newPageSchema = pageSchema.pick({ name: true })
export type newPage = z.infer<typeof newPageSchema>




export const componentSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    categoryId: z.string().min(1),
    defaultCss: z.string(),
    defaultData: componentDataSchema,
})
export type component = z.infer<typeof componentSchema> & {
    componentsToStyles?: componentsToStyle[],
    pagesToComponents?: pagesToComponent[],
    category?: category,
}
export const newComponentSchema = componentSchema.pick({ name: true, categoryId: true, defaultCss: true, defaultData: true, })
export type newComponent = z.infer<typeof newComponentSchema>





export const categoryNameSchema = z.enum(["navbars", "heros", "containers"])
export type categoryName = z.infer<typeof categoryNameSchema>

export const categoriesSchema = z.object({
    name: categoryNameSchema,
})
export type category = z.infer<typeof categoriesSchema> & {
    components?: component[]
}





export const stylesSchema = z.object({
    name: z.string().min(1),
})
export type style = z.infer<typeof stylesSchema> & {
    componentsToStyles?: componentsToStyle[]
}





export const childComponentSchema = z.object({ pagesToComponentsId: z.string() })
export type childComponentType = z.infer<typeof childComponentSchema>





export const pagesToComponentsSchema = z.object({
    id: z.string().min(1),
    pageId: z.string().min(1),
    componentId: z.string().min(1),
    css: z.string(),
    indexOnPage: z.number(),
    children: z.array(childComponentSchema),
    isBase: z.boolean(),

    data: componentDataSchema.nullable()
})
export type pagesToComponent = z.infer<typeof pagesToComponentsSchema> & {
    page?: page,
    component?: component,
}





export const componentsToStylesSchema = z.object({
    componentId: z.string().min(1),
    styleName: z.string().min(1),
})
export type componentsToStyle = z.infer<typeof componentsToStylesSchema> & {
    component?: component,
    style?: style
}






