"use client"
import React from "react"
import {
    ComponentData, NavbarData, HeroData, TextData, ServicesData, GalleryData,
    TestimonialsData, HoursData, AnnouncementData, ContactData, BookingData,
    ProductsData, FooterData,
} from "@/lib/sites/content"

//============================================================
// Per-category data forms for the website editor. Each placed
// component edits ITS OWN data blob; the form only changes local
// state — the editor saves via updateComponentData. Shapes here
// mirror lib/sites/content.ts exactly.
//============================================================

const inputClass = "rounded-md border border-line bg-surface px-3 py-2 text-sm font-normal"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="grid gap-1 text-xs font-semibold">{label}{children}</label>
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (next: string) => void; placeholder?: string }) {
    return (
        <Field label={label}>
            <input className={inputClass} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        </Field>
    )
}

function AreaField({ label, value, onChange, rows }: { label: string; value: string; onChange: (next: string) => void; rows?: number }) {
    return (
        <Field label={label}>
            <textarea className={inputClass} rows={rows ?? 4} value={value} onChange={e => onChange(e.target.value)} />
        </Field>
    )
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-cobalt" checked={checked} onChange={e => onChange(e.target.checked)} />
            {label}
        </label>
    )
}

function ListSection({ label, onAdd, children }: { label: string; onAdd: () => void; children: React.ReactNode }) {
    return (
        <fieldset className="grid gap-2 rounded-lg border border-line bg-surface/60 p-3">
            <legend className="px-1 text-xs font-semibold">{label}</legend>
            {children}
            <button type="button" onClick={onAdd} className="w-fit rounded-md border border-ink px-2.5 py-1 text-xs font-semibold hover:bg-ink hover:text-white">
                + Add
            </button>
        </fieldset>
    )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" aria-label="Remove" onClick={onClick} className="rounded-md border border-line px-2.5 text-mist hover:text-brand">×</button>
    )
}

//generic immutable list update helpers
function setAt<T>(list: T[], index: number, next: T): T[] {
    const copy = [...list]
    copy[index] = next
    return copy
}
function removeAt<T>(list: T[], index: number): T[] {
    return list.filter((_, itemIndex) => itemIndex !== index)
}

//------------------------------------------------------------
// per-category forms
//------------------------------------------------------------

function NavbarForm({ value, onChange }: { value: NavbarData; onChange: (next: NavbarData) => void }) {
    return (
        <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Logo text (empty = business name)" value={value.logoText} onChange={logoText => onChange({ ...value, logoText })} />
                <TextField label="Logo image URL" value={value.logoImageSrc} onChange={logoImageSrc => onChange({ ...value, logoImageSrc })} />
            </div>

            <ListSection label="Menu (link like /about, #contact or a full URL)" onAdd={() => onChange({ ...value, menu: [...value.menu, { label: "", href: "", subMenu: [] }] })}>
                {value.menu.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-1.5 rounded-md border border-line/70 p-2">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                            <input className={inputClass} placeholder="Label" value={item.label}
                                onChange={e => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, label: e.target.value }) })} />
                            <input className={inputClass} placeholder="Link" value={item.href}
                                onChange={e => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, href: e.target.value }) })} />
                            <RemoveButton onClick={() => onChange({ ...value, menu: removeAt(value.menu, itemIndex) })} />
                        </div>

                        {item.subMenu.map((sub, subIndex) => (
                            <div key={subIndex} className="ml-4 grid grid-cols-[1fr_1fr_auto] gap-1.5">
                                <input className={inputClass} placeholder="Sub-item label" value={sub.label}
                                    onChange={e => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, subMenu: setAt(item.subMenu, subIndex, { ...sub, label: e.target.value }) }) })} />
                                <input className={inputClass} placeholder="Link" value={sub.href}
                                    onChange={e => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, subMenu: setAt(item.subMenu, subIndex, { ...sub, href: e.target.value }) }) })} />
                                <RemoveButton onClick={() => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, subMenu: removeAt(item.subMenu, subIndex) }) })} />
                            </div>
                        ))}
                        <button type="button" className="ml-4 w-fit text-xs font-semibold text-cobalt hover:underline"
                            onClick={() => onChange({ ...value, menu: setAt(value.menu, itemIndex, { ...item, subMenu: [...item.subMenu, { label: "", href: "" }] }) })}>
                            + Add drop-down item
                        </button>
                    </div>
                ))}
            </ListSection>

            <CheckField label="Show the action button" checked={value.showCta} onChange={showCta => onChange({ ...value, showCta })} />
            {value.showCta && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Button label (empty = smart default)" value={value.cta?.label ?? ""}
                        onChange={label => onChange({ ...value, cta: { label, href: value.cta?.href ?? "" } })} />
                    <TextField label="Button link (empty = booking/contact)" value={value.cta?.href ?? ""}
                        onChange={href => onChange({ ...value, cta: { label: value.cta?.label ?? "", href } })} />
                </div>
            )}
        </div>
    )
}

