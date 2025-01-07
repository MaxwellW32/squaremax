import { z } from "zod";
import { Endpoints } from "@octokit/types";
import React from "react";

// import { LinkProps } from "next/link";
// const inputTypeSchema = z.enum(["textarea", "number"])
// export type inputTypeType = z.infer<typeof inputTypeSchema>

// const htmlAttributesSchema = z.object({
//     style: z.record(z.string()).optional(),
//     className: z.string().optional(),
//     id: z.string().optional(),
// });
// export type htmlAttributesType = z.infer<typeof htmlAttributesSchema>

// const imgHTMLAttributesSchema: z.ZodType<React.ImgHTMLAttributes<HTMLImageElement>> = htmlAttributesSchema.extend({
//     src: z.string().min(1),
//     alt: z.string(),
//     priority: z.boolean().optional(),
//     fill: z.boolean().optional(),
//     sizes: z.string().optional(),
//     width: z.union([z.number(), z.string()]).optional(),
//     height: z.union([z.number(), z.string()]).optional(),
// });

// const linkHTMLAttributesSchema: z.ZodType<LinkProps> = htmlAttributesSchema.extend({
//     href: z.string().min(1),
//     target: z.string().optional(),
// });

// // Define the union schema for propsObj
// const propsObjSchema = z.union([
//     z.object({
//         type: z.literal("html"),
//         props: htmlAttributesSchema,
//         value: z.string(),
//         inputType: inputTypeSchema.optional()
//     }),
//     z.object({
//         type: z.literal("img"),
//         props: imgHTMLAttributesSchema,
//         value: z.literal(""),
//     }),
//     z.object({
//         type: z.literal("link"),
//         props: linkHTMLAttributesSchema,
//         value: z.string(),
//     }),
// ]);

// export type propsObjSchemaType = z.infer<typeof propsObjSchema>
// export const reactComponentTypeSchema = z.custom<React.ComponentType<{ data: componentDataType }>>((value) => {
//     return (
//         typeof value === "function" || // Functional component or class component
//         (typeof value === "object" && value !== null && "$$typeof" in value)
//     );
// },
//     { message: "Value must be a React ComponentType" }
// );

export const reactElementSchema = z.custom<React.ReactElement>(
    e => (e as any)?.$$typeof === Symbol.for("react.element"),
    "value must be a React Element"
);

export type sizeOptionType = {
    name: string,
    width: number,
    height: number,
    active: boolean,
    icon: JSX.Element
}





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
    menu: z.array(navMenuItem),
})
export type navBarsType = z.infer<typeof navBarsSchema>





export const herosSchema = z.object({
    category: z.literal("heros")
})
export type herosType = z.infer<typeof herosSchema>





export const containersSchema = z.object({
    category: z.literal("containers"),
    children: z.array(z.any()),
})
export type containersType = z.infer<typeof containersSchema>





export const textElementsSchema = z.object({
    category: z.literal("textElements")
})
export type textElementsType = z.infer<typeof textElementsSchema>





export const componentDataSchema = z.union([navBarsSchema, herosSchema, containersSchema, textElementsSchema])
export type componentDataType = z.infer<typeof componentDataSchema>




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
    defaultCss: z.string()
})
export type component = z.infer<typeof componentSchema> & {
    componentsToStyles?: componentsToStyle[],
    pagesToComponents?: pagesToComponent[],
    category?: category,
}




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






