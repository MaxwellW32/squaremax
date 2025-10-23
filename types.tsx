import { z } from "zod";
import { Endpoints } from "@octokit/types";
import React from "react"

//group like types
//close relation - no space
//basic relation - 1 space
//no relation but grouped - 5 spaces
//large gap - 20 spaces
//entire different concept - 50 spaces


//download website
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



//filters
export type PgTableWithColumns<T extends TableConfig> = PgTable<T> & {
    [Key in keyof T['columns']]: T['columns'][Key];
} & {
    enableRLS: () => Omit<PgTableWithColumns<T>, 'enableRLS'>;
};




//size options
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
// const collectionSchema = z.object({
//     relativePath: z.string().min(1),
//     content: z.string().min(1),
// })
// export type collection = z.infer<typeof collectionSchema>

// export type viewerTemplateType = {
//     usedComponentIdToSwap: usedComponentType["id"],
//     template: templateType | null,
//     builtTemplate: React.ComponentType<{ data: templateDataType }> | null
// }

// export type previewTemplateType = {
//     template: templateType,
//     builtTemplate: React.ComponentType<{ data: templateDataType }>
//     location: usedComponentLocationType,
//     orderPosition: number,
// }
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




//websockets
// export const wsWebsiteUpdateSchema = z.object({
//     type: z.literal("website"),
// });
// export type wsWebsiteUpdateType = z.infer<typeof wsWebsiteUpdateSchema>

// export const wsPageUpdateSchema = z.object({
//     type: z.literal("page"),
//     pageId: z.string().min(1),
//     refresh: z.boolean()
// });
// export type wsPageUpdateType = z.infer<typeof wsPageUpdateSchema>

// export const wsUsedComponentUpdateSchema = z.object({
//     type: z.literal("usedComponent"),
//     usedComponentId: z.string().min(1),
//     refresh: z.boolean() //wait till user not editing to refresh
// });
// export type wsUsedComponentUpdateType = z.infer<typeof wsUsedComponentUpdateSchema>

// export const weWsUpdatedUnionSchema = z.union([wsWebsiteUpdateSchema, wsPageUpdateSchema, wsUsedComponentUpdateSchema])
// export type weWsUpdatedUnionType = z.infer<typeof weWsUpdatedUnionSchema>

// export const webSocketStandardMessageSchema = z.object({
//     type: z.literal("standard"),
//     data: z.object({
//         websiteId: z.string(),
//         updated: weWsUpdatedUnionSchema
//     })
// });
// export type webSocketStandardMessageType = z.infer<typeof webSocketStandardMessageSchema>

// export const webSocketMessageJoinSchema = z.object({
//     type: z.literal("join"),
//     websiteId: z.string(),
// });
// export type webSocketMessageJoinType = z.infer<typeof webSocketMessageJoinSchema>

// export const webSocketMessagePingSchema = z.object({
//     type: z.literal("ping"),
// });
// export type webSocketMessagePingType = z.infer<typeof webSocketMessagePingSchema>

// export const webSocketMessageSchema = z.union([webSocketStandardMessageSchema, webSocketMessageJoinSchema, webSocketMessagePingSchema])
// export type webSocketMessageType = z.infer<typeof webSocketMessageSchema>


//note which option is being updated
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

export const dateSchema = z.preprocess((val) => {
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
    websites?: websiteType[]
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
    dateAdded: dateSchema,
    title: z.string().min(1),
    description: z.string(),
    fonts: z.array(fontsSchema),
    globalCss: z.string(),
    userUploadedImages: userUploadedImagesSchema,
    authorisedUsers: z.array(authorisedUserSchema),

    name: z.string().min(1),
    userId: z.string().min(1),
})
export type websiteType = z.infer<typeof websiteSchema> & {
    fromUser?: userType,
    pages?: pageType[],
    usedComponents?: usedComponentType[],
}
export const newWebsiteSchema = websiteSchema.omit({ id: true, dateAdded: true, title: true, description: true, fonts: true, globalCss: true, userUploadedImages: true, authorisedUsers: true, })
export type newWebsiteType = z.infer<typeof newWebsiteSchema>

export const updateWebsiteSchema = websiteSchema.omit({ id: true, userId: true, })
export type updateWebsiteType = z.infer<typeof updateWebsiteSchema>





export const pageSchema = z.object({
    id: z.string().min(1),

    link: z.string().min(1),
    websiteId: z.string().min(1),
})
export type pageType = z.infer<typeof pageSchema> & {
    fromWebsite?: websiteType
}

export const newPageSchema = pageSchema.omit({ id: true })
export type newPageType = z.infer<typeof newPageSchema>

export const updatePageSchema = pageSchema.omit({ id: true, websiteId: true })
export type updatePageType = z.infer<typeof updatePageSchema>




