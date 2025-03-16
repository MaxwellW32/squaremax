import { z } from "zod";
import { Endpoints } from "@octokit/types";

// regular types
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
    builtTemplate: React.ComponentType<{ data: templateDataType }> | null
}

export type previewTemplateType = {
    template: template,
    builtTemplate: React.ComponentType<{ data: templateDataType }>
    location: usedComponentLocationType,
    orderPosition: number,
}

export type handleManagePageOptions =
    {
        option: "create",
        seenAddedPage: page,
    } | {
        option: "update",
        seenUpdatedPage: updatePage,
        updatedPageId: page["id"],
    }

export type handleManageUpdateUsedComponentsOptions =
    {
        option: "create",
        seenAddedUsedComponent: usedComponent,

    } | {
        option: "update",
        seenUpdatedUsedComponent: Partial<updateUsedComponent>,
        updatedUsedComponentId: usedComponent["id"],
        rebuild?: boolean
    }

export const requestDownloadWebsiteBodySchema = z.object({
    websiteId: z.string().min(1),
    downloadOption: z.enum(["github", "zip"])
});
export type requestDownloadWebsiteBodyType = z.infer<typeof requestDownloadWebsiteBodySchema>

//recursive form
//basically controlling the look of an element and the data validation
export type recursiveFormMoreFormInfoElementType =
    {
        type: "input",
        isNumeric?: true,
        isFloat?: true,
    } | {
        type: "textarea",
    } | {
        type: "color",
    } | {
        type: "file"
    } | {
        type: "image",
    }
export type recursiveFormMoreInfo = {
    [key: string]: {
        label?: string,
        placeholder?: string,
        element?: recursiveFormMoreFormInfoElementType,
        returnToNull?: true,
        returnToUndefined?: true,
    }
}
export type recursiveFormArrayStarterItems = {
    [key: string]: unknown
}
export type nullishStarters = {
    [key: string]: unknown
}

export const wsWebsiteUpdateSchema = z.object({
    type: z.literal("website"),
});
export type wsWebsiteUpdateType = z.infer<typeof wsWebsiteUpdateSchema>

export const wsPageUpdateSchema = z.object({
    type: z.literal("page"),
    pageId: z.string().min(1),
    refresh: z.boolean()
});
export type wsPageUpdateType = z.infer<typeof wsPageUpdateSchema>

export const wsUsedComponentUpdateSchema = z.object({
    type: z.literal("usedComponent"),
    usedComponentId: z.string().min(1),
    refresh: z.boolean() //wait till user not editing to refresh
});
export type wsUsedComponentUpdateType = z.infer<typeof wsUsedComponentUpdateSchema>

export const weWsUpdatedUnionSchema = z.union([wsWebsiteUpdateSchema, wsPageUpdateSchema, wsUsedComponentUpdateSchema])
export type weWsUpdatedUnionType = z.infer<typeof weWsUpdatedUnionSchema>

export const webSocketStandardMessageSchema = z.object({
    type: z.literal("standard"),
    data: z.object({
        websiteId: z.string(),
        updated: weWsUpdatedUnionSchema
    })
});
export type webSocketStandardMessageType = z.infer<typeof webSocketStandardMessageSchema>

export const webSocketMessageJoinSchema = z.object({
    type: z.literal("join"),
    websiteId: z.string(),
});
export type webSocketMessageJoinType = z.infer<typeof webSocketMessageJoinSchema>

export const webSocketMessagePingSchema = z.object({
    type: z.literal("ping"),
});
export type webSocketMessagePingType = z.infer<typeof webSocketMessagePingSchema>

export const webSocketMessageSchema = z.union([webSocketStandardMessageSchema, webSocketMessageJoinSchema, webSocketMessagePingSchema])
export type webSocketMessageType = z.infer<typeof webSocketMessageSchema>

export type EditingContentType = {
    website: boolean;
    pages: boolean;
    usedComponents: boolean;
};

export const otherSelctionOptionsArr = ["name", "family", "id", "recentlyViewed"] as const
export type otherSelctionOptionsType = typeof otherSelctionOptionsArr[number]
export type activeSelectionType = category["name"] | otherSelctionOptionsType

export const templateFilterOptions = ["popular", "mostLiked"] as const
export type templateFilterOptionType = typeof templateFilterOptions[number]










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
export const githubTokenSchema = z.object({
    id: z.string().min(1),
    username: z.string().min(1),
    token: z.string().min(1),
    active: z.boolean(),
})
export type githubTokenType = z.infer<typeof githubTokenSchema>

export const newGithubTokenSchema = githubTokenSchema.omit({ id: true, username: true })
export type newGithubTokenType = z.infer<typeof newGithubTokenSchema>

export const updateGithubTokenSchema = githubTokenSchema.omit({ id: true })
export type updateGithubTokenType = z.infer<typeof updateGithubTokenSchema>

//keep synced with db schema
export const userRoleSchema = z.enum(["admin"])

export const userSchema = z.object({
    id: z.string().min(1),
    userGithubTokens: z.array(githubTokenSchema),
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
    subsets: z.array(z.string().min(1, "need subsets: e.g latin")),
    weights: z.array(z.string().min(1, "please add a number or make the array null")).nullable()
})
export type fontsType = z.infer<typeof fontsSchema>

export const userUploadedImagesSchema = z.array(z.string())
export type userUploadedImagesType = z.infer<typeof userUploadedImagesSchema>

export const authorisedUserSchema = z.object({
    userId: z.string(),
    accessLevel: z.enum(["view", "edit"])
})
export type authorisedUserType = z.infer<typeof authorisedUserSchema>

export const websiteSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    fonts: z.array(fontsSchema),
    globalCss: z.string(),
    userUploadedImages: userUploadedImagesSchema,
    authorisedUsers: z.array(authorisedUserSchema),
})
export type website = z.infer<typeof websiteSchema> & {
    fromUser?: user,
    pages?: page[],
    usedComponents?: usedComponent[],
}
export const newWebsiteSchema = websiteSchema.omit({ id: true, userId: true, fonts: true, globalCss: true, userUploadedImages: true, authorisedUsers: true, title: true, description: true })
export type newWebsite = z.infer<typeof newWebsiteSchema>

export const updateWebsiteSchema = websiteSchema.omit({ id: true, userId: true, })
export type updateWebsite = z.infer<typeof updateWebsiteSchema>





export const pageSchema = z.object({
    id: z.string().min(1),
    link: z.string().min(1),
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
    uses: z.number(),
    likes: z.number(),
    categoryId: z.string().min(1),
    defaultCss: z.string(),
    defaultData: templateDataSchema,
})
export type template = z.infer<typeof templatesSchema> & {
    templatesToStyles?: templatesToStyles[],
    usedComponents?: usedComponent[],
    category?: category,
}
export const newTemplateSchema = templatesSchema.omit({ id: true, uses: true, likes: true })
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
