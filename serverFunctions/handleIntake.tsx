"use server"
import { computeQuote, servicesById, tiersById, usd } from "@/lib/pricing/catalog"
import { intakeSchema, IntakeInput } from "@/lib/pricing/intake"
import { sendNodeEmail } from "./handleNodeEmails"

//custom builds intake: quote is recomputed server-side from service ids —
//never trust totals sent by the client.
//TODO(phase 5): persist submissions to DB alongside the email.
export async function submitIntake(input: IntakeInput) {
    const validated = intakeSchema.parse(input)
    const quote = computeQuote(validated.services)
    const tier = tiersById[quote.tierId]

    const lines = quote.selected.map(id => `  - ${servicesById[id].label} (${usd.format(servicesById[id].price)})`).join("\n")

    await sendNodeEmail({
        replyTo: validated.email,
        subject: `Build intake: ${validated.businessName} — ${tier.name} ${usd.format(tier.price)}`,
        text: `New Custom Build intake

Name: ${validated.name}
Email: ${validated.email}
Business: ${validated.businessName}
Current site: ${validated.currentSite || "none"}

Tier: ${tier.name} — ${usd.format(tier.price)} flat (itemized ${usd.format(quote.subtotal)}, discount ${usd.format(quote.discount)})

Selected services:
${lines}

Notes:
${validated.notes || "none"}
`,
    })

    return { tierId: quote.tierId, tierPrice: quote.tierPrice }
}
