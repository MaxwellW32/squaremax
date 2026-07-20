import { fontsType, usedComponentLocationType, user, userUploadedImagesType, authorisedUserType } from "@/types";
import { categoryName, templateDataType } from "@/types/templateDataTypes";
import { SiteMeta, ComponentData, ComponentCategory } from "@/lib/sites/content";
import { SiteConfig } from "@/lib/sites/config";
import { ComponentRegion } from "@/lib/sites/site";
import { ComponentStyles } from "@/lib/sites/styles";
import { AddonId } from "@/lib/sites/addons";
import { relations } from "drizzle-orm";
import { timestamp, pgTable, text, primaryKey, integer, varchar, pgEnum, json, index, boolean, uniqueIndex } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
// typeof users.$inferSelect;
// typeof users.$inferInsert 

// take from types array
export const roleEnum = pgEnum("role", ["admin"]);

export const users = pgTable("users", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userGithubTokens: json("userGithubTokens").notNull().$type<user["userGithubTokens"]>().default([]),

    role: roleEnum(),
    name: text("name"),
    image: text("image"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
})
export const usersRelations = relations(users, ({ many }) => ({
    websites: many(websites),
}));





export const websites = pgTable("websites", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).default("").notNull(),
    description: text("description").default("").notNull(),
    fonts: json("fonts").$type<fontsType[]>().default([]).notNull(),
    globalCss: text("globalCss").default("").notNull(),
    userUploadedImages: json("userUploadedImages").$type<userUploadedImagesType>().default([]).notNull(),
    authorisedUsers: json("authorisedUsers").$type<authorisedUserType[]>().default([]).notNull(),
    dateAdded: timestamp("dateAdded", { mode: "date" }).defaultNow().notNull(),
},
    (table) => {
        return {
            websiteUserIdIndex: index("websiteUserIdIndex").on(table.userId),
        };
    })
export const websiteRelations = relations(websites, ({ one, many }) => ({
    fromUser: one(users, {
        fields: [websites.userId],
        references: [users.id]
    }),
    pages: many(pages),
    usedComponents: many(usedComponents),
}));





export const pages = pgTable("pages", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    link: varchar("link", { length: 255 }).notNull(),
    websiteId: varchar("websiteId", { length: 255 }).notNull().references(() => websites.id),
},
    (t) => {
        return {
            pageWebsiteIdIndex: index("pageWebsiteIdIndex").on(t.websiteId),
        };
    })
export const pageRelations = relations(pages, ({ one, many }) => ({
    fromWebsite: one(websites, {
        fields: [pages.websiteId],
        references: [websites.id],
    })
}));





export const usedComponents = pgTable('usedComponents', {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),//unqieu id for template
    websiteId: varchar("websiteId", { length: 255 }).notNull().references(() => websites.id),
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
    css: text("css").default("").notNull(),
    order: integer("order").notNull(),
    location: json("location").$type<usedComponentLocationType>().notNull(),
    data: json("data").$type<templateDataType>().notNull(),

}, (t) => ({
    websiteIdIndex: index("websiteIdIndex").on(t.websiteId),
    templateIdIndex: index("templateIdIndex").on(t.templateId),
}),
);
export const usedComponentsRelations = relations(usedComponents, ({ one }) => ({
    fromWebsite: one(websites, {
        fields: [usedComponents.websiteId],
        references: [websites.id],
    }),
    template: one(templates, {
        fields: [usedComponents.templateId],
        references: [templates.id],
    }),
}));





export const templates = pgTable("templates", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),//where you find it
    name: varchar("name", { length: 255 }).notNull().unique(),
    uses: integer("uses").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    categoryId: varchar("categoryId", { length: 255 }).notNull().references(() => categories.name),
    defaultCss: text("defaultCss").notNull(),
    defaultData: json("defaultData").$type<templateDataType>().notNull(),
}, (t) => ({
    templateNameIndex: index("templateNameIndex").on(t.name),
    templateUsesIndex: index("templateUsesIndex").on(t.uses),
    templateLikesIndex: index("templateLikesIndex").on(t.likes),
}))
export const templatesRelations = relations(templates, ({ one, many }) => ({
    templatesToStyles: many(templatesToStyles),
    usedComponents: many(usedComponents),
    category: one(categories, {
        fields: [templates.categoryId],
        references: [categories.name],
    }),
}));





