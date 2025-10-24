import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // User role: 'artist' or 'label'
  role: varchar("role", { length: 20 }),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Artist profiles table
export const artistProfiles = pgTable("artist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  genres: text("genres").array().notNull().default(sql`ARRAY[]::text[]`),
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  portfolioSamples: text("portfolio_samples").array().notNull().default(sql`ARRAY[]::text[]`),
  socialLinks: jsonb("social_links"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artistProfilesRelations = relations(artistProfiles, ({ one }) => ({
  user: one(users, {
    fields: [artistProfiles.userId],
    references: [users.id],
  }),
}));

export const insertArtistProfileSchema = createInsertSchema(artistProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArtistProfile = z.infer<typeof insertArtistProfileSchema>;
export type ArtistProfile = typeof artistProfiles.$inferSelect;

// Label profiles table
export const labelProfiles = pgTable("label_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  about: text("about"),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const labelProfilesRelations = relations(labelProfiles, ({ one }) => ({
  user: one(users, {
    fields: [labelProfiles.userId],
    references: [users.id],
  }),
}));

export const insertLabelProfileSchema = createInsertSchema(labelProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLabelProfile = z.infer<typeof insertLabelProfileSchema>;
export type LabelProfile = typeof labelProfiles.$inferSelect;

// Opportunities table (posted by labels)
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labelId: varchar("label_id").notNull().references(() => labelProfiles.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull().default(sql`ARRAY[]::text[]`),
  genres: text("genres").array().notNull().default(sql`ARRAY[]::text[]`),
  compensation: varchar("compensation", { length: 255 }),
  deadline: timestamp("deadline"),
  status: varchar("status", { length: 50 }).notNull().default('open'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  label: one(labelProfiles, {
    fields: [opportunities.labelId],
    references: [labelProfiles.id],
  }),
}));

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

// Projects table (posted by artists)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull().references(() => artistProfiles.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  mediaUrl: varchar("media_url", { length: 500 }),
  genres: text("genres").array().notNull().default(sql`ARRAY[]::text[]`),
  collaborators: integer("collaborators").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  artist: one(artistProfiles, {
    fields: [projects.artistId],
    references: [artistProfiles.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Applications table (artists applying to opportunities)
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  artistId: varchar("artist_id").notNull().references(() => artistProfiles.id, { onDelete: 'cascade' }),
  coverLetter: text("cover_letter"),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
  artist: one(artistProfiles, {
    fields: [applications.artistId],
    references: [artistProfiles.id],
  }),
}));

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Conversations table (1-to-1 messaging between users)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
}));

export type Conversation = typeof conversations.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  read: integer("read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 50 }).notNull(), // 'application_submitted', 'application_accepted', 'application_rejected', 'new_message', 'new_opportunity'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: varchar("related_id"), // ID of related entity (application, message, opportunity)
  read: integer("read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
