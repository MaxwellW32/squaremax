
import { z } from "zod";

//start copy here
const reusableHtmlAttributesSchema = z.object({
    style: z.record(z.string()).optional(),
    className: z.string().optional(),
    id: z.string().optional(),
});
export type reusableHtmlAttributesType = z.infer<typeof reusableHtmlAttributesSchema>

const reusableChildrenPropSchema = z.any()
export type reusableChildrenPropType = z.infer<typeof reusableChildrenPropSchema>

const reusableLinkSchema = z.object({
    title: z.string().min(1).nullable(),
    url: z.string().min(1),
    target: z.string().min(1).nullable(),
});
export type reusableLinkType = z.infer<typeof reusableLinkSchema>

const reusableImageSchema = z.object({
    src: z.string().min(1), //display the image
    alt: z.string().min(1),
    priority: z.boolean().nullable(),
    size: z.union([
        z.object({
            type: z.literal("noFill"),
            width: z.number(),
            height: z.number(),
        }),
        z.object({
            type: z.literal("fill"),
            fill: z.boolean(),
            sizes: z.string(),
        }),
    ]),
    link: reusableLinkSchema.nullable()
});
export type reusableImageType = z.infer<typeof reusableImageSchema>

const reusableContactInfoSchema = z.object({//phone, address
    title: z.string().min(1),
    link: reusableLinkSchema.nullable(),
    image: reusableImageSchema.nullable(),
});
export type reusableContactInfoType = z.infer<typeof reusableContactInfoSchema>

const reusableSocialMediaSchema = z.object({//whatsapp
    title: z.string().min(1).nullable(),
    link: reusableLinkSchema,
    image: reusableImageSchema,
});
export type reusableSocialMediaType = z.infer<typeof reusableSocialMediaSchema>



















export const categoryNameSchema = z.enum(["navbars", "heros", "containers"])
export type categoryName = z.infer<typeof categoryNameSchema>


type navMenuBaseType = {
    title: string,
    link: reusableLinkType,
    subMenu: navMenuBaseType
}[]
const navBarMenuSchema: z.ZodType<navMenuBaseType> = z.array(z.lazy(() => z.object({
    title: z.string().min(1),
    link: reusableLinkSchema,
    subMenu: navBarMenuSchema,
})))
export type navBarMenuType = z.infer<typeof navBarMenuSchema>

export const navBarsDataSchema = z.object({
    category: z.literal(categoryNameSchema.enum.navbars),
    mainElProps: reusableHtmlAttributesSchema,
    menu: navBarMenuSchema,
    styleId: z.string(),
    logos: z.array(reusableImageSchema),
    children: reusableChildrenPropSchema,
    contactInfo: z.array(reusableContactInfoSchema),
    socialMedia: z.array(reusableSocialMediaSchema),
    supportingImages: z.array(reusableImageSchema),
})
export type navBarsDataType = z.infer<typeof navBarsDataSchema>

export const updateNavBarsDataSchema = navBarsDataSchema.omit({ category: true, mainElProps: true, styleId: true, children: true, })
export type updateNavBarsDataType = z.infer<typeof updateNavBarsDataSchema>





export const herosDataSchema = z.object({
    category: z.literal(categoryNameSchema.enum.heros),
    mainElProps: reusableHtmlAttributesSchema,
    styleId: z.string(),
})
export type herosDataType = z.infer<typeof herosDataSchema>





export const containersDataSchema = z.object({
    category: z.literal(categoryNameSchema.enum.containers),
    mainElProps: reusableHtmlAttributesSchema,
    styleId: z.string(),

    children: reusableChildrenPropSchema, //react element
})
export type containersDataType = z.infer<typeof containersDataSchema>





export const textElementsDataSchema = z.object({
    category: z.literal("textElements"),
    mainElProps: reusableHtmlAttributesSchema,
    styleId: z.string(),
})
export type textElementsDataType = z.infer<typeof textElementsDataSchema>





export const templateDataSchema = z.union([navBarsDataSchema, herosDataSchema, containersDataSchema, textElementsDataSchema])
export type templateDataType = z.infer<typeof templateDataSchema>
// end copy here