export const categories = pgTable("categories", {
    name: varchar("name", { length: 255 }).$type<categoryName>().notNull().unique(),
})
export const categoriesRelations = relations(categories, ({ many }) => ({
    templates: many(templates),
}));





export const styles = pgTable("styles", {
    name: varchar("name", { length: 255 }).notNull().unique(),
})
export const stylesRelations = relations(styles, ({ many }) => ({
    templateToStyles: many(templatesToStyles),
}));





export const templatesToStyles = pgTable('templatesToStyles', {
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
    styleName: varchar("styleName", { length: 255 }).notNull().references(() => styles.name),
}, (t) => ({
    pk: primaryKey({ columns: [t.templateId, t.styleName] }),
}),
);
export const templatesToStylesRelations = relations(templatesToStyles, ({ one }) => ({
    template: one(templates, {
        fields: [templatesToStyles.templateId],
        references: [templates.id],
    }),
    style: one(styles, {
        fields: [templatesToStyles.styleName],
        references: [styles.name],
    }),
}));


































//============================================================
// Squaremax Sites — multi-tenant hosted product.
// Effective status is COMPUTED from currentPeriodEnd at read
// time (prepaid periods, cheers billing pattern); the stored
// status only distinguishes draft/cancelled from live tenants.
//============================================================

export const tenantStatusEnum = pgEnum("tenantStatus", ["draft", "live", "cancelled"]);
export const tenantPaymentStatusEnum = pgEnum("tenantPaymentStatus", ["pending", "succeeded", "failed", "refunded"]);
export const tenantBookingStatusEnum = pgEnum("tenantBookingStatus", ["pending", "confirmed", "cancelled"]);

export const tenants = pgTable("tenants", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 63 }).notNull().unique(),
    businessName: varchar("businessName", { length: 160 }).notNull(),
    ownerUserId: varchar("ownerUserId", { length: 255 }).notNull().references(() => users.id),
    status: tenantStatusEnum("status").default("draft").notNull(),
    //paid-until date; live tenants past this (+ grace) render the paused page
    currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
    //custom-domain add-on: apex/subdomain pointed at the VPS (Caddy handles TLS)
    customDomain: varchar("customDomain", { length: 255 }).unique(),
    //site-wide meta: business profile + SEO (page structure lives in
    //tenantPages/tenantComponents — the instance model)
    content: json("content").$type<SiteMeta>().notNull(),
    config: json("config").$type<SiteConfig>().notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantSlugIndex: uniqueIndex("tenantSlugIndex").on(t.slug),
    tenantOwnerIndex: index("tenantOwnerIndex").on(t.ownerUserId),
}));
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
    owner: one(users, { fields: [tenants.ownerUserId], references: [users.id] }),
    payments: many(tenantPayments),
    bookings: many(tenantBookings),
    messages: many(tenantMessages),
    availability: many(tenantAvailability),
    sitePages: many(tenantPages),
    siteComponents: many(tenantComponents),
    customers: many(tenantCustomers),
    products: many(tenantProducts),
    sales: many(tenantSales),
}));

//============================================================
// Instance model: a tenant site is pages + placed components.
// Each component row is ONE instance with a unique id — its
// category fixes the data shape, its variantId picks the visual
// design (hot-swappable within the category), and its data blob
// belongs to this instance alone.
//============================================================

export const tenantPages = pgTable("tenantPages", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 40 }).default("").notNull(), //"" = home
    title: varchar("title", { length: 120 }).notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantPageTenantIndex: index("tenantPageTenantIndex").on(t.tenantId),
    tenantPageSlugIndex: uniqueIndex("tenantPageSlugIndex").on(t.tenantId, t.slug),
}));
export const tenantPagesRelations = relations(tenantPages, ({ one, many }) => ({
    tenant: one(tenants, { fields: [tenantPages.tenantId], references: [tenants.id] }),
    components: many(tenantComponents),
}));

