import { z } from "zod";

//start copy specific data on template//

//components
export const introSchema = z.object({
    using: z.boolean()
})
export type introType = z.infer<typeof introSchema>

export const contactSchema = z.object({
    contacts: z.array(z.object({
        svg: z.string(),
        title: z.string(),
        texts: z.array(z.string()),
    })),
    using: z.boolean()
})
export type contactType = z.infer<typeof contactSchema>
//end components


export const specificDataForAAAASchema = z.object({
    templateId: z.literal("aaaa"),
    components: z.object({
        intro: introSchema,
        contact: contactSchema,
    }),
    nav: z.object({
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
})
//end copy specific data on template//

export type specificDataForAAAAType = z.infer<typeof specificDataForAAAASchema>