export const templateCategoryNameOptions = ["heros", "navbars", "containers"] as const
export const templateCategoryNameSchema = z.enum(templateCategoryNameOptions)
export type templateCategoryNameType = z.infer<typeof templateCategoryNameSchema>

const herosTemplateSchema = z.object({
    category: z.literal(templateCategoryNameSchema.Enum.heros),
    data: z.object({
        title: z.string(),
        text: z.string()
    })
})
const navbarsTemplateSchema = z.object({
    category: z.literal(templateCategoryNameSchema.Enum.navbars),
    data: z.object({
        navItem: z.string(),
        menuItem: z.string(),
        subMenu: z.string().array(),
    })
})
const containersTemplateSchema = z.object({
    category: z.literal(templateCategoryNameSchema.Enum.containers),
    data: z.object({
        title: z.string(),
    })
})
const templateTypeSchema = z.union([herosTemplateSchema, navbarsTemplateSchema, containersTemplateSchema])
export type templateTypeType = z.infer<typeof templateTypeSchema>


const htmlBaseAttributeSchema = z.object({
    style: z.record(z.string()).optional(),
    className: z.string().optional(),
    id: z.string().optional(),
});

const pElementSchema = z.object({
    tag: z.literal("p"),
    props: htmlBaseAttributeSchema
})
const h1ElementSchema = z.object({
    tag: z.literal("h1"),
    props: htmlBaseAttributeSchema
})
const divElementSchema = z.object({
    tag: z.literal("div"),
    props: htmlBaseAttributeSchema
})
const elementTypeSchema = z.union([pElementSchema, h1ElementSchema, divElementSchema])



const elementIdChildSchema = z.object({
    type: z.literal("elementId"),
    elementId: z.string().min(1),
})
const textChildSchema = z.object({
    type: z.literal("text"),
    content: z.string(),
})
const componentChildSchema = z.object({
    type: z.literal("component"),
    componentIndex: z.number(),
})
const elementChildrenSchema = z.union([elementIdChildSchema, textChildSchema, componentChildSchema])

const elementSchema = z.object({
    id: z.string().min(1),
    type: elementTypeSchema,
    children: elementChildrenSchema.array()
})
export type elementType = z.infer<typeof elementSchema>


export const templatesSchema = z.object({
    id: z.string().min(1),

    categoryId: z.string().min(1),
    name: z.string().min(1),
    type: templateTypeSchema,
    elements: elementSchema.array(),
    uses: z.number(),
    likes: z.number(),
})
export type templateType = z.infer<typeof templatesSchema> & {
    templatesToStyles?: templateToStyleType[],
    usedComponents?: usedComponentType[],
    category?: categoryType,
}
export const newTemplateSchema = templatesSchema.omit({ id: true, uses: true, likes: true })
export type newTemplateType = z.infer<typeof newTemplateSchema>




export const headerLocationSchema = z.object({
    type: z.literal("header"),
})
export type headerLocationType = z.infer<typeof headerLocationSchema>

export const footerLocationSchema = z.object({
    type: z.literal("footer"),
})
export type footerLocationType = z.infer<typeof footerLocationSchema>

export const pageLocationSchema = z.object({
    type: z.literal("page"),
    pageId: pageSchema.shape.id
})
export type pageLocationType = z.infer<typeof pageLocationSchema>
pageLocationSchema
export const childLocationSchema = z.object({
    type: z.literal("child"),
    parentId: z.string().min(1)
})
export type childLocationType = z.infer<typeof childLocationSchema>

export const usedComponentLocationSchema = z.union([headerLocationSchema, footerLocationSchema, pageLocationSchema, childLocationSchema])
export type usedComponentLocationType = z.infer<typeof usedComponentLocationSchema>

export const usedComponentSchema = z.object({
    id: z.string().min(1),

    websiteId: z.string().min(1),
    templateId: z.string().min(1),
    type: templateTypeSchema,
    elements: elementSchema.array(),
    location: usedComponentLocationSchema,
    order: z.number(),
    showMultiple: z.boolean(),
})
export type usedComponentType = z.infer<typeof usedComponentSchema> & {
    fromWebsite?: websiteType,
    template?: templateType,
};

export const newUsedComponentSchema = usedComponentSchema.omit({ id: true })
export type newUsedComponentType = z.infer<typeof newUsedComponentSchema>

export const updateUsedComponentSchema = usedComponentSchema.omit({ id: true, websiteId: true })
export type updateUsedComponentType = z.infer<typeof updateUsedComponentSchema>




export const categoriesSchema = z.object({
    id: z.string().min(1),
    name: templateCategoryNameSchema,
})
export type categoryType = z.infer<typeof categoriesSchema> & {
    templates?: templateType[]
}




export const stylesSchema = z.object({
    id: z.string().min(1),
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