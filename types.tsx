import { z } from "zod";
import { Endpoints } from "@octokit/types";
import { categoryNameSchema, templateDataSchema, templateDataType } from "./types/templateDataTypes";

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

export const sizeOptionsArr = [
    {
        name: "mobile",
        width: 375,
        height: 667,
        active: false,
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M80 0C44.7 0 16 28.7 16 64l0 384c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L80 0zM192 400a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
    },
    {
        name: "tablet",
        width: 768,
        height: 1024,
        active: false,
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM176 432l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" /></svg>
    },
    {
        name: "desktop",
        width: 1920,
        height: 1080,
        active: true,
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l176 0-10.7 32L160 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-69.3 0L336 416l176 0c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0zM512 64l0 224L64 288 64 64l448 0z" /></svg>
    },
]

import Z from "zod"

export const specificationsFormSchema = Z.object({
    "aa": Z.string().min(1, { message: "Business name is required." }),
    "ab": Z.string().min(1, { message: "A business description is required." }),
    "ac": Z.string().min(1, { message: "Target audience description is required." }),
    "ad": Z.string().min(1, { message: "Please specify your core goals for the website." }),
    "ae": Z.string(),
    "af": Z.string(),
    "ag": Z.string().min(1, { message: "The main action is required." }),
    "ah": Z.string().min(1, { message: "Please list the features you need for the website." }),
    "ai": Z.string(),
    "aj": Z.string().min(1, { message: "Branding guidelines check is required." }),
    "ak": Z.string(),
    "al": Z.string().min(1, { message: "Please describe the look and feel you're aiming for." }),
    "am": Z.string(),
    "an": Z.string().min(1, { message: "Please specify if you'll provide the content or need assistance." }),
    "ao": Z.string(),
    "ap": Z.string(),
    "aq": Z.string(),
    "ar": Z.string().min(1, { message: "Please provide an ideal launch date for the website." }),
    "as": Z.string(),
    "at": Z.string().min(1, { message: "Budget range is required." }),
    "au": Z.string().min(1, { message: "Email is required." })
});

export type specificationsObjType = Z.infer<typeof specificationsFormSchema>

export type clientSpecificationKeys = keyof specificationsObjType

export type moreFormInfoType = {
    [key in clientSpecificationKeys]: {
        label?: string,
        placeHolder?: string,
        type?: string,
        required?: boolean
        inputType?: "input" | "textarea"
    }
}

export type pagesType = {
    [key: number]: {
        title?: string,
        questions: clientSpecificationKeys[],
        extraInfo?: JSX.Element,
        hideQuestions?: boolean
    }
}




export const userFormSchema = Z.object({
    name: Z.string().min(1),
    email: Z.string().email(),
    message: Z.string().min(1),
    company: Z.string(),
})

export type userForm = Z.infer<typeof userFormSchema>

























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
    pageId: pageSchema.shape.id
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