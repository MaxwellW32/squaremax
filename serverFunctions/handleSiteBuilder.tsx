"use server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantComponents, tenantPages, tenants } from "@/db/schema"
import {
    businessInfoSchema, componentCategorySchema, dataSchemaByCategory,
    defaultComponentData, siteMetaSchema,
} from "@/lib/sites/content"
import { componentStylesSchema } from "@/lib/sites/styles"
import { componentRegionSchema, pageSlugSchema, PAGE_LIMIT, siblingComponents, sortByOrder } from "@/lib/sites/site"
import { defaultVariantFor, variantsById } from "@/lib/sites/registry"
import { siteTemplatesById, instantiateTemplate } from "@/lib/sites/siteTemplates"
import { themesById, themeOverridesSchema } from "@/lib/sites/themes"
import { getOwnedTenant, bustTenant } from "@/lib/sites/owner"

//============================================================
// The website builder: owner-gated CRUD over pages and placed
// components (the instance model). Every mutation busts the
// tenant's cache tag so the public page is correct immediately.
//============================================================

//------------------------------------------------------------
// reads
//------------------------------------------------------------

export async function getSiteForOwner(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const [pages, components] = await Promise.all([
        db.query.tenantPages.findMany({ where: eq(tenantPages.tenantId, tenant.id) }),
        db.query.tenantComponents.findMany({ where: eq(tenantComponents.tenantId, tenant.id) }),
    ])
    return { tenant, pages: sortByOrder(pages), components }
}

//------------------------------------------------------------
// pages
//------------------------------------------------------------

const pageInputSchema = z.object({
    slug: pageSlugSchema,
    title: z.string().min(1).max(120),
})

export async function addSitePage(tenantId: string, input: z.infer<typeof pageInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = pageInputSchema.parse(input)

    const existing = await db.query.tenantPages.findMany({ where: eq(tenantPages.tenantId, tenant.id) })
    if (existing.length >= PAGE_LIMIT) throw new Error(`plans include up to ${PAGE_LIMIT} pages`)
    if (existing.some(page => page.slug === validated.slug)) throw new Error("a page with that address already exists")

    const [created] = await db.insert(tenantPages).values({
        tenantId: tenant.id,
        slug: validated.slug,
        title: validated.title,
        order: existing.length === 0 ? 0 : Math.max(...existing.map(page => page.order)) + 1,
    }).returning()

    bustTenant(tenant.slug, tenant.customDomain)
    return created
}

