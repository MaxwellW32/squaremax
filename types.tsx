import { z } from "zod";
import { Endpoints } from "@octokit/types";
import { categoryNameSchema, templateDataSchema, templateDataType } from "./types/templateDataTypes";
import React, { HTMLAttributes } from "react"

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
    iconName: string
}
export const sizeOptionsArr: sizeOptionType[] = [
    {
        name: "mobile",
        width: 375,
        height: 667,
        active: false,
        iconName: "mobile"
    },
    {
        name: "tablet",
        width: 768,
        height: 1024,
        active: false,
        iconName: "tablet"

    },
    {
        name: "desktop",
        width: 1920,
        height: 1080,
        active: true,
        iconName: "desktop_mac"
    },
]



const collectionSchema = z.object({
    relativePath: z.string().min(1),
    content: z.string().min(1),
})
export type collection = z.infer<typeof collectionSchema>

export type viewerTemplateType = {
    usedComponentIdToSwap: usedComponentType["id"],
    template: templateType | null,
    builtTemplate: React.ComponentType<{ data: templateDataType }> | null
}

export type previewTemplateType = {
    template: templateType,
    builtTemplate: React.ComponentType<{ data: templateDataType }>
    location: usedComponentLocationType,
    orderPosition: number,
}

export type handleManagePageOptions =
    {
        option: "create",
        seenAddedPage: pageType,
    } | {
        option: "update",
        seenUpdatedPage: updatePageType,
        updatedPageId: pageType["id"],
    }

export type handleManageUpdateUsedComponentsOptions =
    {
        option: "create",
        seenAddedUsedComponent: usedComponentType,

    } | {
        option: "update",
        seenUpdatedUsedComponent: Partial<updateUsedComponentType>,
        updatedUsedComponentId: usedComponentType["id"],
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
export type activeSelectionType = categoryType["name"] | otherSelctionOptionsType

export const templateFilterOptions = ["popular", "mostLiked"] as const
export type templateFilterOptionType = typeof templateFilterOptions[number]

export const specificationsFormSchema = z.object({
    "aa": z.string().min(1, { message: "Business name is required." }),
    "ab": z.string().min(1, { message: "A business description is required." }),
    "ac": z.string().min(1, { message: "Target audience description is required." }),
    "ad": z.string().min(1, { message: "Please specify your core goals for the website." }),
    "ae": z.string(),
    "af": z.string(),
    "ag": z.string().min(1, { message: "The main action is required." }),
    "ah": z.string().min(1, { message: "Please list the features you need for the website." }),
    "ai": z.string(),
    "aj": z.string().min(1, { message: "Branding guidelines check is required." }),
    "ak": z.string(),
    "al": z.string().min(1, { message: "Please describe the look and feel you're aiming for." }),
    "am": z.string(),
    "an": z.string().min(1, { message: "Please specify if you'll provide the content or need assistance." }),
    "ao": z.string(),
    "ap": z.string(),
    "aq": z.string(),
    "ar": z.string().min(1, { message: "Please provide an ideal launch date for the website." }),
    "as": z.string(),
    "at": z.string().min(1, { message: "Budget range is required." }),
    "au": z.string().min(1, { message: "Email is required." })
});

export type specificationsObjType = z.infer<typeof specificationsFormSchema>

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
        extraInfo?: React.JSX.Element,
        hideQuestions?: boolean
    }
}

export const dateSchma = z.preprocess((val) => {
    if (typeof val === "string" || typeof val === "number") return new Date(val);
    return val;
}, z.date())

export const userFormSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    message: z.string().min(1),
    company: z.string(),
})

export type userForm = z.infer<typeof userFormSchema>

//handle search
export type tableFilterTypes<T> = {
    [key in keyof T]?: T[key]
}

export type searchObjType<T> = {
    searchItems: T[],
    loading?: true,
    limit?: number, //how many
    offset?: number, //increaser
    incrementOffsetBy?: number, //how much to increase by
    refreshAll?: boolean
}
