function HeroForm({ value, onChange }: { value: HeroData; onChange: (next: HeroData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading (empty = business name)" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <AreaField label="Subheading" rows={2} value={value.subheading} onChange={subheading => onChange({ ...value, subheading })} />
            <TextField label="Image URL" value={value.imageSrc} onChange={imageSrc => onChange({ ...value, imageSrc })} />
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Button label (empty = smart default)" value={value.ctaLabel} onChange={ctaLabel => onChange({ ...value, ctaLabel })} />
                <TextField label="Button link (empty = booking/contact)" value={value.ctaHref} onChange={ctaHref => onChange({ ...value, ctaHref })} />
            </div>
        </div>
    )
}

function TextForm({ value, onChange }: { value: TextData; onChange: (next: TextData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <AreaField label="Text (blank line = new paragraph)" rows={6} value={value.body} onChange={body => onChange({ ...value, body })} />
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Image URL (optional)" value={value.imageSrc} onChange={imageSrc => onChange({ ...value, imageSrc })} />
                <Field label="Image side">
                    <select className={inputClass} value={value.imageSide} onChange={e => onChange({ ...value, imageSide: e.target.value === "left" ? "left" : "right" })}>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                    </select>
                </Field>
            </div>
        </div>
    )
}

function ServicesForm({ value, onChange }: { value: ServicesData; onChange: (next: ServicesData) => void }) {
    return (
        <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
                <TextField label="Blurb" value={value.blurb} onChange={blurb => onChange({ ...value, blurb })} />
            </div>

            <ListSection label="Services (name · price · description)" onAdd={() => onChange({ ...value, items: [...value.items, { name: "", description: "", price: "", imageSrc: "" }] })}>
                {value.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-1.5 rounded-md border border-line/70 p-2">
                        <div className="grid grid-cols-[2fr_1fr_auto] gap-1.5">
                            <input className={inputClass} placeholder="Name" value={item.name}
                                onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, name: e.target.value }) })} />
                            <input className={inputClass} placeholder="Price e.g. $40" value={item.price}
                                onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, price: e.target.value }) })} />
                            <RemoveButton onClick={() => onChange({ ...value, items: removeAt(value.items, itemIndex) })} />
                        </div>
                        <input className={inputClass} placeholder="Short description (optional)" value={item.description}
                            onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, description: e.target.value }) })} />
                        <input className={inputClass} placeholder="Image URL (optional)" value={item.imageSrc}
                            onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, imageSrc: e.target.value }) })} />
                    </div>
                ))}
            </ListSection>
        </div>
    )
}