export async function updateSitePage(tenantId: string, pageId: string, input: z.infer<typeof pageInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = pageInputSchema.parse(input)

    const page = await db.query.tenantPages.findFirst({
        where: and(eq(tenantPages.id, z.string().parse(pageId)), eq(tenantPages.tenantId, tenant.id)),
    })
    if (page === undefined) throw new Error("page not found")
    if (page.slug === "" && validated.slug !== "") throw new Error("the home page keeps its address")

    const clash = await db.query.tenantPages.findFirst({
        where: and(eq(tenantPages.tenantId, tenant.id), eq(tenantPages.slug, validated.slug)),
    })
    if (clash !== undefined && clash.id !== page.id) throw new Error("a page with that address already exists")

    await db.update(tenantPages).set({ slug: validated.slug, title: validated.title }).where(eq(tenantPages.id, page.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function deleteSitePage(tenantId: string, pageId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    const page = await db.query.tenantPages.findFirst({
        where: and(eq(tenantPages.id, z.string().parse(pageId)), eq(tenantPages.tenantId, tenant.id)),
    })
    if (page === undefined) throw new Error("page not found")
    if (page.slug === "") throw new Error("the home page can't be deleted")

    //components on the page go with it (FK cascade also covers this)
    await db.delete(tenantComponents).where(and(eq(tenantComponents.tenantId, tenant.id), eq(tenantComponents.pageId, page.id)))
    await db.delete(tenantPages).where(eq(tenantPages.id, page.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//------------------------------------------------------------
// components — add / edit data / swap design / style / order / move / delete
//------------------------------------------------------------

const addComponentSchema = z.object({
    region: componentRegionSchema,
    pageId: z.string().nullable(),
    category: componentCategorySchema,
    variantId: z.string().optional(),
})

export async function addComponent(tenantId: string, input: z.infer<typeof addComponentSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = addComponentSchema.parse(input)

    if (validated.region === "main") {
        if (validated.pageId === null) throw new Error("a page is required")
        const page = await db.query.tenantPages.findFirst({
            where: and(eq(tenantPages.id, validated.pageId), eq(tenantPages.tenantId, tenant.id)),
        })
        if (page === undefined) throw new Error("page not found")
    }

    const variantId = validated.variantId ?? defaultVariantFor(validated.category).variantId
    const variant = variantsById[variantId]
    if (variant === undefined || variant.category !== validated.category) throw new Error("unknown design for this component type")

    const existing = await db.query.tenantComponents.findMany({ where: eq(tenantComponents.tenantId, tenant.id) })
    const siblings = siblingComponents(existing, {
        region: validated.region,
        pageId: validated.region === "main" ? validated.pageId : null,
        order: 0,
    })

    const [created] = await db.insert(tenantComponents).values({
        tenantId: tenant.id,
        region: validated.region,
        pageId: validated.region === "main" ? validated.pageId : null,
        order: siblings.length === 0 ? 0 : siblings[siblings.length - 1].order + 1,
        category: validated.category,
        variantId,
        data: defaultComponentData(validated.category, tenant.content.business),
        styles: { tokens: {}, css: "" },
    }).returning()

    bustTenant(tenant.slug, tenant.customDomain)
    return created
}

async function getOwnedComponent(tenantId: string, componentId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const component = await db.query.tenantComponents.findFirst({
        where: and(eq(tenantComponents.id, z.string().parse(componentId)), eq(tenantComponents.tenantId, tenant.id)),
    })
    if (component === undefined) throw new Error("component not found")
    return { tenant, component }
}

//each instance owns its data; the blob must match the row's category so
//swapping designs later never migrates anything
export async function updateComponentData(tenantId: string, componentId: string, dataRaw: unknown) {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)
    const data = dataSchemaByCategory[component.category].parse(dataRaw)
    if (data.category !== component.category) throw new Error("data does not match this component's type")

    await db.update(tenantComponents)
        .set({ data, updatedAt: new Date() })
        .where(eq(tenantComponents.id, component.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//the hot swap: change the design, keep the data (same category only)
export async function swapComponentVariant(tenantId: string, componentId: string, variantId: string) {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)

    const variant = variantsById[z.string().parse(variantId)]
    if (variant === undefined) throw new Error("unknown design")
    if (variant.category !== component.category) throw new Error("designs can only be swapped within the same component type")

    await db.update(tenantComponents)
        .set({ variantId: variant.variantId, updatedAt: new Date() })
        .where(eq(tenantComponents.id, component.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function updateComponentStyles(tenantId: string, componentId: string, stylesRaw: unknown) {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)
    const styles = componentStylesSchema.parse(stylesRaw)

    await db.update(tenantComponents)
        .set({ styles, updatedAt: new Date() })
        .where(eq(tenantComponents.id, component.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//swap order with the neighbour above/below within the same region+page
export async function moveComponent(tenantId: string, componentId: string, direction: "up" | "down") {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)
    z.enum(["up", "down"]).parse(direction)

    const all = await db.query.tenantComponents.findMany({ where: eq(tenantComponents.tenantId, tenant.id) })
    const siblings = siblingComponents(all, component)
    const index = siblings.findIndex(sibling => sibling.id === component.id)
    const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1]
    if (swapWith === undefined) return { ok: true } //already at the edge

    await db.transaction(async tx => {
        await tx.update(tenantComponents).set({ order: swapWith.order }).where(eq(tenantComponents.id, component.id))
        await tx.update(tenantComponents).set({ order: component.order }).where(eq(tenantComponents.id, swapWith.id))
    })

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

const relocateSchema = z.object({
    region: componentRegionSchema,
    pageId: z.string().nullable(),
})

//move a component to another page/region; appended at the end there
export async function relocateComponent(tenantId: string, componentId: string, targetRaw: z.infer<typeof relocateSchema>) {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)
    const target = relocateSchema.parse(targetRaw)

    if (target.region === "main") {
        if (target.pageId === null) throw new Error("a page is required")
        const page = await db.query.tenantPages.findFirst({
            where: and(eq(tenantPages.id, target.pageId), eq(tenantPages.tenantId, tenant.id)),
        })
        if (page === undefined) throw new Error("page not found")
    }

    const all = await db.query.tenantComponents.findMany({ where: eq(tenantComponents.tenantId, tenant.id) })
    const targetSiblings = siblingComponents(all, {
        region: target.region,
        pageId: target.region === "main" ? target.pageId : null,
        order: 0,
    })

    await db.update(tenantComponents).set({
        region: target.region,
        pageId: target.region === "main" ? target.pageId : null,
        order: targetSiblings.length === 0 ? 0 : targetSiblings[targetSiblings.length - 1].order + 1,
        updatedAt: new Date(),
    }).where(eq(tenantComponents.id, component.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function deleteComponent(tenantId: string, componentId: string) {
    const { tenant, component } = await getOwnedComponent(tenantId, componentId)
    await db.delete(tenantComponents).where(eq(tenantComponents.id, component.id))
    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//------------------------------------------------------------
// site-wide: template apply, theme, business profile
//------------------------------------------------------------

//replaces the whole site structure with a template copy (fresh ids per
//component). Destructive by design — the dashboard confirms first.
export async function applySiteTemplate(tenantId: string, templateId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    const template = siteTemplatesById[z.string().parse(templateId)]
    if (template === undefined) throw new Error("unknown template")

    const { pages, components } = instantiateTemplate(template, tenant.content.business)

    await db.transaction(async tx => {
        await tx.delete(tenantComponents).where(eq(tenantComponents.tenantId, tenant.id))
        await tx.delete(tenantPages).where(eq(tenantPages.tenantId, tenant.id))
        await tx.insert(tenantPages).values(pages.map(page => ({ ...page, tenantId: tenant.id })))
        await tx.insert(tenantComponents).values(components.map(component => ({ ...component, tenantId: tenant.id })))
        await tx.update(tenants).set({
            config: { ...tenant.config, themeId: template.themeId },
            updatedAt: new Date(),
        }).where(eq(tenants.id, tenant.id))
    })

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

const themeInputSchema = z.object({
    themeId: z.string().min(1),
    themeOverrides: themeOverridesSchema,
})

export async function setSiteTheme(tenantId: string, input: z.infer<typeof themeInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = themeInputSchema.parse(input)
    if (themesById[validated.themeId] === undefined) throw new Error("unknown theme")

    await db.update(tenants).set({
        config: { ...tenant.config, themeId: validated.themeId, themeOverrides: validated.themeOverrides },
        updatedAt: new Date(),
    }).where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function updateBusinessInfo(tenantId: string, businessRaw: unknown, seoRaw?: unknown) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const business = businessInfoSchema.parse(businessRaw)
    const seo = seoRaw !== undefined ? siteMetaSchema.shape.seo.parse(seoRaw) : tenant.content.seo

    await db.update(tenants).set({
        content: { schemaVersion: 2, business, seo },
        businessName: business.name,
        updatedAt: new Date(),
    }).where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}