//database types
export type componentType = {
    id: string,
    type: {
        category: "heros",
        data: {
            title: string,
            text: string
        }
    } | {
        category: "navbars",
        data: {
            navItem: string,
            menuItem: string,
            subMenu: string[]
        }
    } | {
        category: "containers",
        data: {
            title: string
        }
    },
    elements: elementType[],
    childComponents: string[],
    showMultiple?: true
}

export type elementType = {
    id: string;
    type:
    | { tag: "p"; props: HTMLAttributes<HTMLParagraphElement> }
    | { tag: "h1"; props: HTMLAttributes<HTMLHeadingElement> }
    | { tag: "div"; props: HTMLAttributes<HTMLDivElement> };
    children: elementChildType[];
};

export type elementChildType =
    | { type: "elementId"; elementId: string } // references another element
    | { type: "text"; content: string } // plain text
    | { type: "component", componentIndex: number } // references another component


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

//refresh db on change
export const roleOptions = ["admin"] as const
export const roleSchema = z.enum(roleOptions)
export type roleType = z.infer<typeof roleSchema>

export const userSchema = z.object({
    id: z.string().min(1),
    userGithubTokens: z.array(githubTokenSchema),
    role: roleSchema.nullable(),
    name: z.string().nullable(),
    image: z.string().min(1).nullable(),
    email: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
})
export type userType = z.infer<typeof userSchema> & {
    websites?: websitetype[]
}

export const updateUserSchema = userSchema.omit({ role: true, email: true, emailVerified: true })
export type updateUserType = z.infer<typeof updateUserSchema>




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
    dateAdded: dateSchma,
})
export type websitetype = z.infer<typeof websiteSchema> & {
    fromUser?: userType,
    pages?: pageType[],
    usedComponents?: usedComponentType[],
}
export const newWebsiteSchema = websiteSchema.omit({ id: true, userId: true, fonts: true, globalCss: true, userUploadedImages: true, authorisedUsers: true, title: true, description: true, dateAdded: true })
export type newWebsiteType = z.infer<typeof newWebsiteSchema>

export const updateWebsiteSchema = websiteSchema.omit({ id: true, userId: true, })
export type updateWebsiteType = z.infer<typeof updateWebsiteSchema>





export const pageSchema = z.object({
    id: z.string().min(1),
    link: z.string().min(1),
    websiteId: z.string().min(1),
})
export type pageType = z.infer<typeof pageSchema> & {
    fromWebsite?: websitetype
}

export const newPageSchema = pageSchema.omit({ id: true })
export type newPageType = z.infer<typeof newPageSchema>

export const updatePageSchema = pageSchema.omit({ id: true, websiteId: true })
export type updatePageType = z.infer<typeof updatePageSchema>




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
export type usedComponentType = z.infer<typeof usedComponentSchema> & {
    fromWebsite?: websitetype,
    template?: templateType,
};

export const newUsedComponentSchema = usedComponentSchema.omit({ id: true })
export type newUsedComponentType = z.infer<typeof newUsedComponentSchema>

export const updateUsedComponentSchema = usedComponentSchema.omit({ id: true, websiteId: true })
export type updateUsedComponentType = z.infer<typeof updateUsedComponentSchema>




export const templatesSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    uses: z.number(),
    likes: z.number(),
    categoryId: z.string().min(1),
    defaultCss: z.string(),
    defaultData: templateDataSchema,
})
export type templateType = z.infer<typeof templatesSchema> & {
    templatesToStyles?: templateToStyleType[],
    usedComponents?: usedComponentType[],
    category?: categoryType,
}
export const newTemplateSchema = templatesSchema.omit({ id: true, uses: true, likes: true })
export type newTemplateType = z.infer<typeof newTemplateSchema>




export const categoriesSchema = z.object({
    name: categoryNameSchema,
})
export type categoryType = z.infer<typeof categoriesSchema> & {
    templates?: templateType[]
}




export const stylesSchema = z.object({
    name: z.string().min(1),
})
export type styleType = z.infer<typeof stylesSchema> & {
    templatesToStyles?: templateToStyleType[]
}




export const templatesToStylesSchema = z.object({
    templateId: z.string().min(1),
    styleName: z.string().min(1),
})
export type templateToStyleType = z.infer<typeof templatesToStylesSchema> & {
    template?: templateType,
    style?: styleType
}