function GalleryForm({ value, onChange }: { value: GalleryData; onChange: (next: GalleryData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <ListSection label="Images" onAdd={() => onChange({ ...value, images: [...value.images, { src: "", alt: "", caption: "" }] })}>
                {value.images.map((image, imageIndex) => (
                    <div key={imageIndex} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-1.5">
                        <input className={inputClass} placeholder="Image URL" value={image.src}
                            onChange={e => onChange({ ...value, images: setAt(value.images, imageIndex, { ...image, src: e.target.value }) })} />
                        <input className={inputClass} placeholder="Alt text" value={image.alt}
                            onChange={e => onChange({ ...value, images: setAt(value.images, imageIndex, { ...image, alt: e.target.value }) })} />
                        <input className={inputClass} placeholder="Caption" value={image.caption}
                            onChange={e => onChange({ ...value, images: setAt(value.images, imageIndex, { ...image, caption: e.target.value }) })} />
                        <RemoveButton onClick={() => onChange({ ...value, images: removeAt(value.images, imageIndex) })} />
                    </div>
                ))}
            </ListSection>
        </div>
    )
}

function TestimonialsForm({ value, onChange }: { value: TestimonialsData; onChange: (next: TestimonialsData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <ListSection label="Quotes" onAdd={() => onChange({ ...value, items: [...value.items, { quote: "", author: "", role: "" }] })}>
                {value.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-1.5 rounded-md border border-line/70 p-2">
                        <textarea className={inputClass} rows={2} placeholder="Quote" value={item.quote}
                            onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, quote: e.target.value }) })} />
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                            <input className={inputClass} placeholder="Name" value={item.author}
                                onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, author: e.target.value }) })} />
                            <input className={inputClass} placeholder="Role (optional)" value={item.role}
                                onChange={e => onChange({ ...value, items: setAt(value.items, itemIndex, { ...item, role: e.target.value }) })} />
                            <RemoveButton onClick={() => onChange({ ...value, items: removeAt(value.items, itemIndex) })} />
                        </div>
                    </div>
                ))}
            </ListSection>
        </div>
    )
}

function HoursForm({ value, onChange }: { value: HoursData; onChange: (next: HoursData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <ListSection label="Rows (label · hours)" onAdd={() => onChange({ ...value, entries: [...value.entries, { label: "", hours: "" }] })}>
                {value.entries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                        <input className={inputClass} placeholder="Mon – Fri" value={entry.label}
                            onChange={e => onChange({ ...value, entries: setAt(value.entries, entryIndex, { ...entry, label: e.target.value }) })} />
                        <input className={inputClass} placeholder="9:00am – 5:00pm" value={entry.hours}
                            onChange={e => onChange({ ...value, entries: setAt(value.entries, entryIndex, { ...entry, hours: e.target.value }) })} />
                        <RemoveButton onClick={() => onChange({ ...value, entries: removeAt(value.entries, entryIndex) })} />
                    </div>
                ))}
            </ListSection>
        </div>
    )
}

