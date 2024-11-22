import { z } from "zod";


export const specificDataForAAABSchema = z.object({
    var1: z.string(),
    forTemplate: z.literal("aaab"),
})
export type specificDataForAAABType = z.infer<typeof specificDataForAAABSchema>