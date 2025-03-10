import { z } from "zod";
import { Endpoints } from "@octokit/types";

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

export type viewerTemplateType = {
    usedComponentIdToSwap: usedComponent["id"],
    template: template | null,
    builtUsedComponent: React.ComponentType<{
        data: templateDataType;
    }> | null
}

export type handleManagePageOptions =
    {
        option: "create",
        seenAddedPage: page,
    } | {
        option: "update",
        seenUpdatedPage: page,
    }

export type handleManageUpdateUsedComponentsOptions =
    {
        option: "create",
        seenAddedUsedComponent: usedComponent,

    } | {
        option: "update",
        seenUpdatedUsedComponent: usedComponent,
        rebuild?: boolean
    }

export const requestDownloadWebsiteBodySchema = z.object({
    websiteId: z.string().min(1),
});
export type requestDownloadWebsiteBodyType = z.infer<typeof requestDownloadWebsiteBodySchema>



















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

    children: z.any(),
})
export type containersType = z.infer<typeof containersSchema>





export const textElementsSchema = z.object({
    category: z.literal("textElements"),
    mainElProps: htmlAttributesSchema,
    styleId: z.string(),
})
export type textElementsType = z.infer<typeof textElementsSchema>





export const templateDataSchema = z.union([navBarsSchema, herosSchema, containersSchema, textElementsSchema])
export type templateDataType = z.infer<typeof templateDataSchema>
//category data type end copy here




















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

export const updateUserSchema = userSchema.omit({ role: true, email: true, emailVerified: true })
export type updateUser = z.infer<typeof updateUserSchema>




export const fontsSchema = z.object({
    importName: z.string().min(1),
    subsets: z.array(z.string().min(1)),
    weights: z.array(z.string().min(1)).nullable()
})
export type fontsType = z.infer<typeof fontsSchema>

export const websiteSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    fonts: z.array(fontsSchema),
    globalCss: z.string(),
    userUploadedImages: userUploadedImagesSchema,
})
export type website = z.infer<typeof websiteSchema> & {
    fromUser?: user,
    pages?: page[],
    usedComponents?: usedComponent[],
}
export const newWebsiteSchema = websiteSchema.omit({ id: true, userId: true, fonts: true, globalCss: true, userUploadedImages: true })
export type newWebsite = z.infer<typeof newWebsiteSchema>

export const updateWebsiteSchema = websiteSchema.omit({ id: true, userId: true, })
export type updateWebsite = z.infer<typeof updateWebsiteSchema>





export const pageSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    websiteId: z.string().min(1),
})
export type page = z.infer<typeof pageSchema> & {
    fromWebsite?: website
}

export const newPageSchema = pageSchema.omit({ id: true })
export type newPage = z.infer<typeof newPageSchema>

export const updatePageSchema = pageSchema.omit({ id: true, websiteId: true })
export type updatePage = z.infer<typeof updatePageSchema>





export const locationHeaderSchema = z.object({
    type: z.literal("header"),
})
export type locationHeaderSchemaType = z.infer<typeof locationHeaderSchema>

export const locationFooterSchema = z.object({
    type: z.literal("footer"),
})
export type locationFooterSchemaType = z.infer<typeof locationFooterSchema>

export const locationPageSchema = z.object({
    type: z.literal("page"),
    pageId: z.string().min(1)
})
export type locationPageSchemaType = z.infer<typeof locationPageSchema>

export const locationChildSchema = z.object({
    type: z.literal("child"),
    parentId: z.string().min(1)
})
export type locationChildSchemaType = z.infer<typeof locationChildSchema>





export const usedComponentLocationSchema = z.union([locationHeaderSchema, locationFooterSchema, locationPageSchema, locationChildSchema])
export type usedComponentLocationType = z.infer<typeof usedComponentLocationSchema>

export const usedComponentSchema = z.object({
    id: z.string().min(1),
    websiteId: z.string().min(1),
    templateId: z.string().min(1),
    css: z.string(),
    order: z.number(),
    location: usedComponentLocationSchema,
    data: templateDataSchema,
})
export type usedComponent = z.infer<typeof usedComponentSchema> & {
    fromWebsite?: website,
    template?: template,
};

export const newUsedComponentSchema = usedComponentSchema.omit({ id: true })
export type newUsedComponent = z.infer<typeof newUsedComponentSchema>

export const updateUsedComponentSchema = usedComponentSchema.omit({ id: true, websiteId: true })
export type updateUsedComponent = z.infer<typeof updateUsedComponentSchema>




export const templatesSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    categoryId: z.string().min(1),
    defaultCss: z.string(),
    defaultData: templateDataSchema,
})
export type template = z.infer<typeof templatesSchema> & {
    templatesToStyles?: templatesToStyles[],
    usedComponents?: usedComponent[],
    category?: category,
}
export const newTemplateSchema = templatesSchema.omit({ id: true })
export type newTemplate = z.infer<typeof newTemplateSchema>





export const categoryNameSchema = z.enum(["navbars", "heros", "containers"])
export type categoryName = z.infer<typeof categoryNameSchema>

export const categoriesSchema = z.object({
    name: categoryNameSchema,
})
export type category = z.infer<typeof categoriesSchema> & {
    templates?: template[]
}





export const stylesSchema = z.object({
    name: z.string().min(1),
})
export type style = z.infer<typeof stylesSchema> & {
    templatesToStyles?: templatesToStyles[]
}





export const templatesToStylesSchema = z.object({
    templateId: z.string().min(1),
    styleName: z.string().min(1),
})
export type templatesToStyles = z.infer<typeof templatesToStylesSchema> & {
    template?: template,
    style?: style
}