export const componentRegionEnum = pgEnum("componentRegion", ["header", "main", "footer"]);

export const tenantComponents = pgTable("tenantComponents", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    //header/footer render on every page; main components belong to one page
    region: componentRegionEnum("region").default("main").$type<ComponentRegion>().notNull(),
    pageId: varchar("pageId", { length: 255 }).references(() => tenantPages.id, { onDelete: "cascade" }),
    order: integer("order").default(0).notNull(),
    category: varchar("category", { length: 40 }).$type<ComponentCategory>().notNull(),
    variantId: varchar("variantId", { length: 80 }).notNull(),
    data: json("data").$type<ComponentData>().notNull(),
    styles: json("styles").$type<ComponentStyles>().default({ tokens: {}, css: "" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantComponentTenantIndex: index("tenantComponentTenantIndex").on(t.tenantId),
    tenantComponentPageIndex: index("tenantComponentPageIndex").on(t.pageId),
}));
export const tenantComponentsRelations = relations(tenantComponents, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantComponents.tenantId], references: [tenants.id] }),
    page: one(tenantPages, { fields: [tenantComponents.pageId], references: [tenantPages.id] }),
}));

//============================================================
// Tenant customers — end users of a CLIENT's site, scoped to
// that tenant. The same person on two tenant sites is two rows;
// businesses own their own customer lists (importable between
// tenants of one owner).
//============================================================

export const tenantCustomers = pgTable("tenantCustomers", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 160 }).notNull(),
    name: varchar("name", { length: 120 }).default("").notNull(),
    phone: varchar("phone", { length: 40 }).default("").notNull(),
    passwordHash: text("passwordHash").notNull(),
    notifyEmail: boolean("notifyEmail").default(true).notNull(),
    notifyWhatsapp: boolean("notifyWhatsapp").default(false).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantCustomerTenantIndex: index("tenantCustomerTenantIndex").on(t.tenantId),
    tenantCustomerEmailIndex: uniqueIndex("tenantCustomerEmailIndex").on(t.tenantId, t.email),
}));
export const tenantCustomersRelations = relations(tenantCustomers, ({ one, many }) => ({
    tenant: one(tenants, { fields: [tenantCustomers.tenantId], references: [tenants.id] }),
    sessions: many(tenantCustomerSessions),
}));

export const tenantCustomerSessions = pgTable("tenantCustomerSessions", {
    token: varchar("token", { length: 255 }).primaryKey(),
    customerId: varchar("customerId", { length: 255 }).notNull().references(() => tenantCustomers.id, { onDelete: "cascade" }),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
    tenantCustomerSessionCustomerIndex: index("tenantCustomerSessionCustomerIndex").on(t.customerId),
}));
export const tenantCustomerSessionsRelations = relations(tenantCustomerSessions, ({ one }) => ({
    customer: one(tenantCustomers, { fields: [tenantCustomerSessions.customerId], references: [tenantCustomers.id] }),
}));

//============================================================
// Inventory add-on: products with stock + tax, and recorded
// sales (multi-item receipts). Money is integer cents; tax rate
// is basis points (850 = 8.5%).
//============================================================

export const tenantProducts = pgTable("tenantProducts", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 140 }).notNull(),
    description: text("description").default("").notNull(),
    priceCents: integer("priceCents").default(0).notNull(),
    taxRateBps: integer("taxRateBps").default(0).notNull(),
    stock: integer("stock").default(0).notNull(),
    trackStock: boolean("trackStock").default(true).notNull(),
    imageSrc: text("imageSrc").default("").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantProductTenantIndex: index("tenantProductTenantIndex").on(t.tenantId),
}));
export const tenantProductsRelations = relations(tenantProducts, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantProducts.tenantId], references: [tenants.id] }),
}));

export type SaleItem = {
    productId: string
    name: string //snapshot — survives product rename/delete
    qty: number
    unitPriceCents: number
    taxCents: number
}

