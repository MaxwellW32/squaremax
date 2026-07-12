import { z } from "zod"
import { serviceIdSchema } from "./catalog"

//shared client/server shape for the custom-builds intake form
export const intakeSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.email(),
    businessName: z.string().min(1).max(160),
    currentSite: z.string().max(300).optional().or(z.literal("")),
    notes: z.string().max(5000).optional().or(z.literal("")),
    services: serviceIdSchema.array().min(1),
})
export type IntakeInput = z.infer<typeof intakeSchema>
