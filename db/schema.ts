import { fontsType, usedComponentLocationType, userType, userUploadedImagesType, authorisedUserType, roleOptions, templateCategoryNameOptions, templateTypeType, elementType } from "@/types";
import { relations } from "drizzle-orm";
import { timestamp, pgTable, primaryKey, integer, text, pgEnum, json, index, boolean } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
// typeof users.$inferSelect;
// typeof users.$inferInsert 

export const roleEnum = pgEnum("role", roleOptions);

export const users = pgTable("users", {
    //defaults
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userGithubTokens: json("userGithubTokens").notNull().$type<userType["userGithubTokens"]>().default([]),

    //regular

    //null
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
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    dateAdded: timestamp("dateAdded", { mode: "date" }).defaultNow().notNull(),
    title: text("title").default("").notNull(),
    fonts: json("fonts").$type<fontsType[]>().default([]).notNull(),
    description: text("description").default("").notNull(),
    globalCss: text("globalCss").default("").notNull(),
    userUploadedImages: json("userUploadedImages").$type<userUploadedImagesType>().default([]).notNull(),
    authorisedUsers: json("authorisedUsers").$type<authorisedUserType[]>().default([]).notNull(),

    userId: text("userId").notNull().references(() => users.id),
    name: text("name").notNull(),
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
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    link: text("link").notNull(),
    websiteId: text("websiteId").notNull().references(() => websites.id),
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




export const templates = pgTable("templates", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    categoryId: text("categoryId").notNull().references(() => categories.id),
    name: text("name").notNull().unique(),
    type: json("type").$type<templateTypeType>().notNull(),
    elements: json("elements").$type<elementType[]>().notNull(),
    uses: integer("uses").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
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




export const usedComponents = pgTable('usedComponents', {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    websiteId: text("websiteId").notNull().references(() => websites.id),
    templateId: text("templateId").notNull().references(() => templates.id),
    type: json("type").$type<templateTypeType>().notNull(),
    elements: json("elements").$type<elementType[]>().notNull(),
    location: json("location").$type<usedComponentLocationType>().notNull(),
    order: integer("order").notNull(),
    showMultiple: boolean("showMultiple").notNull(),

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





export const categoryNameEnum = pgEnum("categoryName", templateCategoryNameOptions);

export const categories = pgTable("categories", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: categoryNameEnum().notNull(),
})
export const categoriesRelations = relations(categories, ({ many }) => ({
    templates: many(templates),
}));





export const styles = pgTable("styles", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique(),
})
export const stylesRelations = relations(styles, ({ many }) => ({
    templateToStyles: many(templatesToStyles),
}));





export const templatesToStyles = pgTable('templatesToStyles', {
    templateId: text("templateId").notNull().references(() => templates.id),
    styleId: text("styleId").notNull().references(() => styles.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.templateId, t.styleId] }),
}),
);
export const templatesToStylesRelations = relations(templatesToStyles, ({ one }) => ({
    template: one(templates, {
        fields: [templatesToStyles.templateId],
        references: [templates.id],
    }),
    style: one(styles, {
        fields: [templatesToStyles.styleId],
        references: [styles.id],
    }),
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
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
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
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [verificationToken.identifier, verificationToken.token],
            }),
        },
    ]
)
export const authenticators = pgTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: boolean("credentialBackedUp").notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
)