export const tenantSales = pgTable("tenantSales", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    items: json("items").$type<SaleItem[]>().notNull(),
    subtotalCents: integer("subtotalCents").notNull(),
    taxCents: integer("taxCents").notNull(),
    totalCents: integer("totalCents").notNull(),
    customerId: varchar("customerId", { length: 255 }).references(() => tenantCustomers.id, { onDelete: "set null" }),
    customerName: varchar("customerName", { length: 120 }).default("").notNull(),
    note: text("note").default("").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantSaleTenantIndex: index("tenantSaleTenantIndex").on(t.tenantId),
    tenantSaleDateIndex: index("tenantSaleDateIndex").on(t.tenantId, t.createdAt),
}));
export const tenantSalesRelations = relations(tenantSales, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantSales.tenantId], references: [tenants.id] }),
}));

//announcement blasts sent through the notifications add-on (history/audit)
export const tenantAnnouncements = pgTable("tenantAnnouncements", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 200 }).notNull(),
    body: text("body").notNull(),
    sentTo: integer("sentTo").default(0).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantAnnouncementTenantIndex: index("tenantAnnouncementTenantIndex").on(t.tenantId),
}));
export const tenantAnnouncementsRelations = relations(tenantAnnouncements, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantAnnouncements.tenantId], references: [tenants.id] }),
}));

export const tenantPayments = pgTable("tenantPayments", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id),
    amountCents: integer("amountCents").notNull(),
    status: tenantPaymentStatusEnum("status").default("pending").notNull(),
    gatewayTransactionId: text("gatewayTransactionId"),
    //the span this prepaid charge buys
    periodStart: timestamp("periodStart", { mode: "date" }),
    periodEnd: timestamp("periodEnd", { mode: "date" }),
    //add-ons included in this charge, for the audit trail
    addonsSnapshot: json("addonsSnapshot").$type<AddonId[]>().default([]).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantPaymentTenantIndex: index("tenantPaymentTenantIndex").on(t.tenantId),
}));
export const tenantPaymentsRelations = relations(tenantPayments, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantPayments.tenantId], references: [tenants.id] }),
}));

export const tenantBookings = pgTable("tenantBookings", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id),
    serviceName: varchar("serviceName", { length: 120 }).notNull(),
    customerName: varchar("customerName", { length: 120 }).notNull(),
    customerEmail: varchar("customerEmail", { length: 160 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 40 }).default("").notNull(),
    //set when the booker was signed in to a customer account on this tenant
    customerId: varchar("customerId", { length: 255 }),
    startsAt: timestamp("startsAt", { mode: "date" }).notNull(),
    endsAt: timestamp("endsAt", { mode: "date" }).notNull(),
    status: tenantBookingStatusEnum("status").default("pending").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantBookingTenantIndex: index("tenantBookingTenantIndex").on(t.tenantId),
    tenantBookingStartIndex: index("tenantBookingStartIndex").on(t.tenantId, t.startsAt),
}));
export const tenantBookingsRelations = relations(tenantBookings, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantBookings.tenantId], references: [tenants.id] }),
}));

//weekly opening template for the booking add-on: one row per weekday
export const tenantAvailability = pgTable("tenantAvailability", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id),
    dayOfWeek: integer("dayOfWeek").notNull(), //0 = Sunday … 6 = Saturday
    openTime: varchar("openTime", { length: 5 }).notNull(), //"09:00"
    closeTime: varchar("closeTime", { length: 5 }).notNull(), //"17:00"
    slotMinutes: integer("slotMinutes").default(30).notNull(),
}, (t) => ({
    tenantAvailabilityTenantIndex: index("tenantAvailabilityTenantIndex").on(t.tenantId),
    tenantAvailabilityDayIndex: uniqueIndex("tenantAvailabilityDayIndex").on(t.tenantId, t.dayOfWeek),
}));
export const tenantAvailabilityRelations = relations(tenantAvailability, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantAvailability.tenantId], references: [tenants.id] }),
}));

export const tenantMessages = pgTable("tenantMessages", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar("tenantId", { length: 255 }).notNull().references(() => tenants.id),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    body: text("body").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    tenantMessageTenantIndex: index("tenantMessageTenantIndex").on(t.tenantId),
}));
export const tenantMessagesRelations = relations(tenantMessages, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantMessages.tenantId], references: [tenants.id] }),
}));

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
)





