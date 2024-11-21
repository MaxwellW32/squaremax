import { z } from "zod";

//start copy specific data on template//
// Input Type Schema
const inputTypeSchema = z.object({
    label: z.string().optional(),
    placeHolder: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("input"),
    value: z.string(),
});
export type inputType = z.infer<typeof inputTypeSchema>

// Textarea Type Schema
const textareaTypeSchema = z.object({
    label: z.string().optional(),
    placeHolder: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("textarea"),
    value: z.string(),
});
export type textareaType = z.infer<typeof textareaTypeSchema>

// Image Type Schema
const imageTypeSchema = z.object({
    label: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("image"),
    alt: z.string(),
    value: z.string(),
});
export type imageType = z.infer<typeof imageTypeSchema>

// Video Type Schema
const videoTypeSchema = z.object({
    label: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("video"),
    value: z.string(),
});
export type videoType = z.infer<typeof videoTypeSchema>

// Link Type Schema
const linkTypeSchema = z.object({
    label: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("link"),
    value: z.string(),
});
export type linkType = z.infer<typeof linkTypeSchema>

// Number Type Schema
const numberTypeSchema = z.object({
    label: z.string().optional(),
    placeHolder: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("number"),
    value: z.number(),
});
export type numberType = z.infer<typeof numberTypeSchema>

// Svg Type Schema
const svgTypeSchema = z.object({
    label: z.string().optional(),
    required: z.boolean().optional(),
    fieldType: z.literal("svg"),
    value: z.string(),
});
export type svgType = z.infer<typeof svgTypeSchema>

// Form Input Type (Discriminated Union)
const formInputTypeSchema = z.union([
    inputTypeSchema,
    textareaTypeSchema,
    imageTypeSchema,
    videoTypeSchema,
    linkTypeSchema,
    numberTypeSchema,
    svgTypeSchema
]);
export type formInputType = z.infer<typeof formInputTypeSchema>

//section type 
const sectionTypeSchema = z.object({
    label: z.string(),

    inputs: z.record(
        z.string(), // key for each input
        formInputTypeSchema
    ),

    using: z.boolean(),
    fieldType: z.literal("section").optional(),
})
export type sectionType = z.infer<typeof sectionTypeSchema>

//only for contact component
const contactComponentTypeSchema = z.object({ //section 
    label: z.string(),

    component: z.array(z.object({
        svg: formInputTypeSchema,
        title: formInputTypeSchema,
        texts: z.array(formInputTypeSchema)
    })),

    using: z.boolean(),
    fieldType: z.literal("contactComponent"),
})
export type contactComponentType = z.infer<typeof contactComponentTypeSchema>

const pageSectionUnionSchema = z.union([
    sectionTypeSchema,
    contactComponentTypeSchema
]);


export const specificDataForAAAASchema = z.object({
    pages: z.record(
        z.string(), // key for each page
        z.record(
            z.string(), // key for each section or component
            pageSectionUnionSchema
        )
    ),
    navLinks: z.object({
        header: z.array(
            z.object({
                title: z.string(),
                link: z.string()
            })
        ),
        footer: z.array(
            z.object({
                title: z.string(),
                link: z.string()
            })
        )
    }),
    colors: z.record(
        z.string(),
        z.record(
            z.string(),
            z.string()
        )
    ),
    forTemplate: z.literal("aaaa"),
})
//end copy specific data on template//

export type specificDataForAAAAType = z.infer<typeof specificDataForAAAASchema>


