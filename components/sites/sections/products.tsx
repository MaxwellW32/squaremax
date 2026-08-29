import React from "react"
import { ProductsData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

//variant: products.grid — storefront for the inventory add-on. Products come
//from the tenant's product table (ctx.products, loaded server-side); this
//instance's data controls heading/blurb and how customers order.
export function ProductsGrid({ data, ctx }: SectionProps<ProductsData>) {
    if (!ctx.enabledAddons.includes("inventory")) return null
    const products = ctx.products ?? []
    if (products.length === 0) return null

    const whatsappDigits = ctx.business.whatsapp.replace(/\D/g, "")

    return (
        <section id="shop" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <div className="grid gap-2">
                    <h2
                        className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {data.heading}
                    </h2>
                    {data.blurb !== "" && <p className="max-w-xl text-[var(--t-text-muted)]">{data.blurb}</p>}
                </div>

                <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {products.map(product => {
                        const soldOut = product.trackStock && product.stock <= 0
                        const orderHref = data.orderMethod === "whatsapp" && whatsappDigits !== ""
                            ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hi! I'd like to order: ${product.name}`)}`
                            : data.orderMethod === "contact" ? "#contact" : ""

                        return (
                            <li
                                key={product.id}
                                className="grid content-start gap-2 overflow-hidden rounded-[var(--t-radius)]"
                                style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                            >
                                {product.imageSrc !== "" && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.imageSrc} alt={product.name} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                                )}
                                <div className="grid gap-2 p-[calc(var(--t-space)*1.25)]">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{product.name}</h3>
                                        <p className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{formatPrice(product.priceCents)}</p>
                                    </div>
                                    {product.description !== "" && (
                                        <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{product.description}</p>
                                    )}
                                    {soldOut ? (
                                        <p className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Sold out</p>
                                    ) : orderHref !== "" ? (
                                        <a
                                            href={orderHref}
                                            target={data.orderMethod === "whatsapp" ? "_blank" : undefined}
                                            rel={data.orderMethod === "whatsapp" ? "noreferrer" : undefined}
                                            className="w-fit rounded-[var(--t-radius)] px-4 py-2 text-[length:var(--t-text-s)] font-semibold"
                                            style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                                        >
                                            Order
                                        </a>
                                    ) : null}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
