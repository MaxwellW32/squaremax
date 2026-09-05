import React from "react"
import { ProductsData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"
import { formatMoney } from "@/lib/sites/saleMath"
import { MissingHint, SectionHeading } from "./shared"
import ShopOrderForm from "@/components/sites/islands/ShopOrderForm"

//variant: products.grid — the storefront for the store add-on. Products come
//from the tenant's product table (ctx.products, loaded server-side); this
//instance's data controls the heading and HOW customers buy: a real order
//form (default), a WhatsApp deep link, the contact form, or display only.
export function ProductsGrid({ data, ctx }: SectionProps<ProductsData>) {
    if (!ctx.enabledAddons.includes("inventory")) return null
    const products = ctx.products ?? []
    if (products.length === 0 && ctx.preview !== true) return null

    //rows saved before these fields existed read as the schema defaults
    const orderMethod = data.orderMethod ?? "order"
    const settings = {
        allowPickup: data.allowPickup !== false,
        allowDelivery: data.allowDelivery === true,
        deliveryNote: data.deliveryNote ?? "",
        orderNote: data.orderNote ?? "",
    }
    const whatsappDigits = ctx.business.whatsapp.replace(/\D/g, "")

    return (
        <section id="shop" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {products.length === 0 && <MissingHint preview={ctx.preview}>Add products in the Store tab — they show here</MissingHint>}

                {products.length > 0 && orderMethod === "order" ? (
                    <ShopOrderForm slug={ctx.slug} businessName={ctx.business.name} products={products} settings={settings} preview={ctx.preview === true} />
                ) : products.length > 0 ? (
                    <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => {
                            const soldOut = product.trackStock && product.stock <= 0
                            const orderHref = orderMethod === "whatsapp" && whatsappDigits !== ""
                                ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hi! I'd like to order: ${product.name}`)}`
                                : orderMethod === "contact" ? "#contact" : ""

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
                                            <p className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{formatMoney(product.priceCents)}</p>
                                        </div>
                                        {product.description !== "" && (
                                            <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{product.description}</p>
                                        )}
                                        {soldOut ? (
                                            <p className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Sold out</p>
                                        ) : orderHref !== "" ? (
                                            <a
                                                href={orderHref}
                                                target={orderMethod === "whatsapp" ? "_blank" : undefined}
                                                rel={orderMethod === "whatsapp" ? "noreferrer" : undefined}
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
                ) : null}
            </div>
        </section>
    )
}
