import { templateGlobalFormDataType } from "@/types";
import { relations } from "drizzle-orm";
import { boolean, timestamp, pgTable, text, primaryKey, integer, varchar, pgEnum, json, index, } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
// typeof users.$inferSelect;

//models to make
// Users - each user manages everything
// Projects - each user creates a proect that uses a template, and stores their client info
// templates - each template has an id, githubUrl and domain it can be viewed at
// Categories - each categorizes templates
// Styles - notes styles each template matches
export const roleEnum = pgEnum("role", ['admin', 'normal']);

export const users = pgTable("users", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),

    role: roleEnum(),
    name: text("name"),
    image: text("image"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
})
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));





export const projects = pgTable("projects", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),

    templateId: varchar("templateId", { length: 255 }).references(() => templates.id),
    templateData: json("templateData").$type<templateGlobalFormDataType | null>().default(null),
},
    (table) => {
        return {
            nameIndex: index("nameIndex").on(table.name),
            projectUserIdIndex: index("projectUserIdIndex").on(table.userId),
        };
    })
export const projectsRelations = relations(projects, ({ one }) => ({
    fromUser: one(users, {
        fields: [projects.userId],
        references: [users.id]
    }),
    template: one(templates, {
        fields: [projects.templateId],
        references: [templates.id]
    }),
}));





export const templates = pgTable("templates", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    github: varchar("github", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
})
export const templatesRelations = relations(templates, ({ many }) => ({
    templatesToCategories: many(templatesToCategories),
    templatesToStyles: many(templatesToStyles),
}));





export const categories = pgTable("categories", {
    name: varchar("name", { length: 255 }).notNull().unique(),
})
export const categoriesRelations = relations(categories, ({ many }) => ({
    templatesToCategories: many(templatesToCategories),
}));





export const styles = pgTable("styles", {
    name: varchar("name", { length: 255 }).notNull().unique(),
})
export const stylesRelations = relations(styles, ({ many }) => ({
    templatesToStyles: many(templatesToStyles),
}));





export const templatesToCategories = pgTable('templatesToCategories', {
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
    categoryName: varchar("categoryName", { length: 255 }).notNull().references(() => categories.name),
}, (t) => ({
    pk: primaryKey({ columns: [t.templateId, t.categoryName] }),
}),
);
export const templatesToCategoriesRelations = relations(templatesToCategories, ({ one }) => ({
    template: one(templates, {
        fields: [templatesToCategories.templateId],
        references: [templates.id],
    }),
    category: one(categories, {
        fields: [templatesToCategories.categoryName],
        references: [categories.name],
    }),
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





