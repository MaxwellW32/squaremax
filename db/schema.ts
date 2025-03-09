import { categoryName, componentDataType, fontsType, page, usedComponentLocationType, user, userUploadedImagesType, website } from "@/types";
import { relations } from "drizzle-orm";
import { timestamp, pgTable, text, primaryKey, integer, varchar, pgEnum, json, index, boolean } from "drizzle-orm/pg-core"
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
    fonts: json("fonts").$type<fontsType>().default([]).notNull(),
    globalCss: text("globalCss").default("").notNull(),
    userUploadedImages: json("userUploadedImages").$type<userUploadedImagesType>().default([]).notNull(),
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
    name: varchar("name", { length: 255 }).notNull(),
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
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),//unqieu id for component on page
    websiteId: varchar("websiteId", { length: 255 }).notNull().references(() => websites.id),
    componentId: varchar("componentId", { length: 255 }).notNull().references(() => components.id),
    css: text("css").default("").notNull(),
    order: integer("order").notNull(),
    location: json("location").$type<usedComponentLocationType>().notNull(),

    data: json("data").$type<componentDataType | null>().default(null),

}, (t) => ({
    websiteIdIndex: index("websiteIdIndex").on(t.websiteId),
}),
);
export const usedComponentsRelations = relations(usedComponents, ({ one }) => ({
    fromWebsite: one(websites, {
        fields: [usedComponents.websiteId],
        references: [websites.id],
    }),
    component: one(components, {
        fields: [usedComponents.componentId],
        references: [components.id],
    }),
}));





export const components = pgTable("components", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),//where you find it
    name: varchar("name", { length: 255 }).notNull().unique(),
    categoryId: varchar("categoryId", { length: 255 }).notNull().references(() => categories.name),
    defaultCss: text("defaultCss").notNull(),
    defaultData: json("defaultData").$type<componentDataType>().notNull(),
})
export const componentsRelations = relations(components, ({ one, many }) => ({
    componentsToStyles: many(componentsToStyles),
    usedComponents: many(usedComponents),
    category: one(categories, {
        fields: [components.categoryId],
        references: [categories.name],
    }),
}));





export const categories = pgTable("categories", {
    name: varchar("name", { length: 255 }).$type<categoryName>().notNull().unique(),
})
export const categoriesRelations = relations(categories, ({ many }) => ({
    components: many(components),
}));





export const styles = pgTable("styles", {
    name: varchar("name", { length: 255 }).notNull().unique(),
})
export const stylesRelations = relations(styles, ({ many }) => ({
    componentsToStyles: many(componentsToStyles),
}));





export const componentsToStyles = pgTable('componentsToStyles', {
    componentId: varchar("componentId", { length: 255 }).notNull().references(() => components.id),
    styleName: varchar("styleName", { length: 255 }).notNull().references(() => styles.name),
}, (t) => ({
    pk: primaryKey({ columns: [t.componentId, t.styleName] }),
}),
);
export const componentsToStylesRelations = relations(componentsToStyles, ({ one }) => ({
    componentId: one(components, {
        fields: [componentsToStyles.componentId],
        references: [components.id],
    }),
    style: one(styles, {
        fields: [componentsToStyles.styleName],
        references: [styles.name],
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





