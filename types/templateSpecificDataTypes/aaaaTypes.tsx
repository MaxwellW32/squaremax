import { z } from "zod";


// start linked data copy on templates //
export const testimonialSchema = z.array(z.object({
    name: z.string(),
    position: z.string(),
    photo: z.string(),
    text: z.string(),
    rating: z.number(),
    date: z.string(),
    links: z.array(z.string()),
    company: z.string(),
}))

export const linkedDataSchema = z.object({
    siteInfo: z.object({
        phone: z.string(),
        address: z.string(),
        websiteName: z.string().min(1),
        websiteTitle: z.string(),
        websiteDescription: z.string(),
        logo: z.string(),
        opengraphLogo: z.string(),
        email: z.string(),
        workingHours: z.array(z.string()),
        favicon: z.string(),
        copyrightInformation: z.string(),
    }),
    testimonials: testimonialSchema,
    team: z.array(z.object({
        name: z.string(),
        position: z.string(),
        photo: z.string(),
        bio: z.string(),
        links: z.array(z.string()),
        email: z.string(),
        phone: z.string(),
        skills: z.array(z.string()),
        achievements: z.array(z.string()),
    })),
    products: z.array(z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        images: z.array(z.string()),
        sku: z.string(),
        categories: z.array(z.string()),
        tags: z.array(z.string()),
        available: z.boolean(),
        featured: z.boolean(),
        discounts: z.string(),
        ratings: z.number(),
        productTestimonials: testimonialSchema,
    })),
    gallery: z.array(z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        categories: z.array(z.string()),
        tags: z.array(z.string()),
        featured: z.boolean(),
        date: z.string(),
        author: z.string(),
    })),
    services: z.array(z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        icon: z.string(),
        duration: z.string(),
        tags: z.array(z.string()),
        callToAction: z.string(),
        availability: z.string(),
        serviceTestimonials: testimonialSchema,
    })),
    socials: z.array(z.object({
        platform: z.string(),
        url: z.string(),
        icon: z.string(),
        description: z.string(),
    })),
})
export type linkedDataType = z.infer<typeof linkedDataSchema>
// end linked data copy on templates //

//start copy specific data on template//
const inputTypeSchema = z.enum(["textarea", "number"])
export type inputTypeType = z.infer<typeof inputTypeSchema>

const htmlAttributesSchema = z.object({
    style: z.record(z.string()).optional(),
    className: z.string().optional(),
    id: z.string().optional(),
});

const imgHTMLAttributesSchema = htmlAttributesSchema.extend({
    src: z.string().min(1),
    alt: z.string(),
    priority: z.boolean().optional(),
    fill: z.boolean().optional(),
    sizes: z.string().optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
});





// Define the union schema for propsObj
const propsObjSchema = z.union([
    z.object({
        type: z.literal("html"),
        props: htmlAttributesSchema,
        value: z.string(),
        inputType: inputTypeSchema.optional()
    }),
    z.object({
        type: z.literal("img"),
        props: imgHTMLAttributesSchema,
        value: z.literal(""),
    }),
]);

export type propsObjSchemaType = z.infer<typeof propsObjSchema>
export type propsObjType = { type: "html", value: string, props: React.HTMLAttributes<HTMLElement>, inputType?: inputTypeType } | { type: "img", props: React.ImgHTMLAttributes<HTMLImageElement>, value: string }





export const sectionSchema = z.object({
    inputs: z.record(z.string(), propsObjSchema),
    fieldType: z.literal("section"),
    using: z.boolean(),
})
export type sectionType = z.infer<typeof sectionSchema>

export const contactUsComponentSchema = z.object({
    component: z.array(z.object({
        svg: propsObjSchema,
        title: propsObjSchema,
        texts: z.array(propsObjSchema),
    })),
    fieldType: z.literal("contactComponent"),
    using: z.boolean(),
})
export type contactUsComponentType = z.infer<typeof contactUsComponentSchema>

export const pageSection = z.union([sectionSchema, contactUsComponentSchema])





export const specificDataForAAAASchema = z.object({
    pages: z.record(
        z.string(), // page key
        z.record(
            z.string(), // section key
            pageSection
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
    templateId: z.literal("aaaa"),
})
//end copy specific data on template//

export type specificDataForAAAAType = z.infer<typeof specificDataForAAAASchema>