function AnnouncementForm({ value, onChange }: { value: AnnouncementData; onChange: (next: AnnouncementData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Announcement text" value={value.text} onChange={text => onChange({ ...value, text })} />
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Link (optional)" value={value.href} onChange={href => onChange({ ...value, href })} />
                <TextField label="Link label" value={value.linkLabel} onChange={linkLabel => onChange({ ...value, linkLabel })} />
            </div>
        </div>
    )
}

function ContactForm({ value, onChange }: { value: ContactData; onChange: (next: ContactData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <AreaField label="Blurb" rows={2} value={value.blurb} onChange={blurb => onChange({ ...value, blurb })} />
            <CheckField label="Show the message form" checked={value.showMessageForm} onChange={showMessageForm => onChange({ ...value, showMessageForm })} />
            <CheckField label="Show phone / email / address (from Business info)" checked={value.showDetails} onChange={showDetails => onChange({ ...value, showDetails })} />
        </div>
    )
}

function BookingForm({ value, onChange }: { value: BookingData; onChange: (next: BookingData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
            <AreaField label="Blurb" rows={2} value={value.blurb} onChange={blurb => onChange({ ...value, blurb })} />
            <ListSection label="Bookable services (name · minutes · price)" onAdd={() => onChange({ ...value, services: [...value.services, { name: "", durationMinutes: 30, price: "" }] })}>
                {value.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-1.5">
                        <input className={inputClass} placeholder="Name" value={service.name}
                            onChange={e => onChange({ ...value, services: setAt(value.services, serviceIndex, { ...service, name: e.target.value }) })} />
                        <input className={inputClass} type="number" min={5} step={5} value={service.durationMinutes}
                            onChange={e => onChange({ ...value, services: setAt(value.services, serviceIndex, { ...service, durationMinutes: Number(e.target.value) || 30 }) })} />
                        <input className={inputClass} placeholder="$40" value={service.price}
                            onChange={e => onChange({ ...value, services: setAt(value.services, serviceIndex, { ...service, price: e.target.value }) })} />
                        <RemoveButton onClick={() => onChange({ ...value, services: removeAt(value.services, serviceIndex) })} />
                    </div>
                ))}
            </ListSection>
            <p className="text-xs text-mist">Times customers can pick come from your weekly availability (Bookings tab).</p>
        </div>
    )
}

function ProductsForm({ value, onChange }: { value: ProductsData; onChange: (next: ProductsData) => void }) {
    return (
        <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Heading" value={value.heading} onChange={heading => onChange({ ...value, heading })} />
                <TextField label="Blurb" value={value.blurb} onChange={blurb => onChange({ ...value, blurb })} />
            </div>
            <Field label="How customers order">
                <select className={inputClass} value={value.orderMethod}
                    onChange={e => onChange({ ...value, orderMethod: e.target.value === "contact" ? "contact" : e.target.value === "none" ? "none" : "whatsapp" })}>
                    <option value="whatsapp">WhatsApp (uses your Business info number)</option>
                    <option value="contact">Contact form</option>
                    <option value="none">Display only</option>
                </select>
            </Field>
            <p className="text-xs text-mist">The products themselves live in the Store tab — this section just shows them.</p>
        </div>
    )
}

function FooterForm({ value, onChange }: { value: FooterData; onChange: (next: FooterData) => void }) {
    return (
        <div className="grid gap-3">
            <TextField label="Footer text (empty = © business name)" value={value.text} onChange={text => onChange({ ...value, text })} />
            <ListSection label="Links" onAdd={() => onChange({ ...value, links: [...value.links, { label: "", href: "" }] })}>
                {value.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                        <input className={inputClass} placeholder="Label" value={link.label}
                            onChange={e => onChange({ ...value, links: setAt(value.links, linkIndex, { ...link, label: e.target.value }) })} />
                        <input className={inputClass} placeholder="Link" value={link.href}
                            onChange={e => onChange({ ...value, links: setAt(value.links, linkIndex, { ...link, href: e.target.value }) })} />
                        <RemoveButton onClick={() => onChange({ ...value, links: removeAt(value.links, linkIndex) })} />
                    </div>
                ))}
            </ListSection>
            <CheckField label="Show contact details" checked={value.showContact} onChange={showContact => onChange({ ...value, showContact })} />
            <CheckField label="Show social links" checked={value.showSocials} onChange={showSocials => onChange({ ...value, showSocials })} />
        </div>
    )
}

//------------------------------------------------------------
// the switch
//------------------------------------------------------------

export default function ComponentDataForm({ value, onChange }: { value: ComponentData; onChange: (next: ComponentData) => void }) {
    switch (value.category) {
        case "navbar": return <NavbarForm value={value} onChange={onChange} />
        case "hero": return <HeroForm value={value} onChange={onChange} />
        case "text": return <TextForm value={value} onChange={onChange} />
        case "services": return <ServicesForm value={value} onChange={onChange} />
        case "gallery": return <GalleryForm value={value} onChange={onChange} />
        case "testimonials": return <TestimonialsForm value={value} onChange={onChange} />
        case "hours": return <HoursForm value={value} onChange={onChange} />
        case "announcement": return <AnnouncementForm value={value} onChange={onChange} />
        case "contact": return <ContactForm value={value} onChange={onChange} />
        case "booking": return <BookingForm value={value} onChange={onChange} />
        case "products": return <ProductsForm value={value} onChange={onChange} />
        case "footer": return <FooterForm value={value} onChange={onChange} />
    }
}
