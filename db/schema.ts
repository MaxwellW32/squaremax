import { relations } from "drizzle-orm";
import { boolean, timestamp, pgTable, text, primaryKey, integer, varchar, } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
// typeof users.$inferSelect;

//models to make
// Users - each user manages everything
// Projects - each user creates a proect that uses a template, and stores their client info
// templates - each template has an id, githubUrl and domain it can be viewed at
// Categories - each categorizes templates
// Styles - notes styles each template matches

export const users = pgTable("user", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),

    name: text("name"),
    image: text("image"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
})
export const userRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));





export const projects = pgTable("projects", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
})
export const projectRelations = relations(projects, ({ one }) => ({
    fromUser: one(users, {
        fields: [projects.userId],
        references: [users.id]
    }),
}));





export const templates = pgTable("templates", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }),
    github: varchar("github", { length: 255 }),
    url: varchar("url", { length: 255 }),
})
export const templateRelations = relations(templates, ({ many }) => ({
    userTemplatesToCategories: many(userTemplatesToCategories),
    userTemplatesToStyles: many(userTemplatesToStyles),
}));





export const categories = pgTable("categories", {
    name: varchar("name", { length: 255 }).unique(),
})





export const styles = pgTable("styles", {
    name: varchar("name", { length: 255 }).unique(),
})




export const userTemplatesToCategories = pgTable('userTemplatesToCategories', {
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
    categoryName: varchar("categoryName", { length: 255 }).notNull().references(() => categories.name),
}, (t) => ({
    pk: primaryKey({ columns: [t.templateId, t.categoryName] }),
}),
);
export const userTemplatesToCategoriesRelations = relations(userTemplatesToCategories, ({ one }) => ({
    template: one(templates, {
        fields: [userTemplatesToCategories.templateId],
        references: [templates.id],
    }),
    category: one(categories, {
        fields: [userTemplatesToCategories.categoryName],
        references: [categories.name],
    }),
}));




export const userTemplatesToStyles = pgTable('userTemplatesToStyles', {
    templateId: varchar("templateId", { length: 255 }).notNull().references(() => templates.id),
    styleName: varchar("styleName", { length: 255 }).notNull().references(() => styles.name),
}, (t) => ({
    pk: primaryKey({ columns: [t.templateId, t.styleName] }),
}),
);
export const userTemplatesToStylesRelations = relations(userTemplatesToStyles, ({ one }) => ({
    template: one(templates, {
        fields: [userTemplatesToStyles.templateId],
        references: [templates.id],
    }),
    category: one(styles, {
        fields: [userTemplatesToStyles.styleName],
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





