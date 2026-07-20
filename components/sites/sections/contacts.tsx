import React from "react"
import { ContactData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"
import TenantMessageForm from "@/components/sites/islands/TenantMessageForm"

//variant: contact.split — details left, message form right
export function ContactSplit({ data, ctx }: SectionProps<ContactData>) {
    const business = ctx.business

    return (
        <section id="contact" className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)] md:grid-cols-2">
                <div className="grid content-start gap-[var(--t-space)]">
                    <h2
                        className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {data.heading}
                    </h2>

                    {data.blurb !== "" && <p className="text-[var(--t-text-muted)]">{data.blurb}</p>}

                    {data.showDetails && (
                        <ul className="grid gap-2 text-[length:var(--t-text-m)] text-[var(--t-text)]">
                            {business.phone !== "" && (
                                <li><a className="hover:text-[var(--t-primary)]" href={`tel:${business.phone}`}>📞 {business.phone}</a></li>
                            )}
                            {business.whatsapp !== "" && (
                                <li>
                                    <a className="hover:text-[var(--t-primary)]" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                                        💬 WhatsApp us
                                    </a>
                                </li>
                            )}
                            {business.email !== "" && (
                                <li><a className="hover:text-[var(--t-primary)]" href={`mailto:${business.email}`}>✉️ {business.email}</a></li>
                            )}
                            {business.address !== "" && (
                                <li>
                                    <a
                                        className="hover:text-[var(--t-primary)]"
                                        href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        📍 {business.address}
                                    </a>
                                </li>
                            )}
                        </ul>
                    )}

                    {data.showDetails && business.socials.length > 0 && (
                        <ul className="flex flex-wrap gap-3 text-[length:var(--t-text-s)]">
                            {business.socials.map(social => (
                                <li key={social.url}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-[var(--t-radius)] px-3 py-1.5 font-semibold capitalize"
                                        style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                                    >
                                        {social.platform}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {data.showMessageForm && (
                    <TenantMessageForm slug={ctx.slug} preview={ctx.preview === true} notify={ctx.enabledAddons.includes("notifications")} />
                )}
            </div>
        </section>
    )
}
